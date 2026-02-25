/**
 * Authentication context utilities for TC-VSME
 *
 * This module provides server functions for fetching full authentication context
 * including user and organization permission flags from Convex. These functions are
 * designed to be called in route beforeLoad hooks where API calls are acceptable.
 *
 * Story 5: Client-Side Auth Context Caching
 * - Implements in-memory cache to avoid redundant Convex queries on navigation
 * - Cache is keyed by userId + orgId to handle org switching
 * - Cache is automatically invalidated when orgId changes
 * - Manual invalidation available via invalidateAuthContext()
 */

import { auth } from '@clerk/tanstack-react-start/server'
import { createServerFn } from '@tanstack/react-start'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../../convex/_generated/api'
import type { AuthContext } from './types'

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL
if (!CONVEX_URL) {
	throw new Error('VITE_CONVEX_URL is not set')
}

/**
 * In-memory cache for auth context
 * Key format: `${userId}:${orgId || 'no-org'}`
 * Cache is cleared on page refresh (in-memory only)
 */
const authContextCache = new Map<string, AuthContext | null>()

/**
 * Generates a cache key for the auth context
 */
function getCacheKey(userId: string, orgId: string | null | undefined): string {
	return `${userId}:${orgId || 'no-org'}`
}

/**
 * Invalidates the cached auth context for the current user.
 * Call this after operations that change user/org permissions (e.g., setupOrganization).
 *
 * @example
 * ```tsx
 * await setupOrganization({ ... })
 * await invalidateAuthContext() // Force fresh data on next navigation
 * ```
 */
export const invalidateAuthContext = createServerFn({
	method: 'POST',
}).handler(async (): Promise<void> => {
	const authResult = await auth()
	const userId = authResult.userId
	const orgId = authResult.orgId

	if (userId) {
		const cacheKey = getCacheKey(userId, orgId)
		authContextCache.delete(cacheKey)
	}
})

/**
 * Fetches the complete authentication context for the current user.
 *
 * This server function:
 * - Retrieves user and organization IDs from Clerk session (JWT parsing)
 * - Fetches user permission flags from Convex (hasVsme)
 * - Fetches organization permission flags from Convex (orgHasVsme, vsmeDb) if org is selected
 * - Computes derived properties (canAccessDashboard, needsOrgSetup)
 * - **Story 5**: Caches results in-memory to avoid redundant queries on navigation
 *
 * **Performance Note**: First call makes Convex queries (~100ms total). Subsequent calls
 * return cached data instantly unless orgId changes or cache is invalidated.
 *
 * **Cache Invalidation**: Cache is automatically cleared when:
 * - User switches organizations (orgId changes)
 * - Page is refreshed (in-memory cache)
 * - invalidateAuthContext() is called manually
 *
 * @returns AuthContext object if authenticated, null otherwise
 *
 * @example
 * ```tsx
 * // In a route file
 * export const Route = createFileRoute('/_appLayout')({
 *   beforeLoad: async () => {
 *     const authContext = await getAuthContext()
 *     if (!authContext?.canAccessDashboard) {
 *       throw redirect({ to: '/create-organization' })
 *     }
 *     return { authContext }
 *   }
 * })
 * ```
 */
export const getAuthContext = createServerFn({ method: 'GET' }).handler(
	async (): Promise<AuthContext | null> => {
		// Get basic session info from Clerk (local JWT parsing - no API call)
		const authResult = await auth()
		const userId = authResult.userId
		const orgId = authResult.orgId

		// Return null if not authenticated
		if (!userId) {
			return null
		}

		// Check cache first
		const cacheKey = getCacheKey(userId, orgId)
		const cached = authContextCache.get(cacheKey)
		if (cached !== undefined) {
			// Cache hit - return immediately without Convex queries
			return cached
		}

		// Initialize Convex client (server-side)
		const convex = new ConvexHttpClient(CONVEX_URL)

		// Set auth token to act as the user
		try {
			// @ts-ignore - auth() returns different types in different environments, but getToken exists
			const token = await authResult.getToken({ template: 'convex' })
			if (token) {
				convex.setAuth(token)
			}
		} catch (err) {
			console.warn('Failed to set auth token for Convex:', err)
		}

		// Fetch user permission flags from Convex
		const userFlags = await convex.query(api.users.getPermissionFlags, {})
		const hasVsme = userFlags.hasVsme

		// Initialize org flags
		let orgHasVsme = false
		let vsmeDb = false

		// Fetch org permission flags from Convex if organization is selected
		if (orgId) {
			const orgFlags = await convex.query(
				api.organizations.getPermissionFlags,
				{
					clerkOrgId: orgId,
				},
			)
			orgHasVsme = orgFlags.hasVsme
			vsmeDb = orgFlags.exists
		}

		// Compute derived properties
		const canAccessDashboard = orgHasVsme && vsmeDb
		// User needs org setup if:
		// 1. They have hasVsme but no org selected, OR
		// 2. They have an org with orgHasVsme but no vsmeDb
		const needsOrgSetup = hasVsme && (!orgId || (orgHasVsme && !vsmeDb))

		const result: AuthContext = {
			isAuthenticated: true,
			userId,
			orgId: orgId || null,
			hasVsme,
			orgHasVsme,
			vsmeDb,
			canAccessDashboard,
			needsOrgSetup,
		}

		// Store in cache for future navigations
		authContextCache.set(cacheKey, result)

		return result
	},
)
