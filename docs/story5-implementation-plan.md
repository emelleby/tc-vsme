# Story 5: Convex Schema & Organization/User Mutations - Implementation Plan

## Overview

This document provides a complete TDD implementation plan for Story 5, which creates the Convex database layer for organization and user management, integrating with Clerk authentication.

## Current State Analysis

### What's Working
- ✅ Clerk authentication with JWT tokens
- ✅ Route-level protection in `_appLayout`
- ✅ `/create-organization` page with OrganizationSwitcher
- ✅ Auth context utilities (`getAuthContext`)
- ✅ Convex provider configured in app

### The Problem
Users get stuck in a redirect loop:
1. User creates org via Clerk UI → `orgId` set in session
2. Clerk redirects to `/app` (via `afterCreateOrganizationUrl`)
3. `_appLayout` checks `vsmeDb` flag → **still false** (no Convex record)
4. Redirects back to `/create-organization` → **infinite loop**

### The Solution
Create Convex records when organization is created/selected, then update Clerk metadata with `vsmeDb: true`.

---

## Implementation Strategy: Test-Driven Development (TDD)

We'll follow strict TDD:
1. **Write tests first** for each Convex function
2. **Run tests** (they should fail)
3. **Implement** the minimal code to pass tests
4. **Refactor** if needed
5. **Integrate** with frontend

---

## Phase 1: Schema Definition

### File: `convex/schema.ts`

**Requirements:**
- Organizations table with `clerkOrgId`, `name`, indexed by `clerkOrgId`
- Users table with `clerkId`, `email`, `firstName`, `lastName`, `username`, `organizationIds[]`
- Proper indexes for efficient lookups

**Schema Design (following Convex patterns):**

```typescript
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  // Existing tables
  products: defineTable({
    title: v.string(),
    imageId: v.string(),
    price: v.number(),
  }),
  todos: defineTable({
    text: v.string(),
    completed: v.boolean(),
  }),
  
  // New: Organizations table
  organizations: defineTable({
    clerkOrgId: v.string(),
    name: v.string(),
    // System fields _id and _creationTime are added automatically
  }).index('by_clerkOrgId', ['clerkOrgId']),
  
  // New: Users table
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    username: v.optional(v.string()),
    organizationIds: v.array(v.string()), // Array of Clerk org IDs
    updatedAt: v.number(), // Manual timestamp for updates
  })
    .index('by_clerkId', ['clerkId'])
    .index('by_email', ['email']),
})
```

**Key Design Decisions:**
- Use `clerkOrgId` (not just `orgId`) to be explicit about Clerk IDs
- Index naming follows Convex convention: `by_<field>` for single field indexes
- `organizationIds` is an array to support users in multiple orgs
- `updatedAt` is manual (unlike `_creationTime` which is automatic)
- Optional fields use `v.optional()` for nullable data from Clerk

---

## Phase 2: Organizations Mutations (TDD)

### File: `convex/organizations.ts`

**Test File:** `convex/__tests__/organizations.test.ts`

**Functions to implement:**
1. `createOrganization` - Create org record
2. `getByClerkOrgId` - Fetch org by Clerk ID
3. `exists` - Check if org exists (helper for upsert logic)

**Test Cases (write these FIRST):**

```typescript
// convex/__tests__/organizations.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { ConvexTestingHelper } from 'convex-test'
import { api } from '../_generated/api'
import schema from '../schema'

describe('organizations mutations', () => {
  let t: ConvexTestingHelper<typeof schema>

  beforeEach(async () => {
    t = new ConvexTestingHelper(schema)
    await t.run(async (ctx) => {
      // Clear organizations table before each test
      const orgs = await ctx.db.query('organizations').collect()
      for (const org of orgs) {
        await ctx.db.delete(org._id)
      }
    })
  })

  describe('createOrganization', () => {
    it('creates organization with clerkOrgId and name', async () => {
      const orgId = await t.mutation(api.organizations.createOrganization, {
        clerkOrgId: 'org_123',
        name: 'Test Org'
      })

      expect(orgId).toBeDefined()

      const org = await t.query(api.organizations.getByClerkOrgId, {
        clerkOrgId: 'org_123'
      })

      expect(org).toMatchObject({
        clerkOrgId: 'org_123',
        name: 'Test Org'
      })
    })

    it('throws error for duplicate clerkOrgId', async () => {
      await t.mutation(api.organizations.createOrganization, {
        clerkOrgId: 'org_123',
        name: 'Test Org'
      })

      await expect(
        t.mutation(api.organizations.createOrganization, {
          clerkOrgId: 'org_123',
          name: 'Duplicate Org'
        })
      ).rejects.toThrow('Organization already exists')
    })
  })

  describe('getByClerkOrgId', () => {
    it('fetches organization by clerkOrgId', async () => {
      await t.mutation(api.organizations.createOrganization, {
        clerkOrgId: 'org_456',
        name: 'Another Org'
      })

      const org = await t.query(api.organizations.getByClerkOrgId, {
        clerkOrgId: 'org_456'
      })

      expect(org?.name).toBe('Another Org')
    })

    it('returns null for non-existent org', async () => {
      const org = await t.query(api.organizations.getByClerkOrgId, {
        clerkOrgId: 'org_nonexistent'
      })

      expect(org).toBeNull()
    })
  })

  describe('exists', () => {
    it('returns true when org exists', async () => {
      await t.mutation(api.organizations.createOrganization, {
        clerkOrgId: 'org_789',
        name: 'Existing Org'
      })

      const exists = await t.query(api.organizations.exists, {
        clerkOrgId: 'org_789'
      })

      expect(exists).toBe(true)
    })

    it('returns false when org does not exist', async () => {
      const exists = await t.query(api.organizations.exists, {
        clerkOrgId: 'org_nonexistent'
      })

      expect(exists).toBe(false)
    })
  })
})
```

**Implementation (write AFTER tests):**

```typescript
// convex/organizations.ts
import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

/**
 * Create a new organization record in Convex.
 * Throws error if organization with same clerkOrgId already exists.
 */
export const createOrganization = mutation({
  args: {
    clerkOrgId: v.string(),
    name: v.string(),
  },
  returns: v.id('organizations'),
  handler: async (ctx, args) => {
    // Check if org already exists
    const existing = await ctx.db
      .query('organizations')
      .withIndex('by_clerkOrgId', (q) => q.eq('clerkOrgId', args.clerkOrgId))
      .unique()

    if (existing) {
      throw new Error('Organization already exists')
    }

    // Create new organization
    return await ctx.db.insert('organizations', {
      clerkOrgId: args.clerkOrgId,
      name: args.name,
    })
  },
})

/**
 * Fetch organization by Clerk organization ID.
 * Returns null if not found.
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
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query('organizations')
      .withIndex('by_clerkOrgId', (q) => q.eq('clerkOrgId', args.clerkOrgId))
      .unique()
  },
})

/**
 * Check if organization exists by Clerk organization ID.
 */
export const exists = query({
  args: {
    clerkOrgId: v.string(),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const org = await ctx.db
      .query('organizations')
      .withIndex('by_clerkOrgId', (q) => q.eq('clerkOrgId', args.clerkOrgId))
      .unique()

    return org !== null
  },
})
```

---

## Phase 3: Users Mutations (TDD)

### File: `convex/users.ts`

**Test File:** `convex/__tests__/users.test.ts`

**Functions to implement:**
1. `upsertUser` - Create or update user record
2. `getByClerkId` - Fetch user by Clerk ID
3. `addOrganization` - Add org to user's organizationIds (helper)

**Test Cases (write these FIRST):**

```typescript
// convex/__tests__/users.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { ConvexTestingHelper } from 'convex-test'
import { api } from '../_generated/api'
import schema from '../schema'

describe('users mutations', () => {
  let t: ConvexTestingHelper<typeof schema>

  beforeEach(async () => {
    t = new ConvexTestingHelper(schema)
    await t.run(async (ctx) => {
      // Clear users table before each test
      const users = await ctx.db.query('users').collect()
      for (const user of users) {
        await ctx.db.delete(user._id)
      }
    })
  })

  describe('upsertUser', () => {
    it('creates new user with all fields', async () => {
      const userId = await t.mutation(api.users.upsertUser, {
        clerkId: 'user_123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        organizationId: 'org_456',
      })

      expect(userId).toBeDefined()

      const user = await t.query(api.users.getByClerkId, {
        clerkId: 'user_123'
      })

      expect(user).toMatchObject({
        clerkId: 'user_123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        organizationIds: ['org_456'],
      })
    })

    it('creates user with minimal fields (no firstName, lastName, username)', async () => {
      const userId = await t.mutation(api.users.upsertUser, {
        clerkId: 'user_minimal',
        email: 'minimal@example.com',
        organizationId: 'org_789',
      })

      const user = await t.query(api.users.getByClerkId, {
        clerkId: 'user_minimal'
      })

      expect(user).toMatchObject({
        clerkId: 'user_minimal',
        email: 'minimal@example.com',
        organizationIds: ['org_789'],
      })
      expect(user?.firstName).toBeUndefined()
      expect(user?.lastName).toBeUndefined()
      expect(user?.username).toBeUndefined()
    })

    it('updates existing user and adds new organizationId', async () => {
      // Create user with first org
      await t.mutation(api.users.upsertUser, {
        clerkId: 'user_multi',
        email: 'multi@example.com',
        organizationId: 'org_first',
      })

      // Add second org
      await t.mutation(api.users.upsertUser, {
        clerkId: 'user_multi',
        email: 'multi@example.com',
        organizationId: 'org_second',
      })

      const user = await t.query(api.users.getByClerkId, {
        clerkId: 'user_multi'
      })

      expect(user?.organizationIds).toEqual(['org_first', 'org_second'])
    })

    it('does not duplicate organizationId if already present', async () => {
      await t.mutation(api.users.upsertUser, {
        clerkId: 'user_dup',
        email: 'dup@example.com',
        organizationId: 'org_same',
      })

      // Try to add same org again
      await t.mutation(api.users.upsertUser, {
        clerkId: 'user_dup',
        email: 'dup@example.com',
        organizationId: 'org_same',
      })

      const user = await t.query(api.users.getByClerkId, {
        clerkId: 'user_dup'
      })

      expect(user?.organizationIds).toEqual(['org_same'])
    })
  })

  describe('getByClerkId', () => {
    it('fetches user by clerkId', async () => {
      await t.mutation(api.users.upsertUser, {
        clerkId: 'user_fetch',
        email: 'fetch@example.com',
        organizationId: 'org_test',
      })

      const user = await t.query(api.users.getByClerkId, {
        clerkId: 'user_fetch'
      })

      expect(user?.email).toBe('fetch@example.com')
    })

    it('returns null for non-existent user', async () => {
      const user = await t.query(api.users.getByClerkId, {
        clerkId: 'user_nonexistent'
      })

      expect(user).toBeNull()
    })
  })
})
```

**Implementation (write AFTER tests):**

```typescript
// convex/users.ts
import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

/**
 * Upsert user record: create if not exists, update organizationIds if exists.
 * This handles both new users and existing users joining additional organizations.
 */
export const upsertUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    username: v.optional(v.string()),
    organizationId: v.string(),
  },
  returns: v.id('users'),
  handler: async (ctx, args) => {
    // Check if user already exists
    const existing = await ctx.db
      .query('users')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', args.clerkId))
      .unique()

    if (existing) {
      // User exists: add organizationId if not already present
      const orgIds = existing.organizationIds || []
      if (!orgIds.includes(args.organizationId)) {
        await ctx.db.patch(existing._id, {
          organizationIds: [...orgIds, args.organizationId],
          updatedAt: Date.now(),
        })
      }
      return existing._id
    }

    // User doesn't exist: create new record
    const userData: any = {
      clerkId: args.clerkId,
      email: args.email,
      organizationIds: [args.organizationId],
      updatedAt: Date.now(),
    }

    // Add optional fields only if provided
    if (args.firstName !== undefined) {
      userData.firstName = args.firstName
    }
    if (args.lastName !== undefined) {
      userData.lastName = args.lastName
    }
    if (args.username !== undefined) {
      userData.username = args.username
    }

    return await ctx.db.insert('users', userData)
  },
})

/**
 * Fetch user by Clerk user ID.
 * Returns null if not found.
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
    return await ctx.db
      .query('users')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', args.clerkId))
      .unique()
  },
})
```

---

## Phase 4: Server-Side Integration Function

### File: `src/lib/convex/setup-organization.ts`

This server function orchestrates the complete setup flow:
1. Create Convex organization record
2. Upsert Convex user record
3. Update Clerk metadata with `vsmeDb: true`
4. Return success/error status

**Implementation:**

```typescript
// src/lib/convex/setup-organization.ts
import { createServerFn } from '@tanstack/react-start'
import { auth, clerkClient } from '@clerk/tanstack-react-start/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../../convex/_generated/api'

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL
if (!CONVEX_URL) {
  throw new Error('VITE_CONVEX_URL is not set')
}

interface SetupOrganizationResult {
  success: boolean
  error?: string
}

/**
 * Server function to set up organization in Convex and update Clerk metadata.
 * Called when user creates/selects an organization.
 */
export const setupOrganization = createServerFn({ method: 'POST' })
  .validator((data: { orgId: string; orgName: string }) => data)
  .handler(async ({ data }): Promise<SetupOrganizationResult> => {
    try {
      // Get authenticated user
      const { userId, orgId } = await auth()

      if (!userId) {
        return { success: false, error: 'Not authenticated' }
      }

      if (!orgId || orgId !== data.orgId) {
        return { success: false, error: 'Organization mismatch' }
      }

      // Get Clerk client
      const client = await clerkClient()

      // Fetch user details from Clerk
      const user = await client.users.getUser(userId)

      // Initialize Convex client (server-side)
      const convex = new ConvexHttpClient(CONVEX_URL)

      // Step 1: Create organization in Convex (if not exists)
      try {
        await convex.mutation(api.organizations.createOrganization, {
          clerkOrgId: data.orgId,
          name: data.orgName,
        })
      } catch (error: any) {
        // Ignore "already exists" error
        if (!error.message?.includes('already exists')) {
          throw error
        }
      }

      // Step 2: Upsert user in Convex
      await convex.mutation(api.users.upsertUser, {
        clerkId: userId,
        email: user.emailAddresses[0]?.emailAddress || '',
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        username: user.username || undefined,
        organizationId: data.orgId,
      })

      // Step 3: Update Clerk organization metadata
      await client.organizations.updateOrganizationMetadata(data.orgId, {
        publicMetadata: {
          hasVsme: true,
          vsmeDb: true,
        },
      })

      return { success: true }
    } catch (error: any) {
      console.error('Setup organization error:', error)
      return {
        success: false,
        error: error.message || 'Failed to set up organization',
      }
    }
  })
```

---

## Phase 5: Frontend Integration

### File: `src/routes/create-organization.tsx`

Replace the TODO comment (line 127) with actual integration logic.

**Implementation:**

```typescript
// Add imports at top of file
import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { setupOrganization } from '@/lib/convex/setup-organization'

// Inside CreateOrganizationPage component, add:
function CreateOrganizationPage() {
  const { authContext } = Route.useRouteContext()
  const { user, organization } = useUser()
  const navigate = useNavigate()
  const [isSettingUp, setIsSettingUp] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Listen for organization changes
  useEffect(() => {
    const setupOrgInConvex = async () => {
      // Only proceed if:
      // 1. User has selected an org
      // 2. Org doesn't have vsmeDb flag yet
      // 3. Not already setting up
      if (!authContext.orgId || authContext.vsmeDb || isSettingUp) {
        return
      }

      // Get org name from Clerk
      const orgName = organization?.name || 'Unknown Organization'

      setIsSettingUp(true)
      setError(null)

      try {
        const result = await setupOrganization({
          data: {
            orgId: authContext.orgId,
            orgName,
          },
        })

        if (result.success) {
          // Success! Redirect to dashboard
          // The _appLayout route will now pass because vsmeDb is true
          navigate({ to: '/app' })
        } else {
          setError(result.error || 'Failed to set up organization')
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred')
      } finally {
        setIsSettingUp(false)
      }
    }

    setupOrgInConvex()
  }, [authContext.orgId, authContext.vsmeDb, organization, navigate, isSettingUp])

  // Show loading state while setting up
  if (isSettingUp) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground">Setting up your organization...</p>
          </div>
        </div>
      </>
    )
  }

  // Show error if setup failed
  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="max-w-md p-8 space-y-4 text-center">
            <div className="text-destructive text-4xl">⚠️</div>
            <h2 className="text-2xl font-bold">Setup Failed</h2>
            <p className="text-muted-foreground">{error}</p>
            <button
              onClick={() => setError(null)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Try Again
            </button>
          </div>
        </div>
      </>
    )
  }

  // Rest of existing component code...
}
```

---

## Phase 6: Testing Strategy

### Unit Tests (Convex Functions)

**Location:** `convex/__tests__/`

1. `organizations.test.ts` - Test all organization mutations/queries
2. `users.test.ts` - Test all user mutations/queries

**Run with:**
```bash
npm run test:convex
```

### Integration Tests (Server Function)

**Location:** `src/lib/convex/__tests__/setup-organization.test.ts`

Test the complete flow:
- Mock Clerk client
- Mock Convex client
- Verify correct sequence of operations
- Test error handling

### E2E Tests (Optional)

Test the complete user journey:
1. Sign in with Clerk
2. Create organization
3. Verify redirect to dashboard
4. Verify no redirect loop

---

## Implementation Checklist

### Phase 1: Schema ✅
- [ ] Update `convex/schema.ts` with organizations and users tables
- [ ] Run `npx convex dev` to regenerate types
- [ ] Verify no TypeScript errors

### Phase 2: Organizations (TDD) ✅
- [ ] Write tests in `convex/__tests__/organizations.test.ts`
- [ ] Run tests (should fail)
- [ ] Implement `convex/organizations.ts`
- [ ] Run tests (should pass)

### Phase 3: Users (TDD) ✅
- [ ] Write tests in `convex/__tests__/users.test.ts`
- [ ] Run tests (should fail)
- [ ] Implement `convex/users.ts`
- [ ] Run tests (should pass)

### Phase 4: Server Integration ✅
- [ ] Create `src/lib/convex/setup-organization.ts`
- [ ] Write integration tests
- [ ] Verify server function works

### Phase 5: Frontend Integration ✅
- [ ] Update `src/routes/create-organization.tsx`
- [ ] Add loading and error states
- [ ] Test manually in browser

### Phase 6: End-to-End Testing ✅
- [ ] Test complete flow: sign in → create org → dashboard
- [ ] Verify no redirect loops
- [ ] Test error scenarios

---

## Success Criteria

Story 5 is complete when:

1. ✅ All Convex tests pass
2. ✅ User can create organization → Convex records created
3. ✅ Clerk metadata updated with `vsmeDb: true`
4. ✅ User redirects to `/app` successfully
5. ✅ No redirect loops
6. ✅ Error handling works correctly
7. ✅ All existing tests still pass

---

## Next Steps After Story 5

Once Story 5 is complete, the authentication flow will be fully functional:
- Users can sign up
- Users can create organizations
- Organizations are stored in Convex
- Users can access the dashboard
- Multi-tenant data isolation is ready for Story 8

**Story 8** (Dashboard with Organization Data) can then query Convex with organization filters to display org-specific data.


