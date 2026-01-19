import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AuthContext } from '../types'

/**
 * Test suite for getAuthContext server function
 *
 * This tests the full authentication context fetching logic that runs
 * in route beforeLoad hooks. It verifies:
 * - User authentication state
 * - Permission flag extraction from Clerk metadata
 * - Computed properties (canAccessDashboard, needsOrgSetup)
 * - All routing decision scenarios from the permission matrix
 */

// Mock Clerk functions
vi.mock('@clerk/tanstack-react-start/server', () => ({
	auth: vi.fn(),
	clerkClient: vi.fn(),
}))

// Mock TanStack Start
vi.mock('@tanstack/react-start', () => ({
	createServerFn: vi.fn(() => ({
		handler: <T>(fn: T) => fn,
	})),
}))

describe('getAuthContext', () => {
	let mockAuth: ReturnType<typeof vi.fn>
	let mockClerkClient: ReturnType<typeof vi.fn>
	let mockGetUser: ReturnType<typeof vi.fn>
	let mockGetOrganization: ReturnType<typeof vi.fn>

	beforeEach(async () => {
		vi.clearAllMocks()

		// Setup mock functions
		mockGetUser = vi.fn()
		mockGetOrganization = vi.fn()

		mockClerkClient = vi.fn().mockResolvedValue({
			users: {
				getUser: mockGetUser,
			},
			organizations: {
				getOrganization: mockGetOrganization,
			},
		})

		mockAuth = vi.fn()

		// Apply mocks
		const clerkModule = await import('@clerk/tanstack-react-start/server')
		vi.mocked(clerkModule.auth).mockImplementation(mockAuth)
		vi.mocked(clerkModule.clerkClient).mockImplementation(mockClerkClient)
	})

	describe('Unauthenticated User', () => {
		it('returns null when user is not authenticated', async () => {
			mockAuth.mockResolvedValue({ userId: null, orgId: null })

			const { getAuthContext } = await import('../context')
			const result = await getAuthContext()

			expect(result).toBeNull()
			expect(mockGetUser).not.toHaveBeenCalled()
		})
	})

	describe('Authenticated User - Permission Flags', () => {
		it('returns hasVsme flag from user publicMetadata', async () => {
			mockAuth.mockResolvedValue({ userId: 'user_123', orgId: null })
			mockGetUser.mockResolvedValue({
				id: 'user_123',
				publicMetadata: { hasVsme: true },
			})

			const { getAuthContext } = await import('../context')
			const result = await getAuthContext()

			expect(result).not.toBeNull()
			expect(result?.hasVsme).toBe(true)
			expect(result?.userId).toBe('user_123')
			expect(result?.orgId).toBeNull()
		})

		it('returns false for hasVsme when not in metadata', async () => {
			mockAuth.mockResolvedValue({ userId: 'user_123', orgId: null })
			mockGetUser.mockResolvedValue({
				id: 'user_123',
				publicMetadata: {},
			})

			const { getAuthContext } = await import('../context')
			const result = await getAuthContext()

			expect(result?.hasVsme).toBe(false)
		})

		it('returns orgHasVsme and vsmeDb flags from org publicMetadata', async () => {
			mockAuth.mockResolvedValue({ userId: 'user_123', orgId: 'org_456' })
			mockGetUser.mockResolvedValue({
				id: 'user_123',
				publicMetadata: { hasVsme: true },
			})
			mockGetOrganization.mockResolvedValue({
				id: 'org_456',
				publicMetadata: { hasVsme: true, vsmeDb: true },
			})

			const { getAuthContext } = await import('../context')
			const result = await getAuthContext()

			expect(result?.orgHasVsme).toBe(true)
			expect(result?.vsmeDb).toBe(true)
			expect(result?.orgId).toBe('org_456')
		})

		it('returns false for org flags when no org selected', async () => {
			mockAuth.mockResolvedValue({ userId: 'user_123', orgId: null })
			mockGetUser.mockResolvedValue({
				id: 'user_123',
				publicMetadata: { hasVsme: true },
			})

			const { getAuthContext } = await import('../context')
			const result = await getAuthContext()

			expect(result?.orgHasVsme).toBe(false)
			expect(result?.vsmeDb).toBe(false)
			expect(result?.orgId).toBeNull()
		})

		it('handles missing org metadata gracefully', async () => {
			mockAuth.mockResolvedValue({ userId: 'user_123', orgId: 'org_456' })
			mockGetUser.mockResolvedValue({
				id: 'user_123',
				publicMetadata: { hasVsme: true },
			})
			mockGetOrganization.mockResolvedValue({
				id: 'org_456',
				publicMetadata: {},
			})

			const { getAuthContext } = await import('../context')
			const result = await getAuthContext()

			expect(result?.orgHasVsme).toBe(false)
			expect(result?.vsmeDb).toBe(false)
		})
	})

	describe('Computed Properties', () => {
		it('computes canAccessDashboard correctly when user has full access', async () => {
			mockAuth.mockResolvedValue({ userId: 'user_123', orgId: 'org_456' })
			mockGetUser.mockResolvedValue({
				id: 'user_123',
				publicMetadata: { hasVsme: true },
			})
			mockGetOrganization.mockResolvedValue({
				id: 'org_456',
				publicMetadata: { hasVsme: true, vsmeDb: true },
			})

			const { getAuthContext } = await import('../context')
			const result = await getAuthContext()

			expect(result?.canAccessDashboard).toBe(true)
		})

		it('computes canAccessDashboard as false when vsmeDb is missing', async () => {
			mockAuth.mockResolvedValue({ userId: 'user_123', orgId: 'org_456' })
			mockGetUser.mockResolvedValue({
				id: 'user_123',
				publicMetadata: { hasVsme: true },
			})
			mockGetOrganization.mockResolvedValue({
				id: 'org_456',
				publicMetadata: { hasVsme: true, vsmeDb: false },
			})

			const { getAuthContext } = await import('../context')
			const result = await getAuthContext()

			expect(result?.canAccessDashboard).toBe(false)
		})

		it('computes needsOrgSetup as true when user has hasVsme but no org', async () => {
			mockAuth.mockResolvedValue({ userId: 'user_123', orgId: null })
			mockGetUser.mockResolvedValue({
				id: 'user_123',
				publicMetadata: { hasVsme: true },
			})

			const { getAuthContext } = await import('../context')
			const result = await getAuthContext()

			expect(result?.needsOrgSetup).toBe(true)
		})

		it('computes needsOrgSetup as true when user has org but no vsmeDb', async () => {
			mockAuth.mockResolvedValue({ userId: 'user_123', orgId: 'org_456' })
			mockGetUser.mockResolvedValue({
				id: 'user_123',
				publicMetadata: { hasVsme: true },
			})
			mockGetOrganization.mockResolvedValue({
				id: 'org_456',
				publicMetadata: { hasVsme: true, vsmeDb: false },
			})

			const { getAuthContext } = await import('../context')
			const result = await getAuthContext()

			expect(result?.needsOrgSetup).toBe(true)
		})

		it('computes needsOrgSetup as false when user has full access', async () => {
			mockAuth.mockResolvedValue({ userId: 'user_123', orgId: 'org_456' })
			mockGetUser.mockResolvedValue({
				id: 'user_123',
				publicMetadata: { hasVsme: true },
			})
			mockGetOrganization.mockResolvedValue({
				id: 'org_456',
				publicMetadata: { hasVsme: true, vsmeDb: true },
			})

			const { getAuthContext } = await import('../context')
			const result = await getAuthContext()

			expect(result?.needsOrgSetup).toBe(false)
		})
	})

	describe('Permission Matrix - User State Scenarios', () => {
		it('Visitor: no hasVsme, no orgHasVsme, no vsmeDb', async () => {
			mockAuth.mockResolvedValue({ userId: 'user_123', orgId: null })
			mockGetUser.mockResolvedValue({
				id: 'user_123',
				publicMetadata: {},
			})

			const { getAuthContext } = await import('../context')
			const result = await getAuthContext()

			expect(result?.hasVsme).toBe(false)
			expect(result?.orgHasVsme).toBe(false)
			expect(result?.vsmeDb).toBe(false)
			expect(result?.canAccessDashboard).toBe(false)
			expect(result?.needsOrgSetup).toBe(false)
		})

		it('New User: hasVsme=true, no org, no vsmeDb', async () => {
			mockAuth.mockResolvedValue({ userId: 'user_123', orgId: null })
			mockGetUser.mockResolvedValue({
				id: 'user_123',
				publicMetadata: { hasVsme: true },
			})

			const { getAuthContext } = await import('../context')
			const result = await getAuthContext()

			expect(result?.hasVsme).toBe(true)
			expect(result?.orgHasVsme).toBe(false)
			expect(result?.vsmeDb).toBe(false)
			expect(result?.canAccessDashboard).toBe(false)
			expect(result?.needsOrgSetup).toBe(true)
		})

		it('Org Created: hasVsme=true, orgHasVsme=true, vsmeDb=false', async () => {
			mockAuth.mockResolvedValue({ userId: 'user_123', orgId: 'org_456' })
			mockGetUser.mockResolvedValue({
				id: 'user_123',
				publicMetadata: { hasVsme: true },
			})
			mockGetOrganization.mockResolvedValue({
				id: 'org_456',
				publicMetadata: { hasVsme: true, vsmeDb: false },
			})

			const { getAuthContext } = await import('../context')
			const result = await getAuthContext()

			expect(result?.hasVsme).toBe(true)
			expect(result?.orgHasVsme).toBe(true)
			expect(result?.vsmeDb).toBe(false)
			expect(result?.canAccessDashboard).toBe(false)
			expect(result?.needsOrgSetup).toBe(true)
		})

		it('Full Access: hasVsme=true, orgHasVsme=true, vsmeDb=true', async () => {
			mockAuth.mockResolvedValue({ userId: 'user_123', orgId: 'org_456' })
			mockGetUser.mockResolvedValue({
				id: 'user_123',
				publicMetadata: { hasVsme: true },
			})
			mockGetOrganization.mockResolvedValue({
				id: 'org_456',
				publicMetadata: { hasVsme: true, vsmeDb: true },
			})

			const { getAuthContext } = await import('../context')
			const result = await getAuthContext()

			expect(result?.hasVsme).toBe(true)
			expect(result?.orgHasVsme).toBe(true)
			expect(result?.vsmeDb).toBe(true)
			expect(result?.canAccessDashboard).toBe(true)
			expect(result?.needsOrgSetup).toBe(false)
		})
	})
})
