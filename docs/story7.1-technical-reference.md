# Story 7.1: Technical Reference & Code Patterns

## MongoDB Client Pattern

### Connection Pooling (Singleton)
```typescript
// convex/mongodb/client.ts
"use node";
import { MongoClient } from "mongodb";

let mongoClient: MongoClient | null = null;

export async function getMongoClient(): Promise<MongoClient> {
  if (!mongoClient) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI not configured");
    
    mongoClient = new MongoClient(uri);
    await mongoClient.connect();
  }
  return mongoClient;
}

export async function closeMongoClient(): Promise<void> {
  if (mongoClient) {
    await mongoClient.close();
    mongoClient = null;
  }
}
```

## Convex Action Pattern

### Authentication & Authorization
```typescript
// convex/emissions.ts
"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { requireUserId, getOrgId } from "./_utils/auth";

export const getEmissionsByOrgId = action({
  args: { 
    orgId: v.string(),
    year: v.optional(v.number())
  },
  returns: v.any(), // Typed response
  handler: async (ctx, args) => {
    // 1. Verify authentication
    const userId = await requireUserId(ctx);
    
    // 2. Get user's org context
    const userOrgId = await getOrgId(ctx);
    
    // 3. Verify authorization (prevent cross-org access)
    if (userOrgId !== args.orgId) {
      throw new Error("Unauthorized: Cannot access other organizations");
    }
    
    // 4. Fetch from MongoDB
    try {
      const data = await fetchCompanyEmissions(args.orgId, args.year);
      return { success: true, data };
    } catch (error) {
      console.error("MongoDB fetch error:", error);
      return { success: false, error: "Failed to fetch emissions data" };
    }
  },
});
```

## MongoDB Query Pattern

### Fetch with Error Handling
```typescript
// convex/mongodb/queries.ts
"use node";
import { getMongoClient } from "./client";

export async function fetchCompanyEmissions(
  orgId: string,
  year?: number
) {
  const client = await getMongoClient();
  const db = client.db("co2-intensities-dev");
  const collection = db.collection("companies");
  
  try {
    const company = await collection.findOne({ OrgId: orgId });
    
    if (!company) {
      return null; // No data for this org
    }
    
    // Extract emissions data
    if (!company.Emissions) {
      return null;
    }
    
    if (year) {
      return company.Emissions[year] || null;
    }
    
    return company.Emissions;
  } catch (error) {
    console.error("MongoDB query error:", error);
    throw new Error("Failed to query MongoDB");
  }
}
```

## Dashboard Component Pattern

### React Hook Usage
```typescript
// src/routes/_appLayout/app/emissions.tsx
import { useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import { useState, useEffect } from "react";

export function EmissionsDisplay() {
  const { user } = useUser();
  const getEmissions = useAction(api.emissions.getEmissionsByOrgId);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!user?.organizationId) return;
    
    setLoading(true);
    getEmissions({ 
      orgId: user.organizationId, 
      year: 2024 
    })
      .then(result => {
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [user?.organizationId]);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No emissions data available</div>;
  
  return (
    <div>
      <h2>2024 Emissions</h2>
      <p>Total CO2: {data.TotalCo2} tonnes</p>
      <p>CO2 Intensity: {data.co2Intensity}</p>
    </div>
  );
}
```

## Error Handling Patterns

### Retry Logic
```typescript
async function fetchWithRetry(
  fn: () => Promise<any>,
  maxRetries = 3,
  delayMs = 1000
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, delayMs * Math.pow(2, i)));
    }
  }
}
```

### Timeout Handling
```typescript
async function fetchWithTimeout(
  fn: () => Promise<any>,
  timeoutMs = 5000
) {
  return Promise.race([
    fn(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), timeoutMs)
    ),
  ]);
}
```

## Type Definitions

### Emissions Data Type
```typescript
// convex/types.ts
export interface EmissionsYear {
  Revenue: number;
  TotalCo2: number;
  co2Intensity: number;
  Scope1: number;
  Scope2: number;
  Scope3: number;
  locked: boolean;
  updatedAt: Date;
}

export interface CompanyEmissions {
  [year: string]: EmissionsYear;
}

export interface Company {
  _id: string;
  OrgId: string;
  CompanyName: string;
  Emissions: CompanyEmissions;
  CreatedAt: Date;
}
```

## Testing Patterns

### Mock MongoDB
```typescript
// convex/__tests__/emissions.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("emissions action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it("fetches emissions for valid org", async () => {
    // Mock MongoDB response
    const mockData = { TotalCo2: 4209.17 };
    vi.mock("../mongodb/queries", () => ({
      fetchCompanyEmissions: vi.fn().mockResolvedValue(mockData)
    }));
    
    // Test action
    // ...
  });
  
  it("returns null when org not found", async () => {
    // Mock null response
    // ...
  });
});
```

## Security Checklist

- [ ] Verify `requireUserId` is called before any DB access
- [ ] Verify `getOrgId` matches requested `orgId`
- [ ] Use environment variables for MongoDB URI
- [ ] Implement rate limiting on action calls
- [ ] Log all external DB access
- [ ] Handle sensitive data (don't log credentials)
- [ ] Validate input parameters
- [ ] Use HTTPS for all connections
- [ ] Implement connection timeouts
- [ ] Test cross-org access prevention

## Performance Checklist

- [ ] MongoDB index on `OrgId` field
- [ ] Connection pooling implemented
- [ ] Timeout handling for slow queries
- [ ] Caching strategy defined
- [ ] Pagination for large datasets
- [ ] Field projection to minimize data transfer
- [ ] Monitor query performance
- [ ] Load test with realistic data volume

