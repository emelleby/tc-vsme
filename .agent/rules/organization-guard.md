---
trigger: model_decision
description: Rule applies when fetching data from Convex in an authenticated context.
---

# Organization Guard Pattern

When fetching data from Convex in an authenticated context, you **MUST** use the `useOrgGuard` hook to prevent "Unauthorized" errors during organization switching.

## 🔴 The Rule
Never fire a Convex query that depends on an `orgId` without using the `skipQuery` pattern provided by `useOrgGuard`.

## ✅ Proper Implementation
```typescript
import { useOrgGuard } from '@/hooks/use-org-guard'

function MyComponent() {
  const { skipQuery, isLoading, organization } = useOrgGuard()

  const data = useQuery(
    api.myModule.myQuery,
    skipQuery || { orgId: organization?.id }
  )

  if (isLoading) return <LoadingState /> // Or null
  
  // Use data...
}
```

## ⚠️ Why This Matters
Clerk's organization context and the Convex JWT refresh at different speeds. Using `useOrgGuard` ensures both are synchronized before the first query fires, preventing race conditions.
