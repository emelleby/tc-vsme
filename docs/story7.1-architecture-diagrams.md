# Story 7.1: Architecture Diagrams

## Data Flow Diagram

```
User (Authenticated with Clerk)
        │
        ├─ JWT Token (includes org_id)
        │
        ▼
React Dashboard Component
        │
        ├─ useAction(api.emissions.getEmissionsByOrgId)
        │
        ▼
Convex Action (emissions.ts)
        │
        ├─ requireUserId(ctx) ──────────────────┐
        │                                        │
        ├─ getOrgId(ctx) ───────────────────────┤─ Auth Layer
        │                                        │
        ├─ Verify: userOrgId === requestedOrgId ┘
        │
        ├─ Call: fetchCompanyEmissions(orgId, year)
        │
        ▼
MongoDB Query Function (mongodb/queries.ts)
        │
        ├─ getMongoClient() ──────────────────┐
        │                                      │
        ├─ db.collection("companies")         ├─ Connection Layer
        │                                      │
        ├─ findOne({ OrgId: orgId }) ─────────┘
        │
        ▼
MongoDB Database (co2-intensities-dev)
        │
        ├─ Collection: companies
        │
        ├─ Document: { OrgId, Emissions: { 2024: {...} } }
        │
        ▼
Return Data to Dashboard
        │
        ├─ Display 2024 Emissions
        │
        ├─ TotalCo2, CO2Intensity, Scope1/2/3
        │
        ▼
User Sees Dashboard
```

## Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: Frontend Route Protection                          │
│ (TanStack Router beforeLoad hooks)                          │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: Clerk Authentication                              │
│ (JWT token issued by Clerk)                                │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: Convex Authentication                             │
│ (requireUserId - verifies JWT is valid)                    │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 4: Convex Authorization                              │
│ (getOrgId - verifies user's org matches requested org)     │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 5: MongoDB Query                                      │
│ (Fetch only requested org's data)                          │
└─────────────────────────────────────────────────────────────┘
```

## Connection Pooling Pattern

```
First Request:
  │
  ├─ getMongoClient()
  │  ├─ mongoClient === null? YES
  │  ├─ Create new MongoClient
  │  ├─ Connect to MongoDB
  │  ├─ Store in mongoClient variable
  │  └─ Return mongoClient
  │
  └─ Use connection

Second Request:
  │
  ├─ getMongoClient()
  │  ├─ mongoClient === null? NO
  │  └─ Return existing mongoClient (reuse)
  │
  └─ Use same connection (faster!)

Benefits:
  ✓ Reduced connection overhead
  ✓ Faster subsequent requests
  ✓ Better resource utilization
  ✓ Automatic connection management
```

## Error Handling Flow

```
Action Called
    │
    ├─ Try: requireUserId(ctx)
    │  ├─ Success? → Continue
    │  └─ Fail? → Return "Unauthorized"
    │
    ├─ Try: getOrgId(ctx)
    │  ├─ Success? → Continue
    │  └─ Fail? → Return "Unauthorized"
    │
    ├─ Try: Verify orgId match
    │  ├─ Match? → Continue
    │  └─ No match? → Return "Unauthorized"
    │
    ├─ Try: fetchCompanyEmissions()
    │  ├─ Success? → Return data
    │  ├─ Not found? → Return null
    │  └─ Error? → Return error message
    │
    └─ Return result to dashboard
       ├─ Success? → Display data
       ├─ Null? → Show "No data"
       └─ Error? → Show error message
```

## Component Interaction

```
┌──────────────────────────────────────────────────────────┐
│ EmissionsDisplay Component                               │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ useUser() → Get user.organizationId               │  │
│ └────────────────────────────────────────────────────┘  │
│                      │                                   │
│                      ▼                                   │
│ ┌────────────────────────────────────────────────────┐  │
│ │ useAction(api.emissions.getEmissionsByOrgId)      │  │
│ └────────────────────────────────────────────────────┘  │
│                      │                                   │
│                      ▼                                   │
│ ┌────────────────────────────────────────────────────┐  │
│ │ useEffect(() => {                                 │  │
│ │   getEmissions({                                  │  │
│ │     orgId: user.organizationId,                   │  │
│ │     year: 2024                                    │  │
│ │   })                                              │  │
│ │ }, [user.organizationId])                         │  │
│ └────────────────────────────────────────────────────┘  │
│                      │                                   │
│                      ▼                                   │
│ ┌────────────────────────────────────────────────────┐  │
│ │ State Management:                                 │  │
│ │ • data: emissions data                            │  │
│ │ • loading: boolean                                │  │
│ │ • error: error message                            │  │
│ └────────────────────────────────────────────────────┘  │
│                      │                                   │
│                      ▼                                   │
│ ┌────────────────────────────────────────────────────┐  │
│ │ Render:                                           │  │
│ │ • Loading? → <div>Loading...</div>               │  │
│ │ • Error? → <div>Error: {error}</div>             │  │
│ │ • No data? → <div>No data available</div>        │  │
│ │ • Has data? → Display emissions table             │  │
│ └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

## Testing Coverage Map

```
Unit Tests
├─ MongoDB Client
│  ├─ Connection pooling
│  ├─ Connection timeout
│  └─ Error handling
│
├─ Query Functions
│  ├─ Valid OrgId
│  ├─ Invalid OrgId
│  ├─ Null handling
│  └─ Error scenarios
│
└─ Convex Action
   ├─ Authentication
   ├─ Authorization
   ├─ Cross-org prevention
   └─ Error handling

Integration Tests
├─ End-to-end flow
├─ Real MongoDB connection
├─ Auth flow
└─ Dashboard rendering

E2E Tests (Story 8)
├─ User sign-in
├─ Org selection
├─ Data display
└─ Cross-org prevention
```

## Deployment Architecture

```
Development
├─ Local MongoDB (co2-intensities-dev)
├─ Convex dev server
└─ React dev server

Staging
├─ Staging MongoDB
├─ Convex staging deployment
└─ React staging build

Production
├─ Production MongoDB
├─ Convex production deployment
└─ React production build

Environment Variables
├─ MONGODB_URI (different per env)
├─ CONVEX_DEPLOYMENT (different per env)
└─ VITE_CONVEX_URL (different per env)
```

## File Dependencies

```
src/routes/_appLayout/app/emissions.tsx
    │
    ├─ convex/emissions.ts (action)
    │  │
    │  ├─ convex/_utils/auth.ts (requireUserId, getOrgId)
    │  │
    │  └─ convex/mongodb/queries.ts
    │     │
    │     └─ convex/mongodb/client.ts
    │        │
    │        └─ mongodb package
    │
    ├─ convex/types.ts (type definitions)
    │
    └─ @clerk/clerk-react (useUser hook)
```

## State Transitions

```
Component Mount
    │
    ├─ loading = true
    │
    ├─ Call getEmissions()
    │
    ▼
Waiting for Response
    │
    ├─ loading = true
    │
    ├─ Convex processes request
    │
    ├─ MongoDB query executes
    │
    ▼
Response Received
    │
    ├─ loading = false
    │
    ├─ Success?
    │  ├─ YES → data = result, error = null
    │  └─ NO → data = null, error = message
    │
    ▼
Render
    │
    ├─ loading? → Show spinner
    ├─ error? → Show error
    ├─ !data? → Show "No data"
    └─ data? → Show emissions table
```

