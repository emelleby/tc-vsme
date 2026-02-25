# Authentication Approach for TC-VSME

> **⚠️ DEPRECATED**: This document has been consolidated into `docs/AUTH.md`.
> Please refer to `docs/AUTH.md` for the current, comprehensive authentication documentation.
>
> **Last Updated**: 2026-02-19 (Consolidated into AUTH.md)

---

## Summary

This document explains the authentication strategy for TC-VSME using TanStack Start + Clerk.

**Key Decision**: We use **route-level protection** instead of custom request middleware.

## Why Not Request Middleware?

Initially, we attempted to create a custom `authMiddleware` using `createMiddleware({ type: 'request' })` to protect routes globally. However, this approach failed because:

1. **Clerk's `auth()` requires TanStack Start AsyncLocalStorage context**
2. **This context is NOT available in request middleware**, even when using `.server()`
3. **Error encountered**: `"No Start context found in AsyncLocalStorage"`

### What We Tried

```typescript
// ❌ This DOES NOT work
export const authMiddleware = createMiddleware({ type: 'request' }).server(
  async ({ next, request }) => {
    const session = await auth() // ❌ Error: No Start context
    // ...
  }
)
```

## The Correct Pattern: Route-Level Protection

The recommended Clerk + TanStack Start pattern uses route-level protection with `beforeLoad` hooks.

### Implementation

**File**: `src/routes/_appLayout/route.tsx`

```typescript
import { auth } from '@clerk/tanstack-react-start/server'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

// Server function that checks authentication
const authStateFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { isAuthenticated, userId } = await auth()

  if (!isAuthenticated) {
    throw redirect({ to: '/' })
  }
  // Additional auth checks can be added here?
  // We could add a check for user roles here? Like the hasVsme flag and others...
  // This will be our middleware for auth checks to all routes under /app/*?

  return { userId }
})

// Route with authentication check in beforeLoad
export const Route = createFileRoute('/_appLayout')({
  component: RouteComponent,
  beforeLoad: async () => await authStateFn(),
  loader: async ({ context }) => {
    return { userId: context.userId }
  },
})
```

### Why This Works

1. **`createServerFn()`** executes in the Start context where `auth()` is available
2. **`beforeLoad`** runs before the route loads, providing protection
3. **All routes under `_appLayout`** are automatically protected
4. **`auth()` works** because server functions have the necessary context

## Middleware Chain

### Global Middleware

**File**: `src/start.ts`

```typescript
import { clerkMiddleware } from '@clerk/tanstack-react-start/server'
import { createStart } from '@tanstack/react-start'

export const startInstance = createStart(() => {
  return {
    requestMiddleware: [clerkMiddleware()],
  }
})
```

**What `clerkMiddleware()` does**:
- Parses JWT from request headers
- Makes auth state available to server functions via `auth()`
- Does NOT protect routes (that's done at the route level)

### Route-Level Protection

- Implemented in `_appLayout/route.tsx`
- Uses `createServerFn()` with `auth()` in `beforeLoad`
- Redirects unauthenticated users to `/`

## Testing

The authentication approach is documented in tests:

**File**: `src/lib/auth/__tests__/middleware.test.ts`

```typescript
describe('Authentication Pattern Documentation', () => {
  it('documents why we use route-level protection instead of request middleware', () => {
    const explanation = {
      problem: "Clerk's auth() requires TanStack Start AsyncLocalStorage context",
      solution: 'Use route-level protection with createServerFn() in beforeLoad hooks',
      implementation: 'See src/routes/_appLayout/route.tsx',
    }
    // ...
  })
})
```

## Verification

Test the authentication by accessing a protected route:

```bash
curl -I http://localhost:3000/app
```

Expected response for unauthenticated users:
```
HTTP/1.1 307 Temporary Redirect
Location: /
x-clerk-auth-status: signed-out
```

## References

- [Clerk TanStack Start Quickstart - Server-Side Protection](https://clerk.com/docs/tanstack-react-start/getting-started/quickstart#server-side)
- [TanStack Start Middleware Documentation](https://tanstack.com/start/latest/docs/framework/react/guide/middleware)
- [TanStack Start Authentication Guide](https://tanstack.com/start/latest/docs/framework/react/guide/authentication)

## Files Modified

1. `src/start.ts` - Only uses `clerkMiddleware()`
2. `src/routes/_appLayout/route.tsx` - Route-level auth protection
3. `src/lib/auth/middleware.ts` - Documentation file explaining the approach
4. `src/lib/auth/__tests__/middleware.test.ts` - Documentation tests
5. `src/lib/auth/index.ts` - Updated exports

## Next Steps

To protect additional routes:

1. **Option 1**: Place them under `_appLayout` (recommended)
2. **Option 2**: Add similar `beforeLoad` auth checks to individual routes

