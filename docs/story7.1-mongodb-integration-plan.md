# Story 7.1: MongoDB Integration in Convex - Research & Planning

## Overview

This document outlines the research findings and implementation plan for Story 7.1, which establishes MongoDB integration in Convex to fetch external data for the dashboard. This story builds on Story 7 (Convex + Clerk JWT integration) and prepares for Story 8 (dashboard population with organization data).

## Context

- **Previous Story**: Story 7 completed Convex + Clerk JWT integration with auth utilities
- **Current Status**: Convex is authenticated and can access user/org context via JWT
- **Next Story**: Story 8 will populate the dashboard with organization data from MongoDB
- **External Database**: MongoDB instance at `co2-intensities-dev` database with `companies` collection

## Technical Requirements

### 1. Database Connection
- **URI**: Use existing `MONGODB_URI` from `.env.local`
- **Database**: `co2-intensities-dev`
- **Collection**: `companies`
- **Lookup Field**: `OrgId` (matches Clerk organization ID from JWT)
- **Target Data**: `Emissions` field containing yearly CO2 data (2022, 2023, 2024)

### 2. Data Structure
The MongoDB document structure:
```json
{
  "_id": ObjectId,
  "OrgId": "org_2tWO47gV8vEOLN1lrpV57N02Dh2",
  "CompanyName": "DuoZink AS",
  "Emissions": {
    "2024": {
      "Revenue": 4500000,
      "TotalCo2": 4209.17,
      "co2Intensity": 935.37,
      "Scope1": 14.94,
      "Scope2": 185.52,
      "Scope3": 4008.71,
      "locked": true,
      "updatedAt": "2025-10-26T00:21:58.392Z"
    }
  }
}
```

## Research Findings: Convex + MongoDB Best Practices

### 1. Function Type Selection

**Query vs Mutation vs Action**:
- **Query**: Read-only, cached, deterministic - NOT suitable for external DB (no caching benefit)
- **Mutation**: Transactional, deterministic - NOT suitable for external DB (non-deterministic)
- **Action**: Non-deterministic, can call external services - **RECOMMENDED** ✅

**Rationale**: Actions are designed for external service calls and don't have determinism constraints. They can call queries/mutations to interact with Convex DB if needed.

### 2. Connection Management

**Best Practices**:
- Use Node.js runtime (`"use node"` directive) for MongoDB driver access
- Implement connection pooling via singleton pattern
- Handle connection errors gracefully
- Use environment variables for credentials
- Implement timeout handling for external calls

**Pattern**:
```typescript
// Singleton connection pool
let mongoClient: MongoClient | null = null;

async function getMongoClient() {
  if (!mongoClient) {
    mongoClient = new MongoClient(process.env.MONGODB_URI);
    await mongoClient.connect();
  }
  return mongoClient;
}
```

### 3. Error Handling Strategy

**Scenarios to Handle**:
1. **Document Not Found**: Return null/empty object gracefully
2. **Connection Timeout**: Retry with exponential backoff
3. **Invalid OrgId**: Return error with clear message
4. **Database Unavailable**: Return error, don't crash
5. **Authentication Failure**: Log and return error

### 4. Security Considerations

- ✅ Verify user is authenticated (use `requireUserId` from auth utils)
- ✅ Verify user's orgId matches requested orgId (prevent cross-org access)
- ✅ Use environment variables for MongoDB URI (never hardcode)
- ✅ Implement rate limiting if needed
- ✅ Log all external DB access for audit trail

### 5. Performance Optimization

- Use MongoDB indexes on `OrgId` field for fast lookups
- Implement caching layer if data doesn't change frequently
- Consider pagination for large datasets
- Use projection to fetch only needed fields

## Implementation Architecture

### File Structure
```
convex/
├── mongodb/
│   ├── client.ts          # MongoDB connection singleton
│   ├── queries.ts         # MongoDB query functions
│   └── __tests__/
│       └── mongodb.test.ts
├── emissions.ts           # Public action to fetch emissions data
└── schema.ts              # (existing)
```

### Component Breakdown

#### 1. MongoDB Client (`convex/mongodb/client.ts`)
- Singleton connection pool
- Connection lifecycle management
- Error handling and retry logic
- Type-safe database access

#### 2. MongoDB Queries (`convex/mongodb/queries.ts`)
- `fetchCompanyByOrgId(orgId)` - Fetch company document by OrgId
- `fetchEmissionsByOrgId(orgId, year?)` - Fetch emissions for specific year
- Error handling and null checks

#### 3. Convex Action (`convex/emissions.ts`)
- Public action: `getEmissionsByOrgId(orgId, year)`
- Validates authentication and authorization
- Calls MongoDB query function
- Returns typed response
- Handles errors gracefully

#### 4. Dashboard Component (`src/routes/_appLayout/app/emissions.tsx`)
- Calls Convex action via `useAction` hook
- Displays 2024 emissions data
- Shows loading/error states
- Handles "no data" case gracefully

## Testing Strategy

### Unit Tests
- MongoDB client connection/disconnection
- Query functions with mock data
- Error handling scenarios
- Authorization checks

### Integration Tests
- End-to-end action call with real MongoDB
- Authentication flow verification
- Cross-org access prevention
- Data transformation validation

### Test Cases
1. **Happy Path**: Fetch emissions for valid OrgId
2. **Not Found**: OrgId with no document
3. **Unauthorized**: Unauthenticated request
4. **Cross-Org Access**: User tries to fetch different org's data
5. **Connection Error**: MongoDB unavailable
6. **Invalid Data**: Malformed response from MongoDB

## Implementation Phases

### Phase 1: Research & Planning (Current)
- ✅ Document best practices
- ✅ Design architecture
- ✅ Plan testing strategy

### Phase 2: Implementation (Story 7.1 - Later)
- Create MongoDB client with connection pooling
- Implement query functions
- Create Convex action with auth checks
- Add comprehensive error handling
- Write unit and integration tests

### Phase 3: Dashboard Integration (Story 8)
- Create dashboard component
- Call Convex action
- Display emissions data
- Handle edge cases

## Dependencies

### New Packages Required
- `mongodb` - MongoDB driver for Node.js
- (Already have: `convex`, `@clerk/tanstack-react-start`)

### Environment Variables
- `MONGODB_URI` - Already configured in `.env.local`

## Success Criteria

- [x] Research completed and documented
- [x] Architecture designed and approved
- [x] Testing strategy defined
- [ ] MongoDB client implemented with connection pooling
- [ ] Convex action created with auth checks
- [ ] Unit tests passing (happy path + error cases)
- [ ] Integration tests passing
- [ ] Dashboard component displays 2024 emissions data
- [ ] Cross-org access prevented
- [ ] "No data" case handled gracefully

## Next Steps

1. **Immediate**: Review this plan with team
2. **Phase 2**: Implement MongoDB client and Convex action
3. **Phase 2**: Write comprehensive tests
4. **Phase 3**: Integrate with dashboard component
5. **Phase 3**: End-to-end testing with real data

## References

- [Convex Actions Documentation](https://docs.convex.dev/functions/actions)
- [Convex Auth Documentation](https://docs.convex.dev/auth)
- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/)
- [Story 7 Implementation Summary](./story7-implementation-summary.md)
- [Authentication Implementation Plan](./authentication-implementation-plan.md)

