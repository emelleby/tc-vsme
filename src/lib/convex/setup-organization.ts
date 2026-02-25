import { auth, clerkClient } from '@clerk/tanstack-react-start/server'
import { createServerFn } from '@tanstack/react-start'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../../convex/_generated/api'

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL
if (!CONVEX_URL) {
	throw new Error('VITE_CONVEX_URL is not set')
}

interface SetupOrganizationResult {
	success: boolean
	error?: string
}

/**
 * Server function to set up organization in Convex and update Clerk metadata.
 * Called when user creates/selects an organization.
 */
export const setupOrganization = createServerFn({ method: 'POST' })
	// Validate input data DO NOT CHANGE to 'validator' as it breaks the type inference
	.inputValidator(
		(data: {
			orgId: string
			orgName: string
			orgSlug: string
			userEmail: string
			userFirstName?: string
			userLastName?: string
			userName?: string
			orgNumber?: string
			address?: {
				street?: string[]
				postalCode?: string
				city?: string
				country?: string
				countryCode?: string
			}
			orgForm?: string
			website?: string
			naceCode?: string
			industry?: string
			numberEmployees?: number
			businessModel?: string
		}) => data,
	)
	.handler(async ({ data }): Promise<SetupOrganizationResult> => {
		try {
			// Get authenticated user
			const { userId, orgId } = await auth()

			if (!userId) {
				return { success: false, error: 'Not authenticated' }
			}

			// Check if authorized (Active in session OR Admin of target org)
			let isAuthorized = false
			if (orgId === data.orgId) {
				isAuthorized = true
			} else {
				// Fallback: Verify via Clerk if user is a member/admin of the target org
				try {
					const client = await clerkClient()
					const memberships = await client.users.getOrganizationMembershipList({
						userId,
						limit: 100,
					})
					const membership = memberships.data.find(
						(m) => m.organization.id === data.orgId,
					)

					// Allow if user is an admin of the organization
					if (membership && membership.role === 'org:admin') {
						isAuthorized = true
					}
				} catch (error) {
					console.error('Failed to verify membership:', error)
				}
			}

			if (!isAuthorized) {
				console.error('Auth Check Failed', {
					sessionOrgId: orgId,
					targetOrgId: data.orgId,
				})
				return {
					success: false,
					error: 'Organization mismatch or insufficient permissions',
				}
			}

			// Get Clerk client (only needed for metadata updates)
			const client = await clerkClient()

			// Initialize Convex client (server-side)
			const convex = new ConvexHttpClient(CONVEX_URL)

			// Set auth token if available to act as the user
			try {
				// @ts-ignore - auth() returns different types in different environments, but getToken exists
				const { getToken } = await auth()
				const token = await getToken({ template: 'convex' })
				if (token) {
					convex.setAuth(token)
				}
			} catch (err) {
				console.warn('Failed to set auth token for Convex:', err)
			}

			// Step 1: Upsert organization in Convex (create or update with correct data)
			await convex.mutation(api.organizations.upsertOrganization, {
				clerkOrgId: data.orgId,
				name: data.orgName,
				slug: data.orgSlug,
				orgNumber: data.orgNumber,
				address: data.address,
				orgForm: data.orgForm,
				website: data.website,
				naceCode: data.naceCode,
				industry: data.industry,
				numberEmployees: data.numberEmployees,
				businessModel: data.businessModel,
				hasVsme: true,
			})

			// Step 2: Upsert user in Convex
			await convex.mutation(api.users.upsertUser, {
				clerkId: userId,
				email: data.userEmail,
				firstName: data.userFirstName,
				lastName: data.userLastName,
				username: data.userName,
				organizationId: data.orgId,
				hasVsme: false,
			})

			// Step 3: Update Clerk organization metadata
			await client.organizations.updateOrganizationMetadata(data.orgId, {
				publicMetadata: {
					hasVsme: true,
					vsmeDb: true,
				},
			})

			// Step 4: Update user metadata to disable further org creation
			await client.users.updateUserMetadata(userId, {
				publicMetadata: {
					hasVsme: false,
				},
			})

			return { success: true }
		} catch (error: unknown) {
			console.error('Setup organization error:', error)
			const message =
				error instanceof Error ? error.message : 'Failed to set up organization'
			return {
				success: false,
				error: message,
			}
		}
	})
