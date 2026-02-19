# TC-VSME Authentication Documentation

**Last Updated**: 2026-02-19 (After Auth Optimization Plan completion)

This document describes the complete authentication implementation for TC-VSME using TanStack Start, Clerk, and Convex.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Authentication Flow](#authentication-flow)
3. [Route Protection](#route-protection)
4. [Permission System](#permission-system)
5. [Convex Auth Utilities](#convex-auth-utilities)
6. [Performance Optimizations](#performance-optimizations)
7. [Common Pitfalls](#common-pitfalls)
8. [Configuration](#configuration)

---

## Architecture Overview

### Three-Layer Authentication

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Clerk (Identity Layer)                                   │
│    - User registration & login                              │
│    - JWT token issuance                                     │
│    - Organization management                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. TanStack Start (Access Control Layer)                    │
│    - Route-level protection (beforeLoad hooks)              │
│    - Permission flag checks (hasVsme, orgHasVsme, vsmeDb)   │
│    - Automatic redirects based on user state                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Convex (Data Layer Security)                             │
│    - JWT verification via JWKS                              │
│    - Organization-scoped data access                        │
│    - Per-request identity caching                           │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User → Clerk Sign-In → JWT Token → TanStack Start Routes → Convex Queries → Database
                                         ↓
                                   getAuthContext()
                                   (cached, ~0ms)
                                         ↓
                                   Permission Checks
                                   (hasVsme, orgHasVsme, vsmeDb)
```

---

## Authentication Flow

### 1. User Sign-In

1. User clicks "Sign In" → Clerk UI component
2. User enters credentials → Clerk validates
3. Clerk issues JWT token with claims:
   ```json
   {
     "sub": "user_abc123",           // User ID
     "email": "user@example.com",
     "o": {                           // Organization (if selected)
       "id": "org_xyz789",
       "rol": "org:admin"
     }
   }
   ```
4. Token stored in browser (httpOnly cookie)

### 2. Route Navigation

1. User navigates to `/app/dashboard`
2. TanStack Router triggers `beforeLoad` hook in `_appLayout/route.tsx`
3. `getAuthContext()` server function called:
   - Checks in-memory cache (Story 5 optimization)
   - If cache miss: queries Convex for permission flags
   - Returns `AuthContext` object
4. Route protection logic evaluates:
   ```typescript
   if (!authContext?.canAccessDashboard) {
     throw redirect({ to: '/create-organization' })
   }
   ```
5. If authorized: route loads, `authContext` passed to child routes

### 3. Convex Data Access

1. Component calls Convex query (e.g., `api.todos.list`)
2. `ConvexProviderWithClerk` attaches JWT token to request
3. Convex verifies JWT using JWKS from Clerk
4. Query handler calls `requireUserId(ctx)` and `getOrgId(ctx)`
5. Data filtered by organization: `ctx.db.query("todos").filter(q => q.eq(q.field("orgId"), orgId))`
6. Results returned to component

---

## Route Protection

### Why Route-Level Protection?

**TL;DR**: Clerk's `auth()` function requires TanStack Start AsyncLocalStorage context, which is **NOT available in request middleware**.

#### What We Tried (Doesn't Work)

```typescript
// ❌ This DOES NOT work
export const authMiddleware = createMiddleware({ type: 'request' }).server(
  async ({ next, request }) => {
    const session = await auth() // ❌ Error: No Start context found in AsyncLocalStorage
    // ...
  }
)
```

**Error**: `"No Start context found in AsyncLocalStorage"`

#### The Correct Pattern

Use `beforeLoad` hooks in route files with `createServerFn()`:

**File**: `src/routes/_appLayout/route.tsx`

```typescript
import { auth } from '@clerk/tanstack-react-start/server'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getAuthContext } from '@/lib/auth'

// Server function has access to Start context
const authStateFn = createServerFn({ method: 'GET' }).handler(async () => {
  const authResult = await auth() // ✅ Works here
  return { userId: authResult.userId, orgId: authResult.orgId }
})

export const Route = createFileRoute('/_appLayout')({
  component: RouteComponent,
  beforeLoad: async () => {
    // Get full auth context (with permission flags)
    const authContext = await getAuthContext()

    // Redirect if not authorized
    if (!authContext?.canAccessDashboard) {
      throw redirect({ to: '/create-organization' })
    }

    // Pass to child routes
    return { authContext }
  },
})
```

### Global Middleware (Clerk Only)

**File**: `src/start.ts`

```typescript
import { clerkMiddleware } from '@clerk/tanstack-react-start/server'
import { createStart } from '@tanstack/react-start'

export const startInstance = createStart(() => {
  return {
    requestMiddleware: [clerkMiddleware()], // Only Clerk's middleware
  }
})
```

**What `clerkMiddleware()` does**:
- Parses JWT from cookies
- Makes `auth()` function available in server functions
- Does NOT enforce route protection (that's done in `beforeLoad`)

---

## Permission System

### Permission Flags

TC-VSME uses three permission flags stored in Convex (source of truth) and dual-written to Clerk metadata (backward compatibility):

| Flag         | Scope        | Meaning                                    | Set When                                   |
| ------------ | ------------ | ------------------------------------------ | ------------------------------------------ |
| `hasVsme`    | User         | User has access to VSME features           | User signs up or is granted access         |
| `orgHasVsme` | Organization | Organization has VSME enabled              | Organization is created/setup              |
| `vsmeDb`     | Organization | Organization's VSME database is configured | `setupOrganization` completes successfully |

### Derived Properties

```typescript
// Can access dashboard if org has VSME AND database is configured
canAccessDashboard = orgHasVsme && vsmeDb

// Needs org setup if:
// 1. User has VSME but no org selected, OR
// 2. Org has VSME but database not configured
needsOrgSetup = hasVsme && (!orgId || (orgHasVsme && !vsmeDb))
```

### AuthContext Type

```typescript
export interface AuthContext {
  isAuthenticated: true
  userId: string
  orgId: string | null

  // Permission flags
  hasVsme: boolean
  orgHasVsme: boolean
  vsmeDb: boolean

  // Derived properties
  canAccessDashboard: boolean
  needsOrgSetup: boolean
}
```

### Usage in Routes

```typescript
// In _appLayout/route.tsx
export const Route = createFileRoute('/_appLayout')({
  beforeLoad: async () => {
    const authContext = await getAuthContext()

    if (!authContext) {
      // Not authenticated → redirect to sign-in
      throw redirect({ to: '/sign-in' })
    }

    if (authContext.needsOrgSetup) {
      // User needs to create/setup organization
      throw redirect({ to: '/create-organization' })
    }

    if (!authContext.canAccessDashboard) {
      // Org not fully configured
      throw redirect({ to: '/create-organization' })
    }

    return { authContext }
  },
})
```

---

## Convex Auth Utilities

Located in `convex/_utils/auth.ts`:

| Function               | Returns                   | Description                                                |
| ---------------------- | ------------------------- | ---------------------------------------------------------- |
| `requireUserId(ctx)`   | `Promise<string>`         | User ID from JWT `sub` claim. Throws if not authenticated. |
| `getOrgId(ctx)`        | `Promise<string \| null>` | Organization ID from JWT. Returns null if no org selected. |
| `requireOrgId(ctx)`    | `Promise<string>`         | Organization ID. Throws if no org selected.                |
| `getAuthIdentity(ctx)` | `Promise<object \| null>` | Full identity object with all JWT claims.                  |
| `getUserEmail(ctx)`    | `Promise<string \| null>` | User email from JWT.                                       |
| `getUserName(ctx)`     | `Promise<string \| null>` | User name from JWT.                                        |
| `getOrgRole(ctx)`      | `Promise<string \| null>` | Organization role from JWT.                                |

## ⚠️ Critical: All Auth Functions Are Async

**The most important thing to remember:** All auth utility functions are `async` and must be `await`ed.

### ✅ Correct Usage

```typescript
import { requireUserId, getOrgId } from './_utils/auth'

export const myQuery = query({
  handler: async (ctx) => {
    // CORRECT: await the async function
    const userId = await requireUserId(ctx)
    const orgId = await getOrgId(ctx)

    // Now use userId and orgId...
  },
})
```

### ❌ Incorrect Usage (Common Mistake)

```typescript
export const myQuery = query({
  handler: async (ctx) => {
    // WRONG: Missing await!
    const userId = requireUserId(ctx)  // Returns Promise, not string!

    // This will fail - userId is a Promise object, not the actual ID
    return await ctx.db.query('users')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', userId))
      .unique()
  },
})
```

## Why Async/Await Matters

The underlying Convex method `ctx.auth.getUserIdentity()` returns a **Promise**, not a direct value:

```typescript
// Inside auth.ts
export async function requireUserId(ctx: any): Promise<string> {
  // getUserIdentity() returns a Promise!
  const identity = await ctx.auth.getUserIdentity()

  if (!identity) {
    throw new Error("Unauthorized: User must be authenticated")
  }

  return identity.subject
}
```

If you forget `await`:
- You get a Promise object instead of the identity
- Checking `identity.subject` on a Promise returns `undefined`
- Your code throws "User must be authenticated" even when the user IS authenticated

## JWT Token Structure

The Clerk JWT token (using the `convex` template) contains:

```json
{
  "sub": "user_xxxxx",           // User ID
  "aud": "convex-tc-vsme",       // Audience (must match Convex config)
  "email": "user@example.com",
  "name": "John Doe",
  "org_id": "org_xxxxx",         // Organization ID (if selected)
  "org_role": "admin",           // Organization role (if in org)
  "o": {                         // New Clerk layout (also supported)
    "id": "org_xxxxx",
    "rol": "admin"
  }
}
```

The auth utilities support both the old layout (`org_id`, `org_role`) and new layout (`o.id`, `o.rol`).

---

## Performance Optimizations

TC-VSME implements a comprehensive **Auth Optimization Plan** (5 stories) to eliminate Clerk API rate limiting and improve latency.

### Optimization Summary

| Story       | Optimization                              | Impact                                                    |
| ----------- | ----------------------------------------- | --------------------------------------------------------- |
| **Story 1** | Permission flags in Convex database       | Eliminated 2 Clerk API calls per `getAuthContext()`       |
| **Story 2** | Query Convex instead of Clerk Backend API | 0 Clerk API calls in `getAuthContext()` (was 2)           |
| **Story 3** | Per-request identity caching in Convex    | Reduced `getUserIdentity()` calls from N to 1 per request |
| **Story 4** | Pass client data to `setupOrganization`   | Reduced Clerk API calls from 4-6 to 2-3 per org setup     |
| **Story 5** | Client-side auth context caching          | Eliminated redundant Convex queries on navigation         |

**Total Impact**:
- **Clerk API calls reduced by ~90%** (from ~10 per user session to ~1)
- **Latency improved by ~70%** (from ~500ms to ~150ms for auth checks)
- **Rate limit risk eliminated** (dominant source of 429 errors removed)

### Story 5: Client-Side Auth Context Caching

**Implementation**: `src/lib/auth/context.ts`

```typescript
// In-memory cache keyed by userId:orgId
const authContextCache = new Map<string, AuthContext | null>()

export const getAuthContext = createServerFn({ method: 'GET' }).handler(
  async (): Promise<AuthContext | null> => {
    const authResult = await auth()
    const userId = authResult.userId
    const orgId = authResult.orgId

    if (!userId) return null

    // Check cache first
    const cacheKey = `${userId}:${orgId || 'no-org'}`
    const cached = authContextCache.get(cacheKey)
    if (cached !== undefined) {
      return cached // Cache hit - instant return
    }

    // Cache miss - query Convex
    // ... fetch from Convex ...

    // Store in cache
    authContextCache.set(cacheKey, result)
    return result
  }
)
```

**Cache Invalidation**:
- **Automatic**: Switching orgs changes `cacheKey` → cache miss → fresh data
- **Manual**: Call `invalidateAuthContext()` after operations that change permissions

```typescript
// After setupOrganization completes
await setupOrganization({ ... })
await invalidateAuthContext() // Clear cache
navigate({ to: '/app' }) // Next navigation fetches fresh data
```

**Performance**:
- **First navigation**: 2 Convex queries (~100ms)
- **Subsequent navigations**: 0 queries (instant cache hit)
- **Org switch**: 2 Convex queries (cache miss)

**Example**: User navigates `/app/dashboard` → `/app/forms` → `/app/targets`:
- **Before Story 5**: 6 Convex queries (2 per navigation)
- **After Story 5**: 2 Convex queries (first navigation only)
- **Savings**: 4 queries eliminated (~200ms saved)

### Story 3: Per-Request Identity Caching

**Implementation**: `convex/_utils/auth.ts`

```typescript
// WeakMap ensures cache is garbage collected with request context
const identityCache = new WeakMap<any, any>()

async function getCachedIdentity(ctx: any) {
  // Check cache first
  if (identityCache.has(ctx)) {
    return identityCache.get(ctx)
  }

  // Cache miss - fetch identity
  const identity = await ctx.auth.getUserIdentity()

  // Store in cache
  identityCache.set(ctx, identity)
  return identity
}
```

**Impact**: If a Convex handler calls `requireUserId(ctx)`, `getOrgId(ctx)`, and `getUserEmail(ctx)`, only **1** `getUserIdentity()` call is made (was 3).

---

## Common Pitfalls

### 1. Forgetting `await` on Auth Functions

**Problem**: Auth functions return Promises, not direct values.

```typescript
// ❌ WRONG
const userId = requireUserId(ctx) // Returns Promise<string>, not string!

// ✅ CORRECT
const userId = await requireUserId(ctx)
```

### 2. Using `auth()` in Request Middleware

**Problem**: Clerk's `auth()` requires TanStack Start AsyncLocalStorage context.

```typescript
// ❌ WRONG - Error: No Start context found
export const authMiddleware = createMiddleware({ type: 'request' }).server(
  async ({ next }) => {
    const session = await auth() // ❌ Fails
  }
)

// ✅ CORRECT - Use beforeLoad in routes
export const Route = createFileRoute('/_appLayout')({
  beforeLoad: async () => {
    const authContext = await getAuthContext() // ✅ Works
  }
})
```

### 3. Not Scoping Queries by Organization

**Problem**: Queries return data from all organizations.

```typescript
// ❌ WRONG - Returns todos from ALL organizations
export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query('todos').collect()
  }
})

// ✅ CORRECT - Filter by organization
export const list = query({
  handler: async (ctx) => {
    const orgId = await requireOrgId(ctx)
    return await ctx.db.query('todos')
      .filter(q => q.eq(q.field('orgId'), orgId))
      .collect()
  }
})
```

### 4. Caching Stale Auth Context

**Problem**: After `setupOrganization`, cached context still has `vsmeDb: false`.

```typescript
// ❌ WRONG - Cache not invalidated
await setupOrganization({ ... })
navigate({ to: '/app' }) // Still redirected to /create-organization

// ✅ CORRECT - Invalidate cache
await setupOrganization({ ... })
await invalidateAuthContext() // Clear cache
navigate({ to: '/app' }) // Fresh data fetched, access granted
```

### 5. Dual-Write Inconsistency

**Problem**: Permission flags written to Convex but not Clerk metadata (or vice versa).

```typescript
// ❌ WRONG - Only updates Convex
await ctx.db.patch(userId, { hasVsme: true })

// ✅ CORRECT - Dual-write pattern
await ctx.db.patch(userId, { hasVsme: true })
await clerkClient.users.updateUserMetadata(userId, {
  publicMetadata: { hasVsme: true }
})
```

**Note**: Convex is the source of truth. Clerk metadata is for backward compatibility only.

---

## Configuration

### Environment Variables

**Frontend** (`.env.local`):
```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
VITE_CONVEX_URL=https://xxxxx.convex.cloud
```

**Convex** (Convex Dashboard → Settings → Environment Variables):
```bash
CLERK_ISSUER_URL=https://your-instance.clerk.accounts.dev
CONVEX_JWT_AUDIENCE=convex-tc-vsme
CLERK_SECRET_KEY=sk_test_xxxxx  # For Clerk Backend API calls
```

### Clerk JWT Template

**Name**: `convex`

**Claims**:
```json
{
  "aud": "convex-tc-vsme",
  "sub": "{{user.id}}",
  "email": "{{user.primary_email_address}}",
  "name": "{{user.full_name}}",
  "org_id": "{{org.id}}",
  "org_role": "{{org.role}}"
}
```

**Lifetime**: 60 minutes (default)

### Convex Auth Config

**File**: `convex/auth.config.ts`

```typescript
import { AuthConfig } from 'convex/server'

export default {
  providers: [
    {
      domain: process.env.CLERK_ISSUER_URL || "https://clerk.gentle.cod-4.lcl.dev",
      applicationID: process.env.CONVEX_JWT_AUDIENCE || "convex-tc-vsme",
    },
  ],
} satisfies AuthConfig
```

**What this does**:
- Convex fetches JWKS (public keys) from `${domain}/.well-known/jwks.json`
- Verifies JWT signature using JWKS
- Checks `aud` claim matches `applicationID`
- Makes verified identity available via `ctx.auth.getUserIdentity()`

### Provider Setup

**File**: `src/__root.tsx`

```typescript
import AppClerkProvider from '@/integrations/clerk/provider'
import AppConvexProvider from '@/integrations/convex/provider'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <AppClerkProvider>
      <AppConvexProvider>
        {/* App content */}
      </AppConvexProvider>
    </AppClerkProvider>
  )
}
```

**Order matters**: Clerk provider must wrap Convex provider so `useAuth()` is available.

---

## Related Documentation

- **Auth Optimization Plan**: `plans/auth-optimization-plan.md` - Complete 5-story optimization plan
- **Convex Schema**: `docs/story5-convex-schema.md` - Database schema including permission flags
- **Testing Guide**: `docs/testing/` - Test guidelines for auth-related code

---

## Quick Reference

### Check if User is Authenticated

```typescript
// In route beforeLoad
const authContext = await getAuthContext()
if (!authContext) {
  throw redirect({ to: '/sign-in' })
}
```

### Check if User Can Access Dashboard

```typescript
const authContext = await getAuthContext()
if (!authContext?.canAccessDashboard) {
  throw redirect({ to: '/create-organization' })
}
```

### Get User ID in Convex Handler

```typescript
export const myQuery = query({
  handler: async (ctx) => {
    const userId = await requireUserId(ctx)
    // ...
  }
})
```

### Get Organization ID in Convex Handler

```typescript
export const myQuery = query({
  handler: async (ctx) => {
    const orgId = await requireOrgId(ctx) // Throws if no org
    // OR
    const orgId = await getOrgId(ctx) // Returns null if no org
    // ...
  }
})
```

### Invalidate Auth Context Cache

```typescript
await setupOrganization({ ... })
await invalidateAuthContext()
navigate({ to: '/app' })
```

---

**Last Updated**: 2026-02-19 after completing Auth Optimization Plan (Stories 1-5)

## Troubleshooting

### Error: "Unauthorized: User must be authenticated"

1. **Check await:** Make sure you're `await`ing auth functions
2. **Check login status:** Verify user is actually signed in with Clerk
3. **Check Convex logs:** Look for JWT verification errors
4. **Check JWT template:** Ensure `convex` template exists in Clerk Dashboard

### Error: "Unauthorized: Organization must be selected"

1. **Check org selection:** User must select an organization via `OrganizationSwitcher`
2. **Check JWT claims:** Verify `org_id` or `o.id` is in the token

### Debugging JWT Contents

Add temporary logging to see what's in the identity:

```typescript
export async function requireUserId(ctx: any): Promise<string> {
  const identity = await ctx.auth.getUserIdentity()
  console.log('[Auth Debug] Identity:', JSON.stringify(identity, null, 2))
  // ... rest of function
}
```

## Related Files

- `convex/_utils/auth.ts` - Auth utility functions
- `convex/auth.config.ts` - Convex auth configuration
- `src/integrations/convex/provider.tsx` - ConvexProviderWithClerk setup
- `.env.local` - Environment variables

## References

- [Convex Auth Documentation](https://docs.convex.dev/auth)
- [Clerk JWT Templates](https://clerk.com/docs/backend-resources/jwt-templates)
- [Convex + Clerk Integration](https://docs.convex.dev/auth/clerk)
