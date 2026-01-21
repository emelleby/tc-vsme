# Story 7.1: MongoDB Integration in Convex - Complete Overview

## Story Summary

**Story 7.1: Set up MongoDB integration in Convex to fetch external data for the dashboard**

This story establishes the foundation for fetching organization data from an external MongoDB database through Convex actions. It bridges Story 7 (Convex + Clerk JWT authentication) and Story 8 (dashboard population with organization data).

## What This Story Delivers

### 1. Research & Planning (Current Phase)
- ✅ Best practices for Convex + MongoDB integration
- ✅ Architecture design with security considerations
- ✅ Testing strategy covering all scenarios
- ✅ Implementation checklist and verification steps

### 2. Implementation (Next Phase)
- MongoDB client with connection pooling
- Convex action for fetching emissions data
- Comprehensive error handling
- Type-safe interfaces
- Unit and integration tests

### 3. Dashboard Integration (Story 8)
- React component displaying emissions data
- Loading/error/no-data states
- Cross-org access prevention
- End-to-end verification

## Key Decisions Made

### 1. Use Convex Actions (Not Queries/Mutations)
**Why**: Actions are designed for external service calls and don't have determinism constraints.

### 2. Node.js Runtime
**Why**: MongoDB driver requires Node.js; Convex actions support `"use node"` directive.

### 3. Singleton Connection Pool
**Why**: Reduces connection overhead and improves performance for repeated calls.

### 4. Authorization Check in Action
**Why**: Prevents users from accessing other organizations' data at the Convex layer.

### 5. Graceful Error Handling
**Why**: MongoDB unavailability shouldn't crash the app; return meaningful errors instead.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    React Dashboard                          │
│  (src/routes/_appLayout/app/emissions.tsx)                 │
└────────────────────┬────────────────────────────────────────┘
                     │ useAction()
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Convex Action (emissions.ts)                   │
│  • Verify authentication (requireUserId)                    │
│  • Verify authorization (getOrgId)                          │
│  • Call MongoDB query function                              │
│  • Handle errors gracefully                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         MongoDB Query Functions (mongodb/queries.ts)        │
│  • fetchCompanyByOrgId(orgId)                              │
│  • fetchEmissionsByOrgId(orgId, year)                      │
│  • Error handling & null checks                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│        MongoDB Client (mongodb/client.ts)                   │
│  • Singleton connection pool                                │
│  • Connection lifecycle management                          │
│  • Timeout handling                                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│    External MongoDB (co2-intensities-dev)                   │
│    Collection: companies                                    │
└─────────────────────────────────────────────────────────────┘
```

## Security Model

### Authentication Layer
- Clerk JWT token verified by Convex
- `requireUserId()` ensures user is authenticated

### Authorization Layer
- `getOrgId()` extracts user's organization from JWT
- Action verifies requested orgId matches user's orgId
- Prevents cross-organization data access

### Data Protection
- MongoDB URI stored in environment variables
- No credentials logged or exposed
- Sensitive data not cached in browser

## Testing Coverage

### Unit Tests
- MongoDB client connection/pooling
- Query functions with mock data
- Error scenarios (timeout, connection failure)
- Authorization checks

### Integration Tests
- End-to-end action execution
- Real MongoDB connection
- Authentication flow
- Cross-org access prevention

### Test Scenarios
1. ✅ Happy path: Fetch valid org's emissions
2. ✅ Not found: Org with no data
3. ✅ Unauthorized: Unauthenticated request
4. ✅ Cross-org: User tries other org's data
5. ✅ Connection error: MongoDB unavailable
6. ✅ Invalid data: Malformed response

## Files to Create/Modify

### New Files
- `convex/mongodb/client.ts` - Connection pooling
- `convex/mongodb/queries.ts` - Query functions
- `convex/emissions.ts` - Public action
- `convex/types.ts` - Type definitions
- `convex/__tests__/emissions.test.ts` - Action tests
- `convex/mongodb/__tests__/queries.test.ts` - Query tests
- `src/routes/_appLayout/app/emissions.tsx` - Dashboard component

### Modified Files
- `.env.local` - Verify MONGODB_URI is set
- `package.json` - Add mongodb dependency (if needed)

## Success Criteria

- [x] Research completed and documented
- [x] Architecture designed
- [x] Testing strategy defined
- [ ] All code implemented
- [ ] All tests passing
- [ ] Dashboard displays 2024 emissions
- [ ] Cross-org access prevented
- [ ] No-data case handled
- [ ] Performance acceptable (<1s)
- [ ] Code reviewed and approved

## Related Documentation

1. **story7.1-mongodb-integration-plan.md** - Detailed research and planning
2. **story7.1-technical-reference.md** - Code patterns and examples
3. **story7.1-implementation-checklist.md** - Step-by-step implementation guide
4. **story7-implementation-summary.md** - Previous story (Convex + Clerk JWT)
5. **authentication-implementation-plan.md** - Auth architecture overview

## Timeline Estimate

- **Research & Planning**: ✅ Complete (this document)
- **Implementation**: 4-6 hours
  - MongoDB client: 1-2 hours
  - Convex action: 1 hour
  - Tests: 1-2 hours
  - Dashboard component: 1 hour
- **Review & Refinement**: 1-2 hours
- **Total**: ~6-10 hours

## Next Steps

1. **Review**: Team reviews this plan
2. **Approve**: Get approval to proceed
3. **Implement**: Follow implementation checklist
4. **Test**: Run all tests and verify
5. **Review**: Code review before merge
6. **Deploy**: Deploy to staging/production
7. **Monitor**: Monitor for issues
8. **Story 8**: Begin dashboard population features

## Questions & Decisions Needed

- [ ] Approve use of Convex actions for MongoDB calls?
- [ ] Approve singleton connection pool pattern?
- [ ] Approve error handling strategy?
- [ ] Any additional security requirements?
- [ ] Any performance requirements?
- [ ] Timeline acceptable?

## Contact & Support

For questions about this story:
- Review the technical reference document
- Check the implementation checklist
- Refer to Convex and MongoDB documentation
- Ask team for clarification

