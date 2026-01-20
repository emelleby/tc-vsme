# Story 5: Implementation Summary

## Executive Summary

This document provides a complete implementation plan for **Story 5: Convex Schema & Organization/User Mutations**, which solves the redirect loop problem by creating Convex database records when users create organizations through Clerk.

## Problem Statement

**Current Issue:** Users get stuck in a redirect loop after creating an organization:
1. User creates org via Clerk → `orgId` set in session
2. Clerk redirects to `/app`
3. `_appLayout` checks `vsmeDb` flag → **still false** (no Convex record exists)
4. Redirects back to `/create-organization` → **infinite loop**

**Root Cause:** No Convex records are created when organizations are set up through Clerk UI.

## Solution Overview

Implement a complete database layer in Convex with:
- **Organizations table** - Store org records with Clerk org IDs
- **Users table** - Store user records with multi-org support
- **Mutations** - Create/update org and user records
- **Server function** - Orchestrate the setup flow
- **Frontend integration** - Trigger setup when org is created

## Architecture

### Data Flow

```
User creates org in Clerk UI
  ↓
Clerk creates org record (orgId generated)
  ↓
Frontend detects orgId change
  ↓
Call setupOrganization() server function
  ↓
  1. Create Convex organization record
  2. Upsert Convex user record
  3. Update Clerk metadata (vsmeDb: true)
  ↓
Redirect to /app
  ↓
_appLayout checks vsmeDb → ✅ true
  ↓
User accesses dashboard
```

### Key Components

1. **Convex Schema** (`convex/schema.ts`)
   - Organizations table with `clerkOrgId` index
   - Users table with `clerkId` and `email` indexes
   - Support for multi-org users via `organizationIds[]`

2. **Convex Mutations** (`convex/organizations.ts`, `convex/users.ts`)
   - `createOrganization` - Create org record (error if duplicate)
   - `getByClerkOrgId` - Fetch org by Clerk ID
   - `upsertUser` - Create or update user record
   - `getByClerkId` - Fetch user by Clerk ID

3. **Server Function** (`src/lib/convex/setup-organization.ts`)
   - Orchestrates the complete setup flow
   - Handles errors gracefully
   - Updates Clerk metadata

4. **Frontend Integration** (`src/routes/create-organization.tsx`)
   - Detects when org is created/selected
   - Calls server function
   - Shows loading/error states
   - Redirects to dashboard on success

## Implementation Approach: TDD

We follow **Test-Driven Development**:

1. **Write tests first** for each Convex function
2. **Run tests** (they should fail - red)
3. **Implement** minimal code to pass tests (green)
4. **Refactor** if needed
5. **Integrate** with frontend

### Why TDD?

- ✅ Ensures correctness from the start
- ✅ Prevents regressions
- ✅ Documents expected behavior
- ✅ Faster debugging (tests pinpoint issues)
- ✅ Confidence in refactoring

## File Structure

```
convex/
├── schema.ts                          # Updated with orgs & users tables
├── organizations.ts                   # NEW: Org mutations/queries
├── users.ts                           # NEW: User mutations/queries
└── __tests__/
    ├── organizations.test.ts          # NEW: Org tests
    └── users.test.ts                  # NEW: User tests

src/
├── lib/
│   └── convex/
│       ├── setup-organization.ts      # NEW: Server function
│       └── __tests__/
│           └── setup-organization.test.ts  # NEW: Integration tests
└── routes/
    └── create-organization.tsx        # MODIFIED: Add useEffect integration
```

## Implementation Phases

### Phase 1: Schema Definition ✅
- Update `convex/schema.ts`
- Run `npx convex dev` to regenerate types
- Verify no TypeScript errors

### Phase 2: Organizations (TDD) ✅
- Write tests in `convex/__tests__/organizations.test.ts`
- Implement `convex/organizations.ts`
- Verify all tests pass

### Phase 3: Users (TDD) ✅
- Write tests in `convex/__tests__/users.test.ts`
- Implement `convex/users.ts`
- Verify all tests pass

### Phase 4: Server Integration ✅
- Create `src/lib/convex/setup-organization.ts`
- Write integration tests
- Verify server function works

### Phase 5: Frontend Integration ✅
- Update `src/routes/create-organization.tsx`
- Add loading and error states
- Test manually in browser

### Phase 6: End-to-End Testing ✅
- Test complete flow: sign in → create org → dashboard
- Verify no redirect loops
- Test error scenarios

## Key Design Decisions

### 1. Multi-Organization Support
Users can belong to multiple organizations:
- `users.organizationIds` is an array of Clerk org IDs
- `upsertUser` adds new orgs without duplicating

### 2. Upsert Pattern
`upsertUser` handles both cases:
- **New user:** Create record with first org
- **Existing user:** Add org to `organizationIds` array

### 3. Error Handling
- Duplicate org creation is handled gracefully (ignore error)
- Server function returns `{ success, error }` for frontend handling
- Loading and error states in UI

### 4. Clerk Metadata Update
After successful Convex record creation:
```typescript
await client.organizations.updateOrganizationMetadata(orgId, {
  publicMetadata: { hasVsme: true, vsmeDb: true }
})
```

This flag is checked by `_appLayout` to allow dashboard access.

## Testing Strategy

### Unit Tests (Convex Functions)
- Test each mutation/query in isolation
- Use `ConvexTestingHelper` for in-memory testing
- Cover success and error cases

### Integration Tests (Server Function)
- Mock Clerk client
- Mock Convex client
- Verify correct sequence of operations

### Manual Testing
- Create organization via Clerk UI
- Verify Convex records created
- Verify redirect to dashboard works
- Verify no redirect loops

## Success Criteria

Story 5 is complete when:

1. ✅ All Convex tests pass
2. ✅ User can create organization → Convex records created
3. ✅ Clerk metadata updated with `vsmeDb: true`
4. ✅ User redirects to `/app` successfully
5. ✅ No redirect loops
6. ✅ Error handling works correctly
7. ✅ All existing tests still pass

## Next Steps

After Story 5 is complete:
- **Story 8:** Dashboard with Organization Data
  - Query Convex with organization filters
  - Display org-specific data
  - Multi-tenant data isolation

## References

- [Convex Skill Documentation](.agent/skills/convex/SKILL.md)
- [Authentication Implementation Plan](./authentication-implementation-plan.md)
- [Story 3 to Story 5 Handover](./story3-to-story5-handover.md)
- [Code Examples](./story5-code-examples.md)
- [Detailed Implementation Plan](./story5-implementation-plan.md)

