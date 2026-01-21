# Authentication Implementation Plan

## Overview

This document outlines the implementation plan for authentication and routing logic in the TC-VSME TanStack Start application, adapting the three-layer authentication approach from the reference Next.js implementation.

### Current Stack
- **Frontend Framework**: TanStack Start (React)
- **Authentication Provider**: Clerk (`@clerk/tanstack-react-start`)
- **Database**: Convex
- **Testing**: Vitest + Testing Library

### Reference Implementation
- Next.js + Clerk + Encore.ts + MongoDB

### Three-Layer Authentication Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Layer 1: Clerk (Identity)                   │
│  • User registration & login                                    │
│  • JWT token issuance                                          │
│  • Organization management                                      │
│  • User/Org publicMetadata storage                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│     Layer 2: TanStack Start Global Middleware (Access Control)  │
│  • Global request middleware in src/start.ts                   │
│  • Fast auth checks using Clerk session (no DB calls)          │
│  • Route-based protection (/app/* requires auth)               │
│  • Automatic redirects for user journey                        │
│  • Context passing to downstream handlers                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              Layer 3: Convex (Data Layer Security)              │
│  • JWT token verification                                       │
│  • Organization-scoped data access                             │
│  • Multi-tenant isolation                                      │
└─────────────────────────────────────────────────────────────────┘
```

### Middleware Architecture

The auth middleware integrates with the existing Clerk middleware in `src/start.ts`:

```
Request → clerkMiddleware() → authMiddleware → Route Handler
              │                    │
              ▼                    ▼
         Parses JWT           Checks route
         Sets session         Redirects if needed
                              Passes context
```

**Key Principle**: The global middleware runs on ALL requests, so it must be fast.
- ✅ Check `request.url` path
- ✅ Use Clerk's `auth()` session data (already parsed by clerkMiddleware)
- ❌ NO database calls in middleware
- ❌ NO Clerk API calls to fetch metadata (too slow for every request)

---

## Permission Flags System

### Metadata Flags

| Flag | Location | Meaning |
|------|----------|---------|
| `hasVsme` | User `publicMetadata` | User has permission to create VSME organizations |
| `orgHasVsme` | Organization `publicMetadata` | Organization has VSME access |
| `vsmeDb` | Organization `publicMetadata` | Organization record exists in Convex database |

### User State Matrix

| State | hasVsme | orgHasVsme | vsmeDb | Allowed Routes | Redirect Target |
|-------|---------|------------|--------|----------------|-----------------|
| Visitor | ❌ | ❌ | ❌ | Public only | `/` |
| New User | ✅ | ❌ | ❌ | Public + `/create-organization` | `/create-organization` |
| Org Created | ✅ | ✅ | ❌ | Public + `/create-organization` | `/create-organization` |
| Full Access | ✅ | ✅ | ✅ | All routes | - |

---

## Epic: Authentication & Authorization System

### Epic Summary
Implement a complete authentication and authorization system that:
1. Protects routes based on user/organization metadata
2. Guides users through the onboarding journey
3. Ensures organization-level data isolation with database-layer authorization
4. Provides seamless UX with automatic redirects

### Success Criteria
- [ ] All protected routes require authentication
- [ ] Routing decisions correctly follow the metadata flags
- [ ] Users are guided through sign-up → org setup → dashboard flow
- [ ] Organization data is isolated per tenant
- [ ] Database-layer authorization prevents unauthorized data access (Story 7)
- [ ] All auth flows have automated test coverage

---

## User Stories

**Note on Story Numbering**: Story 7 contains the detailed JWT integration implementation. References to "Story 4" in some sections refer to this same JWT integration story - this is a numbering inconsistency in the original document. The correct story for Convex + Clerk JWT Integration is **Story 7**.

### Story 1: Global Auth Middleware
**Priority**: P0 (Critical Path)
**Estimate**: 1 day

#### Description
As a developer, I need a global request middleware that runs on all requests to check authentication status and redirect unauthenticated users from protected routes, without making slow database or API calls.

#### Technical Approach
Create a `createMiddleware({ type: 'request' })` that:
- Checks if the request URL path starts with `/app` (protected route)
- For non-protected routes, immediately calls `next()` (fast path)
- For protected routes, uses Clerk's `auth()` to get session
- Redirects to `/sign-in` if no session exists
- Passes session context to downstream handlers via `next({ context: { session } })`

**Key Constraint**: No database calls or Clerk API calls in middleware - only use session data already parsed by clerkMiddleware.

#### Files to Create/Modify
- `src/lib/auth/middleware.ts` - Auth middleware function
- `src/start.ts` - Add authMiddleware to requestMiddleware array

#### Implementation Pattern

```typescript
// src/lib/auth/middleware.ts
import { createMiddleware } from '@tanstack/react-start'
import { auth } from '@clerk/tanstack-react-start/server'
import { redirect } from '@tanstack/react-router'

// Protected route prefixes
const PROTECTED_PREFIXES = ['/app']

export const authMiddleware = createMiddleware({ type: 'request' }).server(
  async ({ next, request }) => {
    const url = new URL(request.url)

    // Fast path: non-protected routes
    const isProtected = PROTECTED_PREFIXES.some(prefix =>
      url.pathname.startsWith(prefix)
    )

    if (!isProtected) {
      return next()
    }

    // Protected route: check session
    const session = await auth()

    if (!session.userId) {
      throw redirect({ to: '/sign-in' })
    }

    // Pass session to downstream handlers
    return next({ context: { session } })
  }
)
```

```typescript
// src/start.ts
import { clerkMiddleware } from '@clerk/tanstack-react-start/server'
import { createStart } from '@tanstack/react-start'
import { authMiddleware } from './lib/auth/middleware'

export const startInstance = createStart(() => {
  return {
    requestMiddleware: [clerkMiddleware(), authMiddleware],
  }
})
```

#### Acceptance Criteria
- [ ] Middleware runs on all requests
- [ ] Non-protected routes pass through immediately (< 1ms overhead)
- [ ] Protected routes check session via Clerk's `auth()`
- [ ] Unauthenticated users on protected routes redirect to `/sign-in`
- [ ] Session context is available to downstream handlers
- [ ] No database or Clerk API calls in middleware

#### Test Cases
```typescript
// src/lib/auth/__tests__/middleware.test.ts
describe('authMiddleware', () => {
  it('passes through for public routes without auth check')
  it('passes through for / (home)')
  it('passes through for /sign-in')
  it('checks auth for /app routes')
  it('redirects to /sign-in when not authenticated')
  it('passes session context when authenticated')
})
```

---

### Story 2: Enhanced _appLayout Route Protection
**Priority**: P0 (Critical Path)
**Estimate**: 1 day

#### Description
As a user, I want the `/app` routes to check my VSME permissions and redirect me appropriately if I don't have the required access level.

#### Technical Approach
Enhance the existing `_appLayout` route to:
- Use `beforeLoad` to fetch full auth context (can make Clerk API calls here)
- Check `hasVsme`, `orgHasVsme`, and `vsmeDb` flags
- Redirect to `/create-organization` if user needs to set up org
- Pass auth context to child routes

**Note**: Unlike global middleware, `beforeLoad` only runs for routes under `_appLayout`, so API calls are acceptable here.

#### Routing Decision Tree (for /app routes)

```
┌─────────────────────────┐
│   /app/* Request        │
│   (already authed by    │
│    global middleware)   │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│  Fetch user/org metadata│
│  (Clerk API call OK)    │
└───────────┬─────────────┘
            ▼
     ┌────────────────────┐
     │   orgHasVsme?      │
     └────────┬───────────┘
        ┌─────┴─────┐
       Yes          No
        │            │
        ▼            ▼
   ┌─────────┐  ┌─────────────┐
   │ vsmeDb? │  │  hasVsme?   │
   └────┬────┘  └──────┬──────┘
    Yes│No         Yes │ No
       │  │            │   │
       ▼  ▼            ▼   ▼
   ┌────┐ ┌────────┐ ┌────────┐ ┌────┐
   │ ✅ │ │Redirect│ │Redirect│ │ /  │
   │Pass│ │/create │ │/create │ │Home│
   └────┘ │ -org   │ │  -org  │ └────┘
          └────────┘ └────────┘
```

#### Files to Modify
- `src/routes/_appLayout/route.tsx` - Enhanced beforeLoad with metadata checks
- `src/lib/auth/get-auth-context.ts` - Server function for fetching full auth context

#### Implementation Pattern

```typescript
// src/lib/auth/get-auth-context.ts
import { auth, clerkClient } from '@clerk/tanstack-react-start/server'
import { createServerFn } from '@tanstack/react-start'
import type { AuthContext } from './types'

export const getAuthContext = createServerFn({ method: 'GET' })
  .handler(async (): Promise<AuthContext | null> => {
    const { userId, orgId } = await auth()

    if (!userId) {
      return null
    }

    const client = await clerkClient()

    // Fetch user metadata (OK to call Clerk API in beforeLoad)
    const user = await client.users.getUser(userId)
    const hasVsme = Boolean(user.publicMetadata?.hasVsme)

    // Fetch org metadata if org selected
    let orgHasVsme = false
    let vsmeDb = false

    if (orgId) {
      const org = await client.organizations.getOrganization({
        organizationId: orgId
      })
      orgHasVsme = Boolean(org.publicMetadata?.hasVsme)
      vsmeDb = Boolean(org.publicMetadata?.vsmeDb)
    }

    return {
      isAuthenticated: true,
      userId,
      orgId: orgId || null,
      hasVsme,
      orgHasVsme,
      vsmeDb,
      canAccessDashboard: orgHasVsme && vsmeDb,
      needsOrgSetup: hasVsme && (!orgId || !vsmeDb),
    }
  })
```

```typescript
// src/routes/_appLayout/route.tsx (enhanced beforeLoad)
export const Route = createFileRoute('/_appLayout')({
  component: RouteComponent,
  beforeLoad: async () => {
    const authContext = await getAuthContext()

    // Already authenticated by global middleware, but check VSME access
    if (!authContext?.hasVsme && !authContext?.orgHasVsme) {
      throw redirect({ to: '/' })
    }

    if (authContext.needsOrgSetup) {
      throw redirect({ to: '/create-organization' })
    }

    return { authContext }
  },
})
```

#### Acceptance Criteria
- [ ] `/app` routes fetch full auth context with metadata
- [ ] Users without `hasVsme` or `orgHasVsme` are redirected to home
- [ ] Users with `hasVsme` but no org are redirected to `/create-organization`
- [ ] Users with `orgHasVsme` but no `vsmeDb` are redirected to `/create-organization`
- [ ] Users with full access (`orgHasVsme` + `vsmeDb`) can access dashboard
- [ ] Auth context is available to child routes via `Route.useRouteContext()`

#### Test Cases
```typescript
// src/lib/auth/__tests__/get-auth-context.test.ts
describe('getAuthContext', () => {
  it('returns null when user is not authenticated')
  it('returns hasVsme flag from user publicMetadata')
  it('returns orgHasVsme and vsmeDb flags from org publicMetadata')
  it('computes canAccessDashboard correctly')
  it('computes needsOrgSetup correctly')
  it('handles missing organization gracefully')
})
```

---

### Story 3: Create Organization Page
**Priority**: P1 (High)
**Estimate**: 1 day
**Dependencies**: Story 5 (Convex Schema) must be completed first

#### Description
As a user with VSME permission, I want to create or select an organization, so that I can set up my workspace and access the dashboard.

#### Technical Approach
Create a page that:
- Renders Clerk's `OrganizationSwitcher` component
- Allows creating new organizations
- Is accessible to users with `hasVsme` but not yet `vsmeDb`
- Calls Convex mutation to create org/user records on org creation (uses Story 5 mutations)

**Note**: The `/create-organization` page must NOT be under `_appLayout` since users are redirected here when they don't have full access yet.

#### Files to Create/Modify
- `src/routes/create-organization.tsx` - Organization setup page (root level, not under _appLayout)

#### Acceptance Criteria
- [ ] Page renders OrganizationSwitcher from Clerk
- [ ] Page is accessible to authenticated users with `hasVsme`
- [ ] Users without `hasVsme` are redirected to home

#### Test Cases
```typescript
describe('CreateOrganization page', () => {
  it('redirects users without hasVsme to home')
  it('renders OrganizationSwitcher for eligible users')
})
```

**Note**: Tests for Convex record creation, metadata updates, and redirect to `/app` are in Story 5.

---

### Story 5: Convex Schema & Organization/User Mutations
**Priority**: P1 (High)
**Estimate**: 1.5 days
**Dependencies**: Story 7 (Convex + Clerk JWT Integration) must be completed first for auth checks

#### Description
As a developer, I need Convex tables and mutations to store organization and user data, manage the `vsmeDb` flag, and enable organization-scoped data isolation with user tracking for future analytics.

#### Technical Approach
Extend Convex schema with organizations and users tables and add authorization checks using auth utilities from Story 7:

```typescript
// convex/schema.ts
organizations: defineTable({
  clerkOrgId: v.string(),
  name: v.string(),
  _createdAt: v.number(), // Created automatically by Convex
  // ... additional org fields
}).index('by_clerk_org_id', ['clerkOrgId'])

users: defineTable({
  clerkId: v.string(),
  email: v.string(),
  firstName: v.optional(v.string()),
  lastName: v.optional(v.string()),
  username: v.optional(v.string()),
  organizationIds: v.array(v.string()), // Array of Clerk org IDs
  _createdAt: v.number(), // Created automatically by Convex
  updatedAt: v.number(),
}).index('by_clerk_id', ['clerkId'])
  .index('by_email', ['email'])
```

When a user creates/joins an organization:
1. Upsert user record (create if not exists, update organizationIds if exists)
2. Create organization record if not exists
3. Update Clerk org metadata with `vsmeDb: true`
4. Update Clerk user metadata with `hasVsme: false` (since they now have full access and can't create more orgs))`

#### Files to Create/Modify
- `convex/schema.ts` - Add organizations and users tables
- `convex/organizations.ts` - Org CRUD mutations with auth checks
- `convex/users.ts` - User upsert mutations with auth checks
- `convex/_utils/auth.ts` - Auth helper functions (from Story 7)

#### Acceptance Criteria
- [ ] Organizations table exists with proper schema
- [ ] Users table exists with proper schema
- [ ] `createOrganization` mutation creates org record and upserts user record
- [ ] `upsertUser` mutation creates or updates user with organizationIds
- [ ] User record includes clerkId, email, firstName, lastName, username, organizationIds
- [ ] `getOrganization` query fetches org by Clerk ID
- [ ] `getUserByClerkId` query fetches user by Clerk ID
- [ ] Indexes on `clerkOrgId` and `clerkId` for efficient lookups
- [ ] Proper error handling for duplicate orgs
- [ ] Org metadata updated with `vsmeDb: true` after successful creation
- [ ] User redirected to `/app` after successful org creation
- [ ] All mutations/queries include authorization checks using auth utilities from Story 7

#### Test Cases
```typescript
// Convex function tests - organizations
describe('organizations mutations', () => {
  it('creates organization with clerkOrgId')
  it('prevents duplicate clerkOrgId entries')
  it('fetches organization by clerkOrgId')
  it('returns null for non-existent org')
  it('updates org metadata with vsmeDb flag')
  it('redirects to /app after successful setup')
  it('requires authentication for all operations')
  it('enforces organization-scoped access')
})

// Convex function tests - users
describe('users mutations', () => {
  it('creates user with clerkId, email, and name fields')
  it('upserts user when already exists')
  it('adds organizationId to existing user organizationIds array')
  it('fetches user by clerkId')
  it('returns null for non-existent user')
  it('stores username when available from Clerk')
  it('requires authentication for all operations')
  it('prevents fetching other users data')
})
```

---

### Story 6: Header Conditional Rendering
**Priority**: P2 (Medium)
**Estimate**: 1 day

#### Description
As a user, I want the header to show different buttons based on my authentication state and permissions, so that I can navigate to relevant actions.

#### Technical Approach
Create conditional rendering logic in header component:

| State | Buttons Shown |
|-------|---------------|
| Signed Out | Sign Up, Sign In |
| Signed In, no VSME | Get Access link, UserButton |
| Has VSME, no org/db | Create Organization, UserButton |
| Full Access | Dashboard, OrgSwitcher, UserButton |

#### Files to Modify
- `src/components/Header.tsx` - Add conditional auth buttons
- `src/integrations/clerk/header-user.tsx` - Enhance with org logic

#### Acceptance Criteria
- [ ] Signed-out users see Sign Up and Sign In buttons
- [ ] Signed-in users always see UserButton
- [ ] Users without VSME see "Get access" link
- [ ] Users with VSME permission see "Create Organization" when no db record
- [ ] Users with full access see Dashboard button and OrganizationSwitcher

#### Test Cases
```typescript
describe('HeaderButtons', () => {
  it('renders SignUp and SignIn for signed-out users')
  it('renders UserButton for all signed-in users')
  it('renders "Get access" when hasVsme is false')
  it('renders "Create Organization" when hasVsme but no vsmeDb')
  it('renders Dashboard and OrgSwitcher when full access')
})
```

---

### Story 7: Convex + Clerk JWT Integration
**Priority**: P1 (High)
**Estimate**: 1.5 days

#### Technical Rationale

**Purpose & Necessity:**
This story addresses a **critical security gap** in the three-layer authentication architecture. While Layer 1 (Clerk) issues JWT tokens and Layer 2 (TanStack Start middleware) validates them for frontend route protection, **Layer 3 (Convex data layer) has NO native way to verify these tokens without explicit configuration**.

Without JWT integration, Convex functions would have no way to:
- Verify that requests come from authenticated users
- Extract user/org context from incoming requests
- Enforce organization-scoped data access
- Prevent unauthorized data queries/mutations

**Security Contribution Beyond Current Measures:**

| Security Layer | Current Protection | What Story 7 Adds |
|----------------|-------------------|-------------------|
| **Frontend** | Route guards, session checks | ✅ Already covered by Story 1 & 2 |
| **API Surface** | Clerk middleware validates JWT | ✅ Already covered by Story 1 |
| **Database Layer** | ❌ NONE (Convex is open by default) | ✅ JWT verification + org scoping |

**Critical Gap Filled:**
- **Data-level authorization**: Convex functions can now check `ctx.auth.getUserIdentity()` before returning data
- **Multi-tenant isolation**: Prevents cross-organization data leaks (Org A users cannot query Org B data)
- **Auditability**: Every Convex operation is tied to authenticated identity
- **Defense in depth**: Even if frontend protections are bypassed, the database layer remains secure

**Redundancy Analysis:**
**Not redundant** - fills a specific architectural gap:
- Stories 1 & 2 protect **routes** (frontend)
- Story 7 protects **data** (backend/database layer)
- These are **orthogonal security boundaries** - both are required for defense in depth

#### Description
As a developer, I need Convex to verify Clerk JWT tokens and extract user/org context, ensuring secure API access at the database layer.

#### Technical Approach
Configure Convex to use Clerk as OIDC auth provider:

1. **Create Clerk JWT Template** (Clerk Dashboard):
   - Navigate to Dashboard → JWT Templates → New Template
   - Name: `convex`
   - Claims: Include standard OIDC claims (`sub`, `iss`, `email`, `name`) and custom claims (`org_id`, `org_role`)
   - Audience: Use Convex application ID (from environment variable or generate unique identifier)
   - Algorithm: RS256
   - Expiration: 5 minutes (default)

2. **Configure Convex auth handler** (`convex/auth.config.ts`):
   - Clerk uses OIDC standard, so configure as OIDC provider
   - Domain: Clerk issuer URL (e.g., `https://your-instance.clerk.accounts.dev`)
   - Application ID: The audience configured in JWT template

3. **Create helper utilities** (`convex/_utils/auth.ts`):
   - Extract `userId` from JWT claims (`sub` claim)
   - Extract `orgId` from JWT claims (custom `org_id` claim)
   - Provide type-safe auth context access
   - Handle authentication errors gracefully

4. **Update Convex provider** (`src/integrations/convex/provider.tsx`):
   - Replace `ConvexProvider` with `ConvexProviderWithClerk` from `convex/react-clerk`
   - Pass Clerk's `useAuth` hook to enable JWT token fetching

5. **Update existing Convex functions** to use auth context:
   - Use `ctx.auth.getUserIdentity()` to get authenticated user
   - Extract `userId` from `identity.subject` or `identity.tokenIdentifier`
   - Extract `orgId` from `identity.org_id` (custom claim)
   - Add authorization checks before data access

#### Files to Create/Modify
- `convex/auth.config.ts` - Clerk OIDC auth configuration (NEW)
- `convex/_utils/auth.ts` - Auth helper utilities (NEW)
- `src/integrations/convex/provider.tsx` - Update to use ConvexProviderWithClerk (MODIFY)
- `convex/organizations.ts` - Add auth checks to queries/mutations (MODIFY)
- `convex/users.ts` - Add auth checks to queries/mutations (MODIFY)

#### Implementation Details

**Step 1: Create Clerk JWT Template**
```bash
# Clerk Dashboard Steps:
1. Navigate to: https://dashboard.clerk.com/apps/[APP_ID]/jwt-templates
2. Click "New Template"
3. Configure:
   - Name: convex
   - Short-lived: Yes (recommended)
   - Claims to include:
     * Standard: sub, iss, email, name, given_name, family_name
     * Custom: org_id, org_role
   - Audience: Your Convex application ID (e.g., "convex-tc-vsme")
   - Algorithm: RS256
   - Lifetime: 5 minutes
4. Save template
```

**Step 2: Create `convex/auth.config.ts`**
```typescript
import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      // Clerk's OIDC issuer URL
      // Replace with your actual Clerk instance URL
      domain: process.env.CLERK_ISSUER_URL || "https://your-instance.clerk.accounts.dev",

      // The audience configured in Clerk JWT template
      // This must match the "Audience" field in your Clerk JWT template
      applicationID: process.env.CONVEX_JWT_AUDIENCE || "convex-tc-vsme",
    },
  ],
} satisfies AuthConfig;
```

**Step 3: Create `convex/_utils/auth.ts`**
```typescript
import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Extract user ID from authenticated context.
 * Throws error if user is not authenticated.
 */
export function requireUserId(ctx: any): string {
  const identity = ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthorized: User must be authenticated");
  }
  // Use 'subject' claim as the user ID (standard OIDC 'sub' claim)
  return identity.subject;
}

/**
 * Extract organization ID from authenticated context.
 * Returns null if no organization is selected.
 */
export function getOrgId(ctx: any): string | null {
  const identity = ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }
  // Extract custom 'org_id' claim from JWT
  return identity.org_id as string | null;
}

/**
 * Require organization context.
 * Throws error if no organization is selected.
 */
export function requireOrgId(ctx: any): string {
  const orgId = getOrgId(ctx);
  if (!orgId) {
    throw new Error("Unauthorized: Organization must be selected");
  }
  return orgId;
}

/**
 * Get full authenticated user identity.
 * Returns null if not authenticated.
 */
export async function getAuthIdentity(ctx: any) {
  return await ctx.auth.getUserIdentity();
}
```

**Step 4: Update `src/integrations/convex/provider.tsx`**
```typescript
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { ConvexQueryClient } from '@convex-dev/react-query'
import { useAuth } from '@clerk/tanstack-react-start'

const CONVEX_URL = (import.meta as any).env.VITE_CONVEX_URL
if (!CONVEX_URL) {
  console.error('missing envar CONVEX_URL')
}
const convexQueryClient = new ConvexQueryClient(CONVEX_URL)

export default function AppConvexProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ConvexProviderWithClerk client={convexQueryClient.convexClient} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  )
}
```

**Step 5: Update `convex/organizations.ts` with auth checks**
```typescript
import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { requireUserId, requireOrgId } from './_utils/auth'

/**
 * Fetch organization by Clerk organization ID.
 * Requires authentication and organization context.
 */
export const getByClerkOrgId = query({
  args: {
    clerkOrgId: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id('organizations'),
      _creationTime: v.number(),
      clerkOrgId: v.string(),
      name: v.string(),
      slug: v.string(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    // Require authentication
    const userId = requireUserId(ctx)
    const orgId = requireOrgId(ctx)

    // Verify user has access to this organization
    // (Optional: Add additional authorization logic here)

    return await ctx.db
      .query('organizations')
      .withIndex('by_clerkOrgId', (q) => q.eq('clerkOrgId', args.clerkOrgId))
      .unique()
  },
})

// ... other functions with similar auth checks
```

**Step 6: Update `convex/users.ts` with auth checks**
```typescript
import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { requireUserId } from './_utils/auth'

/**
 * Fetch user by Clerk user ID.
 * Requires authentication.
 */
export const getByClerkId = query({
  args: {
    clerkId: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id('users'),
      _creationTime: v.number(),
      clerkId: v.string(),
      email: v.string(),
      firstName: v.optional(v.string()),
      lastName: v.optional(v.string()),
      username: v.optional(v.string()),
      organizationIds: v.array(v.string()),
      updatedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    // Require authentication
    const userId = requireUserId(ctx)

    // Users can only fetch their own data
    if (userId !== args.clerkId) {
      throw new Error("Unauthorized: Can only fetch own user data")
    }

    return await ctx.db
      .query('users')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', args.clerkId))
      .unique()
  },
})

// ... other functions with similar auth checks
```

#### Environment Variables Required
Add to `.env`:
```env
# Clerk issuer URL (format: https://[INSTANCE].clerk.accounts.dev)
CLERK_ISSUER_URL=https://your-instance.clerk.accounts.dev

# Convex JWT audience (must match Clerk JWT template audience)
CONVEX_JWT_AUDIENCE=convex-tc-vsme
```

#### Acceptance Criteria
- [ ] Clerk JWT template is created with correct claims and audience
- [ ] `convex/auth.config.ts` is created with Clerk OIDC configuration
- [ ] `convex/_utils/auth.ts` provides helper functions for auth context
- [ ] `src/integrations/convex/provider.tsx` uses `ConvexProviderWithClerk`
- [ ] Convex functions can access authenticated user ID via `ctx.auth.getUserIdentity()`
- [ ] Convex functions can access organization ID from JWT custom claims
- [ ] Unauthenticated requests to protected Convex functions are rejected
- [ ] Auth context is type-safe with TypeScript
- [ ] Organization-scoped queries enforce multi-tenant isolation

#### Test Cases
```typescript
// convex/_utils/__tests__/auth.test.ts
describe('Convex Auth Utils', () => {
  describe('requireUserId', () => {
    it('returns userId when user is authenticated')
    it('throws error when user is not authenticated')
  })

  describe('getOrgId', () => {
    it('returns orgId when organization is selected')
    it('returns null when no organization is selected')
    it('returns null when user is not authenticated')
  })

  describe('requireOrgId', () => {
    it('returns orgId when organization is selected')
    it('throws error when no organization is selected')
    it('throws error when user is not authenticated')
  })
})

// convex/__tests__/organizations-auth.test.ts
describe('Organizations with Auth', () => {
  it('allows fetching organization when user has access')
  it('rejects fetching organization when user is not authenticated')
  it('enforces organization-scoped data access')
})

// convex/__tests__/users-auth.test.ts
describe('Users with Auth', () => {
  it('allows fetching own user data when authenticated')
  it('rejects fetching other user data')
  it('rejects fetching user data when not authenticated')
})
```

---

### Story 8: Dashboard with Organization Data
**Priority**: P1 (High)
**Estimate**: 1 day

#### Description
As a user with full access, I want the dashboard pages to display organization-specific data fetched from Convex, with proper loading and error states.

#### Technical Approach
Enhance dashboard pages to:
- Use auth context from `Route.useRouteContext()`
- Query Convex with organization ID filter (JWT-authenticated via Story 7)
- Display org-specific data

**Note**: Auth protection is handled by global middleware (Story 1), `_appLayout` beforeLoad (Story 2), and Convex JWT verification (Story 7).

#### Files to Modify
- `src/routes/_appLayout/app/index.tsx` - Dashboard with org data

#### Implementation Pattern
```typescript
// src/routes/_appLayout/app/index.tsx
function RouteComponent() {
  const { authContext } = Route.useRouteContext()
  const { orgId } = authContext

  // Query Convex with org filter (JWT-authenticated via Story 7)
  const orgData = useQuery(api.organizations.getByClerkId, {
    clerkOrgId: orgId
  })

  if (!orgData) return <LoadingSpinner />

  return <Dashboard data={orgData} />
}
```

#### Acceptance Criteria
- [ ] Dashboard accesses auth context from route context
- [ ] Convex queries are scoped to current organization (JWT-authenticated via Story 7)
- [ ] Loading states are shown while fetching data
- [ ] Error states are handled gracefully
- [ ] Organization switcher updates the data displayed
- [ ] Unauthorized data access is prevented at database layer

---

### Story 9: End-to-End Auth Flow Tests
**Priority**: P1 (High)
**Estimate**: 2 days

#### Description
As a developer, I need end-to-end tests covering the complete authentication journey, ensuring the system works correctly in production-like conditions.

#### Technical Approach
Create E2E tests using Playwright or similar:
1. Sign-up flow → create org → dashboard access
2. Sign-in flow → existing org → dashboard access
3. Permission denial scenarios
4. Organization switching

#### Test Scenarios
```typescript
describe('E2E Authentication Flow', () => {
  describe('New User Journey', () => {
    it('signs up and redirects to organization setup')
    it('creates organization and redirects to dashboard')
    it('can access org-specific data')
    it('JWT tokens are properly sent to Convex')
  })

  describe('Returning User', () => {
    it('signs in and accesses dashboard directly')
    it('can switch between organizations')
    it('JWT tokens refresh on organization switch')
  })

  describe('Permission Boundaries', () => {
    it('denies dashboard access without vsmeDb')
    it('denies protected routes for visitors')
    it('prevents unauthorized Convex queries')
    it('prevents cross-organization data access')
  })
})
```

---

## Implementation Timeline

### Phase 1: Foundation (Week 1)
- Story 1: Global Auth Middleware (1 day)
- Story 2: Enhanced _appLayout Route Protection (1 day)
- Story 7: Convex + Clerk JWT Integration (1.5 days)
- Story 5: Convex Schema & Organization/User Mutations (1.5 days) - *depends on Story 7*

### Phase 2: Core Features (Week 2)
- Story 3: Create Organization Page (1 day) - *depends on Story 5*
- Story 6: Header Conditional Rendering (1 day)
- Story 8: Dashboard with Organization Data (1 day) - *depends on Story 7*
- Integration testing (1 day)

### Phase 3: Testing & Polish (Week 3)
- Story 9: End-to-End Auth Flow Tests (2 days)
- Bug fixes and edge cases (1-2 days)
- Documentation updates (0.5 days)

### Story Summary Table

| # | Story | Priority | Estimate | Dependencies |
|---|-------|----------|----------|--------------|
| 1 | Global Auth Middleware | P0 | 1 day | - |
| 2 | Enhanced _appLayout Route Protection | P0 | 1 day | Story 1 |
| 3 | Create Organization Page | P1 | 1 day | Story 1, 2, **5** |
| 4 | *(No story - see Story 7)* | - | - | - |
| 5 | Convex Schema & Org/User Mutations | P1 | 1.5 days | Story 7 |
| 6 | Header Conditional Rendering | P2 | 1 day | - |
| 7 | Convex + Clerk JWT Integration | P1 | 1.5 days | - |
| 8 | Dashboard with Organization Data | P1 | 1 day | Story 2, 5, 7 |
| 9 | End-to-End Auth Flow Tests | P1 | 2 days | All |

**Note**: Story 3 depends on Story 5 because the Create Organization page needs to call the Convex mutations to create org/user records.
**Note**: Story 5 depends on Story 7 (Convex + Clerk JWT Integration) to use auth utilities for authorization checks.
**Note**: Story 8 depends on Story 7 (Convex + Clerk JWT Integration) because the dashboard needs authenticated Convex queries with organization-scoped data access.

---

## Technical Implementation Details

### 1. Global Auth Middleware (Fast Path)

```typescript
// src/lib/auth/middleware.ts
import { createMiddleware } from '@tanstack/react-start'
import { auth } from '@clerk/tanstack-react-start/server'
import { redirect } from '@tanstack/react-router'

// Routes that require authentication
const PROTECTED_PREFIXES = ['/app']

export const authMiddleware = createMiddleware({ type: 'request' }).server(
  async ({ next, request }) => {
    const url = new URL(request.url)

    // Fast path: skip auth check for non-protected routes
    const isProtected = PROTECTED_PREFIXES.some(prefix =>
      url.pathname.startsWith(prefix)
    )

    if (!isProtected) {
      return next()
    }

    // Protected route: verify session (no API calls, just JWT check)
    const session = await auth()

    if (!session.userId) {
      throw redirect({ to: '/sign-in' })
    }

    // Pass basic session info to downstream handlers
    return next({
      context: {
        userId: session.userId,
        orgId: session.orgId
      }
    })
  }
)
```

```typescript
// src/start.ts
import { clerkMiddleware } from '@clerk/tanstack-react-start/server'
import { createStart } from '@tanstack/react-start'
import { authMiddleware } from './lib/auth/middleware'

export const startInstance = createStart(() => {
  return {
    // Middleware chain: clerkMiddleware parses JWT, authMiddleware checks routes
    requestMiddleware: [clerkMiddleware(), authMiddleware],
  }
})
```

### 2. Auth Context Type Definition

```typescript
// src/lib/auth/types.ts
export interface AuthContext {
  isAuthenticated: boolean
  userId: string
  orgId: string | null

  // Permission flags from Clerk metadata
  hasVsme: boolean
  orgHasVsme: boolean
  vsmeDb: boolean

  // Computed properties
  canAccessDashboard: boolean
  needsOrgSetup: boolean
}

export interface ClerkUserMetadata {
  hasVsme?: boolean
}

export interface ClerkOrgMetadata {
  hasVsme?: boolean
  vsmeDb?: boolean
}
```

### 3. Full Auth Context Server Function (for beforeLoad)

```typescript
// src/lib/auth/get-auth-context.ts
import { auth, clerkClient } from '@clerk/tanstack-react-start/server'
import { createServerFn } from '@tanstack/react-start'
import type { AuthContext } from './types'

export const getAuthContext = createServerFn({ method: 'GET' })
  .handler(async (): Promise<AuthContext | null> => {
    const { userId, orgId } = await auth()

    if (!userId) {
      return null
    }

    const client = await clerkClient()

    // Fetch user metadata (OK in beforeLoad, runs once per navigation)
    const user = await client.users.getUser(userId)
    const hasVsme = Boolean(user.publicMetadata?.hasVsme)

    // Fetch org metadata if org selected
    let orgHasVsme = false
    let vsmeDb = false

    if (orgId) {
      const org = await client.organizations.getOrganization({
        organizationId: orgId
      })
      orgHasVsme = Boolean(org.publicMetadata?.hasVsme)
      vsmeDb = Boolean(org.publicMetadata?.vsmeDb)
    }

    return {
      isAuthenticated: true,
      userId,
      orgId: orgId || null,
      hasVsme,
      orgHasVsme,
      vsmeDb,
      canAccessDashboard: orgHasVsme && vsmeDb,
      needsOrgSetup: hasVsme && (!orgId || !vsmeDb),
    }
  })
```

### 4. Enhanced _appLayout Route

```typescript
// src/routes/_appLayout/route.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'
import { getAuthContext } from '@/lib/auth'

export const Route = createFileRoute('/_appLayout')({
  beforeLoad: async () => {
    // Global middleware already verified authentication
    // Now check VSME permissions (requires Clerk API calls)
    const authContext = await getAuthContext()

    if (!authContext) {
      // Should not happen (global middleware redirects), but handle gracefully
      throw redirect({ to: '/sign-in' })
    }

    // Check VSME access
    if (!authContext.hasVsme && !authContext.orgHasVsme) {
      throw redirect({ to: '/' })
    }

    // Check if org setup is needed
    if (authContext.needsOrgSetup) {
      throw redirect({ to: '/create-organization' })
    }

    // Pass auth context to child routes
    return { authContext }
  },
  component: RouteComponent,
})
```

---

## File Structure

```
src/
├── start.ts                           # Global middleware registration
├── lib/
│   └── auth/
│       ├── index.ts                   # Public exports
│       ├── types.ts                   # AuthContext type definitions
│       ├── middleware.ts              # Global auth middleware
│       ├── get-auth-context.ts        # Server function for full auth context
│       └── __tests__/
│           ├── middleware.test.ts
│           └── get-auth-context.test.ts
├── routes/
│   ├── __root.tsx                     # Root with ClerkProvider
│   ├── index.tsx                      # Public home page
│   ├── create-organization.tsx        # Org setup page (NOT under _appLayout)
│   ├── _appLayout/                    # Protected app layout (existing)
│   │   ├── route.tsx                  # Enhanced with VSME permission checks
│   │   └── app/
│   │       ├── index.tsx              # Dashboard with org data
│   │       └── ...                    # Other app routes
│   ├── sign-in/
│   │   └── [[...sign-in]].tsx         # Clerk sign-in
│   └── sign-up/
│       └── [[...sign-up]].tsx         # Clerk sign-up
├── components/
│   ├── Header.tsx                     # Updated with conditional auth buttons
│   └── HeaderButtons.tsx              # Auth-aware navigation component
└── integrations/
    ├── clerk/
    │   ├── provider.tsx               # ClerkProvider wrapper
    │   └── header-user.tsx            # Enhanced with org logic
    └── convex/
        └── provider.tsx               # ConvexProviderWithClerk wrapper (UPDATED for Story 7)

convex/
├── schema.ts                          # Updated with organizations and users tables
├── organizations.ts                   # Org CRUD operations
├── users.ts                           # User upsert operations
├── auth.config.ts                     # Clerk JWT integration (NEW)
└── _utils/
    └── auth.ts                        # Auth helper utilities (NEW)
```

### Key Architecture Decisions

1. **No separate `_authed` layout**: The existing `_appLayout` serves as the protected layout
2. **Global middleware for basic auth**: Fast check in `src/start.ts` (no DB calls)
3. **Route-level checks for permissions**: `beforeLoad` in `_appLayout` for VSME metadata
4. **`/create-organization` at root level**: Accessible before user has full VSME access
5. **Convex JWT verification (Story 7)**: Database-layer security using Clerk OIDC provider to prevent unauthorized data access
6. **Three-layer defense**: Frontend route guards (Story 1-2) + Database-layer auth (Story 7) for defense in depth

---

## Testing Strategy

### Unit Tests (Vitest)
- Auth context functions
- Auth utility functions (Story 7)
- Route guard logic
- Public route matching
- Metadata flag parsing

### Integration Tests
- Clerk middleware behavior
- Convex auth integration (Story 7)
- JWT token verification
- Route protection flow

### E2E Tests (Playwright)
- Complete user journeys
- Permission boundary testing
- Organization switching

### Test Coverage Goals
- Auth utilities: 90%+
- Auth helper functions (Story 7): 90%+
- Route guards: 85%+
- Components: 75%+

---

## Dependencies & Prerequisites

### Required Environment Variables
```env
# Clerk authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Convex connection
VITE_CONVEX_URL=https://...

# Clerk JWT integration for Convex (Story 7)
CLERK_ISSUER_URL=https://your-instance.clerk.accounts.dev
CONVEX_JWT_AUDIENCE=convex-tc-vsme
```

### Clerk Configuration
- Enable Organizations feature
- Create JWT template named "convex" with:
  - Standard OIDC claims: `sub`, `iss`, `email`, `name`
  - Custom claims: `org_id`, `org_role`
  - Audience: Matches `CONVEX_JWT_AUDIENCE` environment variable
  - Algorithm: RS256
  - Lifetime: 5 minutes
- Set up public metadata fields on users and organizations

### Convex Configuration
- Create `convex/auth.config.ts` with Clerk OIDC provider configuration
- Set JWT issuer URL and application ID (must match Clerk JWT template)
- Update `src/integrations/convex/provider.tsx` to use `ConvexProviderWithClerk`

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Clerk API rate limits | Implement caching for metadata |
| JWT token expiration | Handle refresh gracefully (Convex auto-refreshes via ConvexProviderWithClerk) |
| Org switch mid-request | Invalidate cached auth context (Convex auto-handles via token refresh) |
| Convex cold starts | Optimize function bundle size |
| JWT verification failure | Implement proper error handling and user-friendly error messages |
| Audience mismatch | Ensure `CONVEX_JWT_AUDIENCE` matches Clerk JWT template exactly |

---

## Open Questions

1. **Webhook integration**: Should we use Clerk webhooks to sync metadata to Convex, or fetch on-demand?
2. **Caching strategy**: How long should auth context be cached?
3. **Error pages**: Should we create custom 401/403 error components?
4. **Audit logging**: Do we need to log authentication events?
5. **JWT template claims**: Should we include additional custom claims in the JWT template for future use?

---

## Appendix: Routing Decision Tree (Mermaid)

### Layer 1: Global Middleware (Fast Check)

```mermaid
flowchart TD
    A[Incoming Request] --> B{Path starts with /app?}
    B -->|No| C[✅ Pass through - next]
    B -->|Yes| D{Has session.userId?}
    D -->|No| E[↩️ Redirect to /sign-in]
    D -->|Yes| F[✅ Pass session context to next]
```

### Layer 2: _appLayout beforeLoad (Permission Check)

```mermaid
flowchart TD
    A[/app/* Request] --> B[Fetch full auth context]
    B --> C{hasVsme OR orgHasVsme?}
    C -->|No| D[↩️ Redirect to /]
    C -->|Yes| E{needsOrgSetup?}
    E -->|Yes| F[↩️ Redirect to /create-organization]
    E -->|No| G{canAccessDashboard?}
    G -->|No| H[↩️ Redirect to /create-organization]
    G -->|Yes| I[✅ Allow - pass authContext]
```

### Complete Flow Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant GM as Global Middleware
    participant BL as beforeLoad
    participant R as Route Component
    participant C as Convex

    U->>GM: GET /app
    GM->>GM: Check path (/app = protected)
    GM->>GM: await auth()
    alt No userId
        GM-->>U: Redirect /sign-in
    else Has userId
        GM->>BL: next({ context: { userId, orgId }})
        BL->>BL: await getAuthContext()
        BL->>BL: Fetch user/org metadata
        alt No VSME access
            BL-->>U: Redirect /
        else Needs org setup
            BL-->>U: Redirect /create-organization
        else Full access
            BL->>R: Render with authContext
            R->>C: Query org data (with JWT)
            C->>C: Verify JWT (Story 7)
            C->>C: Extract userId/orgId from JWT
            C->>C: Check authorization
            C-->>R: Organization data
            R-->>U: Dashboard page
        end
    end
```


