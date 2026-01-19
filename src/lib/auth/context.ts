/**
 * Authentication context utilities for TC-VSME
 *
 * This module provides server functions for fetching full authentication context
 * including user and organization metadata from Clerk. These functions are designed
 * to be called in route beforeLoad hooks where API calls are acceptable.
 */

import { auth, clerkClient } from '@clerk/tanstack-react-start/server'
import { createServerFn } from '@tanstack/react-start'
import type { AuthContext, ClerkOrgMetadata, ClerkUserMetadata } from './types'

/**
 * Fetches the complete authentication context for the current user.
 *
 * This server function:
 * - Retrieves user and organization IDs from Clerk session
 * - Fetches user metadata (hasVsme flag)
 * - Fetches organization metadata (orgHasVsme, vsmeDb flags) if org is selected
 * - Computes derived properties (canAccessDashboard, needsOrgSetup)
 *
 * **Performance Note**: This function makes Clerk API calls and should only be
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
		// Get basic session info from Clerk
		const { userId, orgId } = await auth()

		// Return null if not authenticated
		if (!userId) {
			return null
		}

		// Get Clerk client for API calls
		const client = await clerkClient()

		// Fetch user metadata
		const user = await client.users.getUser(userId)
		const userMetadata = (user.publicMetadata || {}) as ClerkUserMetadata
		const hasVsme = Boolean(userMetadata.hasVsme)

		// Initialize org flags
		let orgHasVsme = false
		let vsmeDb = false

		// Fetch org metadata if organization is selected
		if (orgId) {
			const org = await client.organizations.getOrganization({
				organizationId: orgId,
			})
			const orgMetadata = (org.publicMetadata || {}) as ClerkOrgMetadata
			orgHasVsme = Boolean(orgMetadata.hasVsme)
			vsmeDb = Boolean(orgMetadata.vsmeDb)
		}

		// Compute derived properties
		const canAccessDashboard = orgHasVsme && vsmeDb
		const needsOrgSetup = hasVsme && (!orgId || !vsmeDb)

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

