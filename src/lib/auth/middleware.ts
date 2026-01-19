/**
 * Authentication middleware for TanStack Start + Clerk
 *
 * NOTE: This file is intentionally empty/minimal because TanStack Start + Clerk
 * uses a different pattern for route protection than traditional middleware.
 *
 * ## Why No Request Middleware?
 *
 * Clerk's `auth()` function requires the TanStack Start AsyncLocalStorage context,
 * which is NOT available in request middleware (even with `.server()`).
 * This causes "No Start context found in AsyncLocalStorage" errors.
 *
 * ## The Correct Pattern: Route-Level Protection
 *
 * Instead of request middleware, we use route-level protection with `beforeLoad`:
 *
 * ```tsx
 * // src/routes/_appLayout/route.tsx
 * const authStateFn = createServerFn({ method: 'GET' }).handler(async () => {
 *   const { isAuthenticated, userId } = await auth()
 *   if (!isAuthenticated) {
 *     throw redirect({ to: '/' })
 *   }
 *   return { userId }
 * })
 *
 * export const Route = createFileRoute('/_appLayout')({
 *   beforeLoad: async () => await authStateFn(),
 *   // ...
 * })
 * ```
 *
 * This works because:
 * - `createServerFn()` executes in the Start context where `auth()` is available
 * - `beforeLoad` runs before the route loads, providing protection
 * - All routes under `_appLayout` are automatically protected
 *
 * ## Middleware Chain
 *
 * The only middleware we use is Clerk's built-in middleware:
 *
 * ```tsx
 * // src/start.ts
 * export const startInstance = createStart(() => {
 *   return {
 *     requestMiddleware: [clerkMiddleware()],
 *   }
 * })
 * ```
 *
 * `clerkMiddleware()` parses the JWT and makes auth state available to
 * server functions via `auth()`.
 *
 * ## References
 * - https://clerk.com/docs/tanstack-react-start/getting-started/quickstart#server-side
 * - https://tanstack.com/start/latest/docs/framework/react/guide/middleware
 */

// This file is kept for documentation purposes and to maintain the module structure.
// Actual auth protection is implemented in route-level beforeLoad hooks.
export {}
