/**
 * Authentication utility functions for Convex functions.
 *
 * These utilities provide type-safe access to authenticated user identity
 * from Clerk JWT tokens, enabling database-layer authorization.
 *
 * IMPORTANT: All functions are async and must be awaited!
 *
 * Usage:
 * ```typescript
 * import { requireUserId, getOrgId, requireOrgId } from "./_utils/auth";
 *
 * export const myQuery = query({
 *   handler: async (ctx) => {
 *     const userId = await requireUserId(ctx); // Throws if not authenticated
 *     const orgId = await getOrgId(ctx);       // Returns null if no org selected
 *     // ... your query logic
 *   },
 * });
 * ```
 *
 * See convex/AUTH.md for full documentation and best practices.
 */

/**
 * Per-request identity cache.
 *
 * Uses WeakMap keyed on the ctx object to cache getUserIdentity() promises.
 * This ensures that multiple auth utility calls within a single handler invocation
 * only trigger one underlying getUserIdentity() call.
 *
 * Key properties:
 * - Caches the Promise (not the resolved value) to handle concurrent calls correctly
 * - WeakMap ensures automatic garbage collection when ctx goes out of scope
 * - Different handler invocations get different ctx objects → zero cross-request leakage
 */
const identityCache = new WeakMap<object, Promise<any>>();

/**
 * Get cached user identity from context.
 *
 * Internal helper that implements per-request caching of getUserIdentity() calls.
 * All auth utility functions should call this instead of ctx.auth.getUserIdentity() directly.
 *
 * @param ctx - The Convex function context
 * @returns Promise resolving to the user identity or null
 */
function getCachedIdentity(ctx: any): Promise<any> {
  const cached = identityCache.get(ctx);
  if (cached) {
    return cached;
  }
  const promise = ctx.auth.getUserIdentity();
  identityCache.set(ctx, promise);
  return promise;
}

/**
 * Extract user ID from authenticated context.
 * Throws error if user is not authenticated.
 *
 * @param ctx - The Convex function context
 * @returns The authenticated user's ID (from JWT 'sub' claim)
 * @throws Error if user is not authenticated
 */
export async function requireUserId(ctx: any): Promise<string> {
  const identity = await getCachedIdentity(ctx);

  if (!identity) {
    throw new Error("Unauthorized: User must be authenticated");
  }

  // Check if identity is empty object (JWT verification failure)
  if (Object.keys(identity).length === 0) {
    throw new Error("Unauthorized: User must be authenticated");
  }

  // Use 'subject' claim as the user ID (standard OIDC 'sub' claim)
  // Convex exposes this as 'subject' or 'tokenIdentifier'
  const userId = identity.subject || identity.tokenIdentifier || identity.sub;

  if (!userId) {
    throw new Error("Unauthorized: User must be authenticated");
  }

  return userId;
}

/**
 * Extract organization ID from authenticated context.
 * Returns null if no organization is selected or user is not authenticated.
 *
 * @param ctx - The Convex function context
 * @returns The organization ID from JWT custom 'org_id' claim, or null
 */
export async function getOrgId(ctx: any): Promise<string | null> {
  const identity = await getCachedIdentity(ctx);
  if (!identity) {
    return null;
  }

  // Extract custom 'org_id' claim from JWT
  // Support both old layout (org_id) and new layout (o.id)
  let orgId = identity.org_id as string | null;

  // Check new JWT layout (org info in 'o' object)
  if (!orgId && identity.o && typeof identity.o === 'object') {
    orgId = (identity.o as any).id as string | null;
  }

  return orgId;
}

/**
 * Require organization context.
 * Throws error if no organization is selected or user is not authenticated.
 *
 * @param ctx - The Convex function context
 * @returns The organization ID from JWT custom 'org_id' claim
 * @throws Error if user is not authenticated or no organization is selected
 */
export async function requireOrgId(ctx: any): Promise<string> {
  const orgId = await getOrgId(ctx);

  if (!orgId) {
    throw new Error("Unauthorized: Organization must be selected");
  }

  return orgId;
}

/**
 * Get full authenticated user identity.
 * Returns null if not authenticated.
 *
 * @param ctx - The Convex function context
 * @returns The full identity object with all JWT claims, or null
 */
export async function getAuthIdentity(ctx: any) {
  return await getCachedIdentity(ctx);
}

/**
 * Get user email from authenticated context.
 * Returns null if not authenticated or email not available.
 *
 * @param ctx - The Convex function context
 * @returns The user's email, or null
 */
export async function getUserEmail(ctx: any): Promise<string | null> {
  const identity = await getCachedIdentity(ctx);
  if (!identity) {
    return null;
  }
  return identity.email as string | null;
}

/**
 * Get user name from authenticated context.
 * Returns null if not authenticated or name not available.
 *
 * @param ctx - The Convex function context
 * @returns The user's name, or null
 */
export async function getUserName(ctx: any): Promise<string | null> {
  const identity = await getCachedIdentity(ctx);
  if (!identity) {
    return null;
  }
  return identity.name as string | null;
}

/**
 * Get user's organization role from authenticated context.
 * Returns null if not authenticated or role not available.
 *
 * @param ctx - The Convex function context
 * @returns The user's organization role from JWT custom 'org_role' claim, or null
 */
export async function getOrgRole(ctx: any): Promise<string | null> {
  const identity = await getCachedIdentity(ctx);
  if (!identity) {
    return null;
  }

  // Extract custom 'org_role' claim from JWT
  // Support both old layout (org_role) and new layout (o.rol)
  let orgRole = identity.org_role as string | null;

  // Check new JWT layout (org info in 'o' object)
  if (!orgRole && identity.o && typeof identity.o === 'object') {
    orgRole = (identity.o as any).rol as string | null;
  }

  return orgRole;
}
