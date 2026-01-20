# Agent Prompt: Implement Story 5

## Prompt for AI Agent

```
Implement Story 5: Convex Schema & Organization/User Mutations following the TDD implementation plan in docs/story5-implementation-plan.md.

**Context:**
- Users currently get stuck in a redirect loop after creating organizations through Clerk
- The problem: No Convex records are created, so vsmeDb flag stays false
- Solution: Create Convex database layer for organizations and users

**Implementation Requirements:**

Follow the 6-phase TDD approach documented in docs/story5-implementation-plan.md:

**Phase 1: Update Convex Schema**
- Modify convex/schema.ts to add organizations and users tables
- Organizations: clerkOrgId (string), name (string), indexed by clerkOrgId
- Users: clerkId (string), email (string), firstName (optional), lastName (optional), username (optional), organizationIds (array), updatedAt (number)
- Add proper indexes: by_clerkOrgId, by_clerkId, by_email
- Run `npx convex dev` to regenerate types

**Phase 2: Organizations Mutations (TDD)**
- Create convex/__tests__/organizations.test.ts FIRST with all test cases from the plan
- Run tests (should fail - red)
- Implement convex/organizations.ts with:
  - createOrganization mutation (throws error if duplicate)
  - getByClerkOrgId query (returns org or null)
  - exists query (returns boolean)
- Run tests until all pass (green)

**Phase 3: Users Mutations (TDD)**
- Create convex/__tests__/users.test.ts FIRST with all test cases from the plan
- Run tests (should fail - red)
- Implement convex/users.ts with:
  - upsertUser mutation (create new or update existing user's organizationIds)
  - getByClerkId query (returns user or null)
- Run tests until all pass (green)

**Phase 4: Server Integration Function**
- Create src/lib/convex/setup-organization.ts
- Implement setupOrganization server function that:
  1. Validates user authentication
  2. Creates Convex organization record (ignore "already exists" error)
  3. Upserts Convex user record
  4. Updates Clerk organization metadata with vsmeDb: true
  5. Returns { success: boolean, error?: string }
- Use ConvexHttpClient for server-side Convex calls
- Use clerkClient for Clerk API calls

**Phase 5: Frontend Integration**
- Update src/routes/create-organization.tsx
- Add imports: useState, useEffect, useNavigate, setupOrganization
- Add useEffect hook that:
  - Detects when authContext.orgId exists but vsmeDb is false
  - Calls setupOrganization with orgId and orgName
  - Shows loading state during setup
  - Redirects to /app on success
  - Shows error state on failure
- Add loading and error UI components

**Phase 6: End-to-End Testing**
- Test the complete flow manually:
  1. Sign in with Clerk
  2. Create organization via OrganizationSwitcher
  3. Verify Convex records are created
  4. Verify Clerk metadata updated (vsmeDb: true)
  5. Verify redirect to /app works
  6. Verify NO redirect loop
- Run all existing tests to ensure no regressions

**Key Patterns to Follow:**
- Use new Convex function syntax with args, returns, handler
- Use withIndex for queries (never use filter)
- Use .unique() for single document queries
- Follow Convex naming conventions: by_fieldName for indexes
- Handle optional fields properly with v.optional()
- Use ConvexTestingHelper for unit tests
- Follow TDD: tests first, then implementation

**Success Criteria:**
- All Convex tests pass
- User can create org → Convex records created → vsmeDb set → redirect to /app works
- No redirect loops
- Error handling works
- All existing tests still pass

**Reference Documents:**
- docs/story5-implementation-plan.md (detailed implementation guide)
- docs/story5-code-examples.md (quick reference code snippets)
- docs/story5-implementation-summary.md (overview and architecture)
- .agent/skills/convex/SKILL.md (Convex patterns and best practices)

Start with Phase 1 and work through each phase sequentially. Run tests after each phase to verify correctness before moving to the next phase.
```

## Alternative Shorter Prompt

```
Implement Story 5 following the TDD plan in docs/story5-implementation-plan.md:

1. Update convex/schema.ts with organizations and users tables
2. Write tests FIRST in convex/__tests__/organizations.test.ts, then implement convex/organizations.ts
3. Write tests FIRST in convex/__tests__/users.test.ts, then implement convex/users.ts
4. Create src/lib/convex/setup-organization.ts server function
5. Update src/routes/create-organization.tsx with useEffect integration
6. Test end-to-end: create org → Convex records → vsmeDb flag → redirect to /app (no loops)

Follow TDD strictly: write tests first, run (fail), implement, run (pass), refactor.
See docs/story5-implementation-plan.md for complete code examples and test cases.
```

## Copy-Paste Ready Prompt

```
Implement Story 5: Convex Schema & Organization/User Mutations using strict TDD.

Follow docs/story5-implementation-plan.md which contains:
- Complete test cases for all functions
- Full implementation code
- Step-by-step instructions

Execute phases 1-6 in order:
1. Schema: Add organizations & users tables to convex/schema.ts
2. Orgs TDD: Write tests → implement convex/organizations.ts → verify pass
3. Users TDD: Write tests → implement convex/users.ts → verify pass
4. Server: Create src/lib/convex/setup-organization.ts
5. Frontend: Update src/routes/create-organization.tsx with useEffect
6. E2E: Test complete flow, verify no redirect loops

Success = user creates org → Convex records created → vsmeDb: true → /app access works.
```

