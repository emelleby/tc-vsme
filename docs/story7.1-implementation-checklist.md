# Story 7.1: Implementation Checklist & Testing Strategy

## Pre-Implementation Verification

### Environment Setup
- [ ] Verify `MONGODB_URI` is set in `.env.local`
- [ ] Verify MongoDB database `co2-intensities-dev` exists
- [ ] Verify `companies` collection exists with test data
- [ ] Verify test OrgId exists: `org_2tWO47gV8vEOLN1lrpV57N02Dh2`
- [ ] Verify Convex dev server can be started: `npx convex dev`
- [ ] Verify MongoDB connection is accessible from dev environment

### Dependencies Check
- [ ] `mongodb` package available (check `package.json`)
- [ ] `convex` package version compatible
- [ ] Node.js version supports MongoDB driver

## Implementation Checklist

### Phase 1: MongoDB Client Setup
- [ ] Create `convex/mongodb/client.ts`
  - [ ] Implement singleton pattern
  - [ ] Add connection pooling
  - [ ] Add error handling
  - [ ] Add connection timeout
  - [ ] Add logging
- [ ] Create `convex/mongodb/queries.ts`
  - [ ] Implement `fetchCompanyByOrgId()`
  - [ ] Implement `fetchEmissionsByOrgId()`
  - [ ] Add null checks
  - [ ] Add error handling
  - [ ] Add logging

### Phase 2: Convex Action Implementation
- [ ] Create `convex/emissions.ts`
  - [ ] Import auth utilities
  - [ ] Implement `getEmissionsByOrgId` action
  - [ ] Add `requireUserId` check
  - [ ] Add `getOrgId` check
  - [ ] Add cross-org access prevention
  - [ ] Add error handling
  - [ ] Add response typing
- [ ] Update `convex/schema.ts` if needed
- [ ] Verify action is exported in `convex/_generated/api.ts`

### Phase 3: Type Definitions
- [ ] Create `convex/types.ts`
  - [ ] Define `EmissionsYear` interface
  - [ ] Define `CompanyEmissions` interface
  - [ ] Define `Company` interface
  - [ ] Define action response types

### Phase 4: Testing Implementation
- [ ] Create `convex/__tests__/emissions.test.ts`
  - [ ] Test happy path (valid org)
  - [ ] Test not found (invalid org)
  - [ ] Test unauthorized (cross-org access)
  - [ ] Test connection error
  - [ ] Test invalid data
- [ ] Create `convex/mongodb/__tests__/queries.test.ts`
  - [ ] Test MongoDB connection
  - [ ] Test query with valid OrgId
  - [ ] Test query with invalid OrgId
  - [ ] Test null handling
  - [ ] Test error scenarios

### Phase 5: Dashboard Integration
- [ ] Create `src/routes/_appLayout/app/emissions.tsx`
  - [ ] Import `useAction` hook
  - [ ] Get user's orgId from Clerk
  - [ ] Call Convex action
  - [ ] Handle loading state
  - [ ] Handle error state
  - [ ] Handle no-data state
  - [ ] Display 2024 emissions data
- [ ] Add route to navigation if needed
- [ ] Test component rendering

## Testing Strategy

### Unit Tests

#### MongoDB Client Tests
```
✓ Connection pooling works
✓ Singleton returns same instance
✓ Connection timeout handled
✓ Connection error logged
✓ Close connection works
```

#### MongoDB Query Tests
```
✓ Fetch company by valid OrgId
✓ Fetch company by invalid OrgId returns null
✓ Fetch emissions for specific year
✓ Fetch all emissions years
✓ Handle missing Emissions field
✓ Handle MongoDB connection error
✓ Handle query timeout
```

#### Convex Action Tests
```
✓ Authenticated user can fetch emissions
✓ Unauthenticated user gets error
✓ User cannot access other org's data
✓ Invalid OrgId returns null
✓ MongoDB error handled gracefully
✓ Response is properly typed
```

### Integration Tests

#### End-to-End Flow
```
✓ User signs in with Clerk
✓ User selects organization
✓ Dashboard calls Convex action
✓ Convex action fetches from MongoDB
✓ Data displayed on dashboard
✓ Cross-org access prevented
✓ No-data case handled
```

### Test Data Requirements

#### Test Organization
- OrgId: `org_2tWO47gV8vEOLN1lrpV57N02Dh2`
- Company: DuoZink AS
- Has 2024 emissions data

#### Test Cases
1. **Happy Path**: Fetch 2024 emissions for test org
2. **Not Found**: Fetch emissions for non-existent org
3. **Unauthorized**: Try to fetch with wrong orgId
4. **No Auth**: Call action without authentication
5. **Connection Error**: Simulate MongoDB unavailable
6. **Malformed Data**: Test with missing fields

## Verification Steps

### Manual Testing
1. Start Convex dev server
2. Start React app
3. Sign in with Clerk
4. Select test organization
5. Navigate to emissions page
6. Verify data loads correctly
7. Check browser console for errors
8. Check Convex dashboard logs

### Automated Testing
```bash
# Run all tests
bun run vitest

# Run specific test file
bun run vitest convex/__tests__/emissions.test.ts

# Run with coverage
bun run vitest --coverage
```

### Performance Testing
- [ ] Measure MongoDB query time
- [ ] Measure action execution time
- [ ] Verify connection pooling reduces latency
- [ ] Test with multiple concurrent requests

## Rollback Plan

If issues occur during implementation:
1. Revert MongoDB client changes
2. Revert Convex action changes
3. Remove dashboard component
4. Verify app still works with Story 7 features
5. Document issues for next attempt

## Success Criteria Verification

- [ ] MongoDB client connects successfully
- [ ] Convex action fetches data from MongoDB
- [ ] Dashboard displays 2024 emissions data
- [ ] Cross-org access is prevented
- [ ] No-data case shows appropriate message
- [ ] All tests pass (unit + integration)
- [ ] No console errors or warnings
- [ ] Performance is acceptable (<1s load time)
- [ ] Error handling works for all scenarios
- [ ] Code follows project conventions

## Documentation Updates

- [ ] Update README with MongoDB setup instructions
- [ ] Add troubleshooting guide for common issues
- [ ] Document MongoDB indexes needed
- [ ] Add performance tuning guide
- [ ] Update architecture diagram if needed

## Post-Implementation

- [ ] Code review with team
- [ ] Performance monitoring setup
- [ ] Error tracking setup (Sentry)
- [ ] Database monitoring setup
- [ ] Plan for Story 8 dashboard features

