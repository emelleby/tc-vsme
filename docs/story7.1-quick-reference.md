# Story 7.1: Quick Reference Guide

## One-Page Summary

**Goal**: Connect Convex to external MongoDB to fetch organization emissions data

**Key Pattern**: Convex Action → MongoDB Query → Dashboard Display

**Security**: Verify auth + verify org match + prevent cross-org access

## File Structure

```
convex/
├── mongodb/
│   ├── client.ts              # Singleton connection pool
│   ├── queries.ts             # MongoDB query functions
│   └── __tests__/
│       └── queries.test.ts
├── emissions.ts               # Public action
├── types.ts                   # Type definitions
└── __tests__/
    └── emissions.test.ts

src/routes/_appLayout/app/
└── emissions.tsx              # Dashboard component
```

## Core Concepts

### 1. Why Actions?
- External service calls (MongoDB)
- Non-deterministic operations
- Can call queries/mutations indirectly

### 2. Why Singleton?
- Reuse connections
- Reduce overhead
- Improve performance

### 3. Why Authorization Check?
- Prevent cross-org data access
- Multi-tenant security
- Defense in depth

## Implementation Sequence

1. **MongoDB Client** → Connection pooling
2. **Query Functions** → Fetch from MongoDB
3. **Convex Action** → Auth + call queries
4. **Type Definitions** → Type safety
5. **Tests** → Verify everything works
6. **Dashboard** → Display data

## Code Templates

### Action Template
```typescript
export const getEmissionsByOrgId = action({
  args: { orgId: v.string(), year: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const userOrgId = await getOrgId(ctx);
    if (userOrgId !== args.orgId) throw new Error("Unauthorized");
    return await fetchCompanyEmissions(args.orgId, args.year);
  },
});
```

### Query Template
```typescript
export async function fetchCompanyEmissions(orgId: string, year?: number) {
  const client = await getMongoClient();
  const db = client.db("co2-intensities-dev");
  const collection = db.collection("companies");
  const company = await collection.findOne({ OrgId: orgId });
  if (!company?.Emissions) return null;
  return year ? company.Emissions[year] : company.Emissions;
}
```

### Component Template
```typescript
export function EmissionsDisplay() {
  const { user } = useUser();
  const getEmissions = useAction(api.emissions.getEmissionsByOrgId);
  const [data, setData] = useState(null);
  
  useEffect(() => {
    if (!user?.organizationId) return;
    getEmissions({ orgId: user.organizationId, year: 2024 })
      .then(result => setData(result.data))
      .catch(err => console.error(err));
  }, [user?.organizationId]);
  
  if (!data) return <div>No data</div>;
  return <div>CO2: {data.TotalCo2}</div>;
}
```

## Testing Checklist

- [ ] MongoDB client connects
- [ ] Query returns data for valid org
- [ ] Query returns null for invalid org
- [ ] Action requires authentication
- [ ] Action prevents cross-org access
- [ ] Error handling works
- [ ] Dashboard displays data
- [ ] No-data case handled

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| "MONGODB_URI not configured" | Missing env var | Add to .env.local |
| "Unauthorized" error | Wrong orgId | Verify user's org matches |
| Connection timeout | MongoDB slow | Increase timeout, check network |
| "Cannot access other orgs" | Cross-org attempt | Verify orgId matches user's |
| No data displayed | Query returns null | Check if org exists in MongoDB |

## Performance Tips

- Use MongoDB indexes on `OrgId`
- Connection pooling reduces latency
- Fetch only needed fields
- Implement caching if data stable
- Monitor query execution time

## Security Checklist

- [ ] `requireUserId()` called
- [ ] `getOrgId()` verified
- [ ] Cross-org access prevented
- [ ] MongoDB URI in env vars
- [ ] No credentials logged
- [ ] Timeout handling implemented
- [ ] Error messages don't leak data

## Key Environment Variables

```env
MONGODB_URI=mongodb+srv://...
CONVEX_DEPLOYMENT=dev:fine-echidna-604
VITE_CONVEX_URL=https://fine-echidna-604.convex.cloud
CLERK_ISSUER_URL=https://clerk.gentle.cod-4.lcl.dev
CONVEX_JWT_AUDIENCE=convex-tc-vsme
```

## Useful Commands

```bash
# Start Convex dev server
npx convex dev

# Run tests
bun run vitest

# Run specific test
bun run vitest convex/__tests__/emissions.test.ts

# Check types
bun run tsc --noEmit

# Start React app
bun run dev
```

## MongoDB Query Examples

```javascript
// Find company by OrgId
db.companies.findOne({ OrgId: "org_2tWO47gV8vEOLN1lrpV57N02Dh2" })

// Find with projection (only Emissions field)
db.companies.findOne(
  { OrgId: "org_..." },
  { projection: { Emissions: 1 } }
)

// Create index for performance
db.companies.createIndex({ OrgId: 1 })
```

## Documentation Links

- **Overview**: story7.1-overview.md
- **Planning**: story7.1-mongodb-integration-plan.md
- **Technical**: story7.1-technical-reference.md
- **Checklist**: story7.1-implementation-checklist.md
- **Story 7**: story7-implementation-summary.md

## Decision Log

| Decision | Rationale | Status |
|----------|-----------|--------|
| Use Actions | External DB calls | ✅ Approved |
| Singleton pool | Performance | ✅ Approved |
| Auth check | Security | ✅ Approved |
| Node.js runtime | MongoDB driver | ✅ Approved |
| Graceful errors | Reliability | ✅ Approved |

## Success Metrics

- ✅ Data fetched from MongoDB
- ✅ Displayed on dashboard
- ✅ Cross-org access prevented
- ✅ All tests passing
- ✅ <1s load time
- ✅ No console errors
- ✅ Code reviewed
- ✅ Ready for Story 8

