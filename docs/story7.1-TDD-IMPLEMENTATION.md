# Story 7.1: TDD Implementation Guide

## 🎯 Start Here: TDD Implementation Prompt

**Use this prompt to implement Story 7.1 in a Test-Driven Development (TDD) fashion.**

---

## Implementation Order (TDD: Red → Green → Refactor)

### Phase 1: MongoDB Client (2 hours)

**Prompt:**
```
Implement Story 7.1 Phase 1: MongoDB Client with Connection Pooling

Reference: docs/story7.1-technical-reference.md (MongoDB Client Pattern section)

TDD Approach:
1. RED: Write tests first in convex/__tests__/mongodb-client.test.ts
   - Test: Connection pooling returns same instance
   - Test: Connection timeout handling
   - Test: Connection error handling
   - Test: Close connection works

2. GREEN: Implement convex/mongodb/client.ts
   - Singleton pattern with getMongoClient()
   - Connection pooling
   - Error handling
   - Timeout handling

3. REFACTOR: Clean up, add logging, optimize

Success: All tests pass, connection reused on subsequent calls
```

### Phase 2: MongoDB Query Functions (1.5 hours)

**Prompt:**
```
Implement Story 7.1 Phase 2: MongoDB Query Functions

Reference: docs/story7.1-technical-reference.md (MongoDB Query Pattern section)

TDD Approach:
1. RED: Write tests in convex/mongodb/__tests__/queries.test.ts
   - Test: Fetch company by valid OrgId
   - Test: Fetch company by invalid OrgId returns null
   - Test: Fetch emissions for specific year
   - Test: Handle missing Emissions field
   - Test: Handle MongoDB connection error

2. GREEN: Implement convex/mongodb/queries.ts
   - fetchCompanyByOrgId(orgId)
   - fetchEmissionsByOrgId(orgId, year?)
   - Error handling and null checks

3. REFACTOR: Add logging, optimize queries

Success: All tests pass, queries handle all scenarios
```

### Phase 3: Convex Action (1.5 hours)

**Prompt:**
```
Implement Story 7.1 Phase 3: Convex Action with Auth

Reference: docs/story7.1-technical-reference.md (Convex Action Pattern section)

TDD Approach:
1. RED: Write tests in convex/__tests__/emissions.test.ts
   - Test: Authenticated user can fetch emissions
   - Test: Unauthenticated user gets error
   - Test: User cannot access other org's data
   - Test: Invalid OrgId returns null
   - Test: MongoDB error handled gracefully

2. GREEN: Implement convex/emissions.ts
   - getEmissionsByOrgId action
   - requireUserId() check
   - getOrgId() check
   - Cross-org access prevention
   - Error handling

3. REFACTOR: Add response typing, logging

Success: All tests pass, auth and authorization verified
```

### Phase 4: Dashboard Component (1 hour)

**Prompt:**
```
Implement Story 7.1 Phase 4: Dashboard Component

Reference: docs/story7.1-technical-reference.md (Dashboard Component Pattern section)

TDD Approach:
1. RED: Write tests in src/routes/_appLayout/app/__tests__/emissions.test.tsx
   - Test: Component renders loading state
   - Test: Component displays emissions data
   - Test: Component shows error state
   - Test: Component shows no-data message
   - Test: Calls action with correct orgId

2. GREEN: Implement src/routes/_appLayout/app/emissions.tsx
   - useUser() hook
   - useAction() hook
   - State management (data, loading, error)
   - Render states

3. REFACTOR: Add styling, improve UX

Success: All tests pass, component displays 2024 emissions
```

---

## Essential Documentation

**Only read these sections:**

1. **story7.1-quick-reference.md** (2 min)
   - Code templates
   - File structure
   - Testing checklist

2. **story7.1-technical-reference.md** (10 min)
   - MongoDB Client Pattern
   - Convex Action Pattern
   - MongoDB Query Pattern
   - Dashboard Component Pattern
   - Testing Patterns

3. **story7.1-implementation-checklist.md** (5 min)
   - Testing Strategy section
   - Test Cases section

**Skip for now:**
- story7.1-overview.md (already reviewed)
- story7.1-mongodb-integration-plan.md (already reviewed)
- story7.1-architecture-diagrams.md (reference if confused)
- story7.1-faq-troubleshooting.md (reference if stuck)

---

## TDD Workflow

### For Each Phase:

1. **RED Phase** (Write failing tests)
   ```bash
   bun run vitest --watch
   # Watch tests fail
   ```

2. **GREEN Phase** (Make tests pass)
   ```bash
   # Implement code
   # Watch tests pass
   ```

3. **REFACTOR Phase** (Clean up)
   ```bash
   # Improve code quality
   # Ensure tests still pass
   ```

---

## Test Data

**Test Organization:**
- OrgId: `org_2tWO47gV8vEOLN1lrpV57N02Dh2`
- Company: DuoZink AS
- Has 2024 emissions data

**Mock Data for Tests:**
```typescript
const mockEmissions = {
  TotalCo2: 4209.17,
  co2Intensity: 935.37,
  Scope1: 14.94,
  Scope2: 185.52,
  Scope3: 4008.71,
  locked: true,
  updatedAt: new Date("2025-10-26T00:21:58.392Z")
};
```

---

## Commands

```bash
# Start Convex dev server
npx convex dev

# Run tests in watch mode
bun run vitest --watch

# Run specific test file
bun run vitest convex/__tests__/emissions.test.ts

# Run with coverage
bun run vitest --coverage

# Start React app
bun run dev
```

---

## Success Criteria

- [x] All unit tests pass
- [x] All integration tests pass
- [x] MongoDB client uses connection pooling
- [x] Convex action verifies auth and authorization
- [x] Dashboard displays 2024 emissions data
- [x] Cross-org access prevented
- [x] No-data case handled
- [x] Error handling works for all scenarios

---

## Estimated Timeline

- Phase 1 (MongoDB Client): 2 hours
- Phase 2 (Query Functions): 1.5 hours
- Phase 3 (Convex Action): 1.5 hours
- Phase 4 (Dashboard): 1 hour
- **Total**: ~6 hours

---

## If You Get Stuck

1. Check **story7.1-faq-troubleshooting.md** for common issues
2. Review **story7.1-technical-reference.md** for code patterns
3. Check **story7.1-architecture-diagrams.md** for flow understanding
4. Ask team for clarification

---

## Ready to Start?

Begin with Phase 1:

**Prompt to use:**
```
Implement Story 7.1 Phase 1: MongoDB Client with Connection Pooling

Reference: docs/story7.1-technical-reference.md (MongoDB Client Pattern section)

TDD Approach:
1. RED: Write tests first in convex/__tests__/mongodb-client.test.ts
   - Test: Connection pooling returns same instance
   - Test: Connection timeout handling
   - Test: Connection error handling
   - Test: Close connection works

2. GREEN: Implement convex/mongodb/client.ts
   - Singleton pattern with getMongoClient()
   - Connection pooling
   - Error handling
   - Timeout handling

3. REFACTOR: Clean up, add logging, optimize

Success: All tests pass, connection reused on subsequent calls
```

Good luck! 🚀

