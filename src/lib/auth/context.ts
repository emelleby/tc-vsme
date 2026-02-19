/**
 * Authentication context utilities for TC-VSME
 *
 * This module provides server functions for fetching full authentication context
 * including user and organization permission flags from Convex. These functions are
 * designed to be called in route beforeLoad hooks where API calls are acceptable.
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
 * Fetches the complete authentication context for the current user.
 *
 * This server function:
 * - Retrieves user and organization IDs from Clerk session (JWT parsing)
 * - Fetches user permission flags from Convex (hasVsme)
 * - Fetches organization permission flags from Convex (orgHasVsme, vsmeDb) if org is selected
 * - Computes derived properties (canAccessDashboard, needsOrgSetup)
 *
 * **Performance Note**: This function makes Convex queries (~100ms total) and should only be
 * called in route beforeLoad hooks, not in global middleware.
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

		return {
			isAuthenticated: true,
			userId,
			orgId: orgId || null,
			hasVsme,
			orgHasVsme,
			vsmeDb,
			canAccessDashboard,
			needsOrgSetup,
		}
	},
)
