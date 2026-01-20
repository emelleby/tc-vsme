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
	.inputValidator((data: { orgId: string }) => data)
	.handler(async ({ data }): Promise<SetupOrganizationResult> => {
		try {
			// Get authenticated user
			const { userId, orgId } = await auth()

			if (!userId) {
				return { success: false, error: 'Not authenticated' }
			}

			if (!orgId || orgId !== data.orgId) {
				return { success: false, error: 'Organization mismatch' }
			}

			// Get Clerk client
			const client = await clerkClient()

			// Fetch user details from Clerk
			const user = await client.users.getUser(userId)

			// Fetch organization details from Clerk
			const organization = await client.organizations.getOrganization({
				organizationId: orgId,
			})

			// Initialize Convex client (server-side)
			const convex = new ConvexHttpClient(CONVEX_URL)

			// Step 1: Upsert organization in Convex (create or update with correct data)
			await convex.mutation(api.organizations.upsertOrganization, {
				clerkOrgId: orgId,
				name: organization.name,
				slug: organization.slug || organization.name.toLowerCase().replace(/\s+/g, '-'),
			})

			// Step 2: Upsert user in Convex
			await convex.mutation(api.users.upsertUser, {
				clerkId: userId,
				email: user.emailAddresses[0]?.emailAddress || '',
				firstName: user.firstName || undefined,
				lastName: user.lastName || undefined,
				username: user.username || undefined,
				organizationId: data.orgId,
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
		} catch (error: any) {
			console.error('Setup organization error:', error)
			return {
				success: false,
				error: error.message || 'Failed to set up organization',
			}
		}
	})
