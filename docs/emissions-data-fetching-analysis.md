# Emissions Data Fetching Architecture Analysis

## Executive Summary

The current implementation in [`src/routes/_appLayout/app/emissions.tsx`](src/routes/_appLayout/app/emissions.tsx) uses a **fetch-all-at-once strategy** with native React [`useEffect`](src/routes/_appLayout/app/emissions.tsx:37) hook. While functional for small datasets, this approach has significant scalability and performance concerns as data grows.

---

## Current Implementation Analysis

### Code Structure
```typescript
// Current approach: Fetch all data, then parse client-side
useEffect(() => {
  const fetchAllEmissions = async () => {
    const result = await getEmissions({ orgId: HARDCODED_ORG_ID })
    // Returns: { "2022": {...}, "2023": {...}, "2024": {...} }
    // Client then maps this to yearData state
  }
  fetchAllEmissions()
}, [getEmissions])
```

### Key Issues Identified

| Issue | Severity | Impact |
|-------|----------|--------|
| **No caching** | High | Refetches on every component remount |
| **No deduplication** | Medium | Multiple components = multiple requests |
| **No stale-while-revalidate** | High | Users wait for fresh data on every visit |
| **Memory overhead** | Medium | All years loaded even if only viewing one |
| **Coarse-grained loading** | Medium | All cards show loading until full data arrives |
| **No retry logic** | Medium | Single failure = no data |
| **No optimistic updates** | Low | Not applicable for read-only, but limits future expansion |

---

## Comparative Analysis

### 1. Current: Native useEffect + Convex Action

#### Pros
- ✅ Simple implementation
- ✅ No additional dependencies
- ✅ Works for small datasets (< 10 years, < 100KB total)

#### Cons
- ❌ **No caching**: Every navigation triggers refetch
- ❌ **No background refetching**: Data goes stale immediately
- ❌ **No request deduplication**: Multiple components = multiple requests
- ❌ **No loading granularity**: All cards load together
- ❌ **No retry/backoff**: Network flakiness = bad UX
- ❌ **Memory inefficient**: Loads entire dataset upfront
- ❌ **No window focus refetching**: Stale data persists across tabs

#### Scalability Concerns
- **Network**: Single large payload grows linearly with years
- **Memory**: All data held in React state simultaneously
- **UX**: Users wait for all data before seeing anything
- **Bandwidth**: Mobile users download entire dataset for single view

---

### 2. Granular Data Fetching (Per-Year)

#### Architecture
```typescript
// Fetch each year independently
const { data: data2022, isLoading: loading2022 } = useQuery({
  queryKey: ['emissions', orgId, 2022],
  queryFn: () => getEmissions({ orgId, year: 2022 })
})
const { data: data2023, isLoading: loading2023 } = useQuery({
  queryKey: ['emissions', orgId, 2023],
  queryFn: () => getEmissions({ orgId, year: 2023 })
})
// ... etc
```

#### Pros
- ✅ **Granular loading**: Each card loads independently
- ✅ **Partial failure**: One year fails doesn't break others
- ✅ **Parallel fetching**: Multiple years load concurrently
- ✅ **Better memory**: Only requested years in memory
- ✅ **Selective loading**: Could implement lazy loading

#### Cons
- ❌ **More network requests**: N years = N requests
- ❌ **Higher overhead**: HTTP headers per request
- ❌ **Complexity**: More boilerplate code

#### Best For
- When users typically view 1-2 years at a time
- When data per year is large (> 50KB)
- When implementing lazy loading or virtual scrolling

---

### 3. TanStack Query (Recommended)

#### Architecture
```typescript
import { useQuery } from '@tanstack/react-query'

const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['emissions', orgId],
  queryFn: () => getEmissions({ orgId }),
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000,   // 10 minutes
  retry: 3,
  retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
})
```

#### Pros
- ✅ **Intelligent caching**: Data cached across navigations
- ✅ **Automatic deduplication**: Same query = single request
- ✅ **Stale-while-revalidate**: Show cached data, refresh in background
- ✅ **Window focus refetching**: Fresh data when user returns
- ✅ **Retry logic**: Exponential backoff built-in
- ✅ **Optimistic updates**: Ready for mutations
- ✅ **DevTools**: Visual debugging of cache state
- ✅ **Type-safe**: Full TypeScript support

#### Cons
- ⚠️ **Additional dependency**: ~13KB gzipped
- ⚠️ **Learning curve**: Query keys, cache management

#### Why It's Recommended
1. **Already in project**: [`@tanstack/react-query@^5.66.5`](package.json:50) is installed
2. **Convex integration**: [`@convex-dev/react-query@0.1.0`](package.json:21) provides bridge
3. **TanStack Router integration**: [`@tanstack/react-router-ssr-query@^1.131.7`](package.json:54) enables SSR
4. **Industry standard**: Battle-tested at scale (Meta, GitHub, etc.)

---

### 4. Convex Real-Time Queries

#### Architecture
```typescript
import { useQuery } from 'convex/react'

const emissions = useQuery(api.emissions.getEmissionsByOrgId, {
  orgId: HARDCODED_ORG_ID
})
```

#### Pros
- ✅ **Real-time sync**: Updates automatically when data changes
- ✅ **Zero configuration**: No cache management needed
- ✅ **Optimistic UI**: Built-in optimistic updates
- ✅ **Offline support**: Works offline, syncs when back

#### Cons
- ❌ **Requires Convex DB**: Currently using MongoDB as external source
- ❌ **Action vs Query**: Current implementation uses [`action`](convex/emissions.ts:60) (not reactive)
- ❌ **No granular control**: Less fine-tuned caching options

#### Current Limitation
The project uses MongoDB as the data source via [`fetchCompanyEmissions`](convex/mongodb/queries.ts:24). Convex actions are not reactive—queries are. To use real-time sync, data must be stored in Convex's native database.

---

## Memory & Performance Comparison

### Memory Consumption (Estimated)

| Approach | 3 Years | 10 Years | 50 Years | Notes |
|----------|---------|----------|----------|-------|
| Current (fetch-all) | ~150KB | ~500KB | ~2.5MB | All data in React state |
| Granular (view 3) | ~150KB | ~150KB | ~150KB | Only viewed years |
| TanStack Query | ~150KB + cache overhead | ~500KB + cache | ~2.5MB + cache | Cache configurable |

### Network Efficiency

| Approach | Requests | Payload Size | First Load | Cache Hit |
|----------|----------|--------------|------------|-----------|
| Current | 1 | 500KB | 500KB | 500KB |
| Granular | 3 | 3 × 150KB | 450KB | 0KB (per year) |
| TanStack | 1 | 500KB | 500KB | 0KB (from memory) |

### Loading States

| Approach | Initial Load | Subsequent | Partial Failure |
|----------|--------------|------------|-----------------|
| Current | All cards loading | All cards loading | All cards error |
| Granular | Cards load independently | Cards load independently | Failed cards only |
| TanStack | All cards loading | Instant (cache) | All cards error (but cached) |

---

## Recommended Implementation Strategy

### Primary Recommendation: TanStack Query with Convex Integration

**Rationale:**
1. **Leverages existing dependencies**: Already installed and configured
2. **Best of both worlds**: TanStack caching + Convex backend
3. **Scalable**: Handles current needs and future growth
4. **Developer experience**: DevTools, TypeScript, error handling

### Secondary Recommendation: Hybrid Approach

For the best user experience with large datasets:
- **Fetch all** for small datasets (< 5 years)
- **Granular fetch** for large datasets (> 10 years)
- **Lazy loading** for very large datasets (> 50 years)

---

## Implementation Examples

### Option 1: TanStack Query (Recommended)

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useAction } from 'convex/react'
import { api } from '../../../../convex/_generated/api'

const HARDCODED_ORG_ID = 'org_2tWO47gV8vEOLN1lrpV57N02Dh2'

export const Route = createFileRoute('/_appLayout/app/emissions')({
  component: EmissionsPage,
})

type EmissionsData = {
  TotalCo2?: number
  [key: string]: string | number | boolean | null | undefined
}

type YearData = {
  year: number
  data: EmissionsData | null
  loading: boolean
  error: string | null
}

function EmissionsPage() {
  const getEmissions = useAction(api.emissions.getEmissionsByOrgId)

  // TanStack Query with intelligent caching
  const { data: allEmissions, isLoading, error, refetch } = useQuery({
    queryKey: ['emissions', HARDCODED_ORG_ID],
    queryFn: async () => {
      const result = await getEmissions({ orgId: HARDCODED_ORG_ID })
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch data')
      }
      return result.data as Record<string, EmissionsData>
    },
    staleTime: 5 * 60 * 1000, // Data fresh for 5 minutes
    gcTime: 10 * 60 * 1000,   // Keep in cache for 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  // Transform data for display
  const yearData: YearData[] = [
    { year: 2022, data: allEmissions?.['2022'] || null, loading: isLoading, error: error?.message || null },
    { year: 2023, data: allEmissions?.['2023'] || null, loading: isLoading, error: error?.message || null },
    { year: 2024, data: allEmissions?.['2024'] || null, loading: isLoading, error: error?.message || null },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Emissions Data</h1>
          <p className="text-muted-foreground">
            Viewing emissions data for organization: {HARDCODED_ORG_ID}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {yearData.map(({ year, data, loading, error }) => (
          <EmissionsCard key={year} year={year} data={data} loading={loading} error={error} />
        ))}
      </div>
    </div>
  )
}

// Extracted card component for reusability
function EmissionsCard({ year, data, loading, error }: YearData) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">{year} Emissions</h2>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          <p className="text-sm font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && !data && (
        <div className="rounded-md bg-muted p-4">
          <p className="text-sm text-muted-foreground">No data available</p>
        </div>
      )}

      {!loading && !error && data && (
        <div className="space-y-3">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Total CO₂</span>
            <span className="text-2xl font-bold">
              {data.TotalCo2 !== undefined
                ? `${data.TotalCo2.toLocaleString()} kg`
                : 'N/A'}
            </span>
          </div>

          {Object.keys(data)
            .filter((key) => key !== 'TotalCo2')
            .slice(0, 5)
            .map((key) => (
              <div key={key} className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">{key}</span>
                <span className="text-sm font-medium">
                  {typeof data[key] === 'number'
                    ? data[key].toLocaleString()
                    : String(data[key])}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
```

---

### Option 2: Granular Fetching with TanStack Query

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useAction } from 'convex/react'
import { api } from '../../../../convex/_generated/api'

const HARDCODED_ORG_ID = 'org_2tWO47gV8vEOLN1lrpV57N02Dh2'
const YEARS = [2022, 2023, 2024]

export const Route = createFileRoute('/_appLayout/app/emissions')({
  component: EmissionsPage,
})

type EmissionsData = {
  TotalCo2?: number
  [key: string]: string | number | boolean | null | undefined
}

function useEmissionsForYear(orgId: string, year: number) {
  const getEmissions = useAction(api.emissions.getEmissionsByOrgId)

  return useQuery({
    queryKey: ['emissions', orgId, year],
    queryFn: async () => {
      const result = await getEmissions({ orgId, year })
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch data')
      }
      return result.data as EmissionsData
    },
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

function EmissionsPage() {
  // Each year fetched independently
  const queries = YEARS.map((year) => useEmissionsForYear(HARDCODED_ORG_ID, year))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Emissions Data</h1>
        <p className="text-muted-foreground">
          Viewing emissions data for organization: {HARDCODED_ORG_ID}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {queries.map((query, index) => (
          <EmissionsCard
            key={YEARS[index]}
            year={YEARS[index]}
            data={query.data}
            loading={query.isLoading}
            error={query.error?.message || null}
            onRefetch={() => query.refetch()}
          />
        ))}
      </div>
    </div>
  )
}

function EmissionsCard({
  year,
  data,
  loading,
  error,
  onRefetch,
}: {
  year: number
  data: EmissionsData | null | undefined
  loading: boolean
  error: string | null
  onRefetch: () => void
}) {
  // ... same card rendering as above, with refetch button
}
```

---

### Option 3: Convex Real-Time Query (If Data Migrated)

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'

const HARDCODED_ORG_ID = 'org_2tWO47gV8vEOLN1lrpV57N02Dh2'

export const Route = createFileRoute('/_appLayout/app/emissions')({
  component: EmissionsPage,
})

function EmissionsPage() {
  // Real-time: updates automatically when data changes in Convex
  const emissions = useQuery(api.emissions.getEmissionsByOrgId, {
    orgId: HARDCODED_ORG_ID
  })

  if (emissions === undefined) {
    return <div>Loading...</div>
  }

  if (emissions === null) {
    return <div>No data available</div>
  }

  const yearData = [
    { year: 2022, data: emissions['2022'] || null },
    { year: 2023, data: emissions['2023'] || null },
    { year: 2024, data: emissions['2024'] || null },
  ]

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Emissions Data</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {yearData.map(({ year, data }) => (
          <EmissionsCard key={year} year={year} data={data} />
        ))}
      </div>
    </div>
  )
}
```

---

## Best Practices Checklist

### React Data Fetching Best Practices (Official Docs)

- ✅ **Use a data fetching library** for production apps
- ✅ **Implement caching** to avoid redundant requests
- ✅ **Handle loading states** at appropriate granularity
- ✅ **Handle errors gracefully** with user-friendly messages
- ✅ **Implement retry logic** for transient failures
- ✅ **Use stale-while-revalidate** for perceived performance
- ✅ **Avoid fetching in useEffect** without a proper library
- ✅ **Clean up subscriptions** and abort requests

### TanStack Query Best Practices

- ✅ **Use descriptive query keys** for cache identification
- ✅ **Set appropriate staleTime** based on data volatility
- ✅ **Use gcTime** to control cache retention
- ✅ **Implement retry logic** with exponential backoff
- ✅ **Use suspense boundaries** for loading states
- ✅ **Leverage DevTools** for debugging cache state

### Convex Best Practices

- ✅ **Use queries for reactive data** (real-time sync)
- ✅ **Use actions for external API calls** (non-reactive)
- ✅ **Implement authentication** in all server functions
- ✅ **Validate inputs** with Convex values
- ✅ **Sanitize data** for Convex compatibility

---

## Migration Path

### Phase 1: Add TanStack Query (Immediate)
1. Wrap existing fetch in [`useQuery`](https://tanstack.com/query/latest/docs/react/overview)
2. Configure cache times
3. Add retry logic
4. Test caching behavior

### Phase 2: Extract Components (Short-term)
1. Extract [`EmissionsCard`](src/routes/_appLayout/app/emissions.tsx:105) component
2. Add error boundaries
3. Improve loading states

### Phase 3: Consider Granular Fetching (Medium-term)
1. Evaluate data growth
2. Implement per-year queries if needed
3. Add lazy loading for large datasets

### Phase 4: Real-Time Sync (Long-term)
1. Evaluate migrating MongoDB data to Convex
2. Convert actions to queries
3. Implement optimistic updates

---

## Conclusion

### Can it be done better? **Yes.**

### Can it be done simpler? **Yes.**

The current implementation is functional but not production-ready for scale. By adopting **TanStack Query** (already in your project), you gain:

1. **Instant performance** through intelligent caching
2. **Better UX** with stale-while-revalidate
3. **Resilience** with automatic retries
4. **Developer productivity** with DevTools and TypeScript

**Recommendation:** Implement Option 1 (TanStack Query) immediately. It's the highest ROI improvement with minimal code changes.

---

## References

- [React Docs: Fetching Data](https://react.dev/learn/synchronizing-with-effects#fetching-data)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Convex Documentation](https://docs.convex.dev/)
- [Convex React Query Integration](https://github.com/get-convex/convex-react-query)
