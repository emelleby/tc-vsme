import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AuthContext } from '../types'

/**
 * Test suite for getAuthContext server function
 *
 * This tests the full authentication context fetching logic that runs
 * in route beforeLoad hooks. It verifies:
 * - User authentication state
 * - Permission flag extraction from Convex queries
 * - Computed properties (canAccessDashboard, needsOrgSetup)
 * - All routing decision scenarios from the permission matrix
 * - No Clerk Backend API calls are made (only JWT parsing)
 */

// Mock Clerk auth function (JWT parsing only)
vi.mock('@clerk/tanstack-react-start/server', () => ({
	auth: vi.fn(),
}))

// Mock TanStack Start
vi.mock('@tanstack/react-start', () => ({
	createServerFn: vi.fn(() => ({
		handler: <T>(fn: T) => fn,
	})),
}))

// Mock ConvexHttpClient
vi.mock('convex/browser', () => ({
	ConvexHttpClient: vi.fn(),
}))

describe('getAuthContext', () => {
	let mockAuth: ReturnType<typeof vi.fn>
	let mockConvexQuery: ReturnType<typeof vi.fn>
	let mockConvexSetAuth: ReturnType<typeof vi.fn>
	let mockConvexHttpClient: ReturnType<typeof vi.fn>

	beforeEach(async () => {
		vi.clearAllMocks()

		// Setup mock Convex query function
		mockConvexQuery = vi.fn()
		mockConvexSetAuth = vi.fn()

		// Setup mock ConvexHttpClient constructor
		mockConvexHttpClient = vi.fn().mockImplementation(() => ({
			query: mockConvexQuery,
			setAuth: mockConvexSetAuth,
		}))

		// Setup mock auth function
		mockAuth = vi.fn()

		// Apply mocks
		const clerkModule = await import('@clerk/tanstack-react-start/server')
		vi.mocked(clerkModule.auth).mockImplementation(mockAuth)

		const convexModule = await import('convex/browser')
		vi.mocked(convexModule.ConvexHttpClient).mockImplementation(
			mockConvexHttpClient,
		)
	})

	describe('Unauthenticated User', () => {
		it('returns null when user is not authenticated', async () => {
			mockAuth.mockResolvedValue({ userId: null, orgId: null })

			const { getAuthContext } = await import('../context')
			const result = await getAuthContext()

			expect(result).toBeNull()
			// Verify no Convex queries were made
			expect(mockConvexQuery).not.toHaveBeenCalled()
			expect(mockConvexHttpClient).not.toHaveBeenCalled()
		})
	})

	describe('Authenticated User - Permission Flags', () => {
		it('returns hasVsme flag from Convex user query', async () => {
			mockAuth.mockResolvedValue({
				userId: 'user_123',
				orgId: null,
				getToken: vi.fn().mockResolvedValue('mock-token'),
			})
			mockConvexQuery.mockResolvedValue({ hasVsme: true })

			const { getAuthContext } = await import('../context')
			const result = await getAuthContext()

			expect(result).not.toBeNull()
			expect(result?.hasVsme).toBe(true)
			expect(result?.userId).toBe('user_123')
			expect(result?.orgId).toBeNull()
			// Verify only user query was called (no org query)
			expect(mockConvexQuery).toHaveBeenCalledTimes(1)
		})

		it('returns false for hasVsme when Convex returns false', async () => {
			mockAuth.mockResolvedValue({
				userId: 'user_123',
				orgId: null,
				getToken: vi.fn().mockResolvedValue('mock-token'),
			})
			mockConvexQuery.mockResolvedValue({ hasVsme: false })

			const { getAuthContext } = await import('../context')
			const result = await getAuthContext()

			expect(result?.hasVsme).toBe(false)
		})

		it('returns orgHasVsme and vsmeDb flags from Convex org query', async () => {
			mockAuth.mockResolvedValue({
				userId: 'user_123',
				orgId: 'org_456',
				getToken: vi.fn().mockResolvedValue('mock-token'),
			})
			// First call returns user flags, second call returns org flags
			mockConvexQuery
				.mockResolvedValueOnce({ hasVsme: true })
				.mockResolvedValueOnce({ hasVsme: true, exists: true })

			const { getAuthContext } = await import('../context')
			const result = await getAuthContext()

			expect(result?.orgHasVsme).toBe(true)
			expect(result?.vsmeDb).toBe(true)
			expect(result?.orgId).toBe('org_456')
			// Verify both user and org queries were called
			expect(mockConvexQuery).toHaveBeenCalledTimes(2)
		})

		it('returns false for org flags when no org selected', async () => {
			mockAuth.mockResolvedValue({
				userId: 'user_123',
				orgId: null,
				getToken: vi.fn().mockResolvedValue('mock-token'),
			})
			mockConvexQuery.mockResolvedValue({ hasVsme: true })

			const { getAuthContext } = await import('../context')
			const result = await getAuthContext()

			expect(result?.orgHasVsme).toBe(false)
			expect(result?.vsmeDb).toBe(false)
			expect(result?.orgId).toBeNull()
			// Verify only user query was called
			expect(mockConvexQuery).toHaveBeenCalledTimes(1)
		})

		it('handles org not existing in Convex (exists: false)', async () => {
			mockAuth.mockResolvedValue({
				userId: 'user_123',
				orgId: 'org_456',
				getToken: vi.fn().mockResolvedValue('mock-token'),
			})
			mockConvexQuery
				.mockResolvedValueOnce({ hasVsme: true })
				.mockResolvedValueOnce({ hasVsme: false, exists: false })

			const { getAuthContext } = await import('../context')
			const result = await getAuthContext()

			expect(result?.orgHasVsme).toBe(false)
			expect(result?.vsmeDb).toBe(false)
		})
	})

	describe('Computed Properties', () => {
		it('computes canAccessDashboard correctly when user has full access', async () => {
			mockAuth.mockResolvedValue({
				userId: 'user_123',
				orgId: 'org_456',
				getToken: vi.fn().mockResolvedValue('mock-token'),
			})
			mockConvexQuery
				.mockResolvedValueOnce({ hasVsme: true })
				.mockResolvedValueOnce({ hasVsme: true, exists: true })

			const { getAuthContext } = await import('../context')
			const result = await getAuthContext()

			expect(result?.canAccessDashboard).toBe(true)
		})

		it('computes canAccessDashboard as false when vsmeDb is missing', async () => {
			mockAuth.mockResolvedValue({
				userId: 'user_123',
				orgId: 'org_456',
				getToken: vi.fn().mockResolvedValue('mock-token'),
			})
			mockConvexQuery
				.mockResolvedValueOnce({ hasVsme: true })
				.mockResolvedValueOnce({ hasVsme: true, exists: false })

			const { getAuthContext } = await import('../context')
			const result = await getAuthContext()

			expect(result?.canAccessDashboard).toBe(false)
		})

		it('computes needsOrgSetup as true when user has hasVsme but no org', async () => {
			mockAuth.mockResolvedValue({
				userId: 'user_123',
				orgId: null,
				getToken: vi.fn().mockResolvedValue('mock-token'),
			})
			mockConvexQuery.mockResolvedValue({ hasVsme: true })

			const { getAuthContext } = await import('../context')
			const result = await getAuthContext()

			expect(result?.needsOrgSetup).toBe(true)
		})

		it('computes needsOrgSetup as true when user has org but no vsmeDb', async () => {
			mockAuth.mockResolvedValue({
				userId: 'user_123',
				orgId: 'org_456',
				getToken: vi.fn().mockResolvedValue('mock-token'),
			})
			mockConvexQuery
				.mockResolvedValueOnce({ hasVsme: true })
				.mockResolvedValueOnce({ hasVsme: true, exists: false })

			const { getAuthContext } = await import('../context')
			const result = await getAuthContext()

			expect(result?.needsOrgSetup).toBe(true)
		})

		it('computes needsOrgSetup as false when user has full access', async () => {
			mockAuth.mockResolvedValue({
				userId: 'user_123',
				orgId: 'org_456',
				getToken: vi.fn().mockResolvedValue('mock-token'),
			})
			mockConvexQuery
				.mockResolvedValueOnce({ hasVsme: true })
				.mockResolvedValueOnce({ hasVsme: true, exists: true })

			const { getAuthContext } = await import('../context')
			const result = await getAuthContext()

			expect(result?.needsOrgSetup).toBe(false)
		})
	})

	describe('Permission Matrix - User State Scenarios', () => {
		it('Visitor: no hasVsme, no orgHasVsme, no vsmeDb', async () => {
			mockAuth.mockResolvedValue({
				userId: 'user_123',
				orgId: null,
				getToken: vi.fn().mockResolvedValue('mock-token'),
			})
			mockConvexQuery.mockResolvedValue({ hasVsme: false })

			const { getAuthContext } = await import('../context')
			const result = await getAuthContext()

			expect(result?.hasVsme).toBe(false)
			expect(result?.orgHasVsme).toBe(false)
			expect(result?.vsmeDb).toBe(false)
			expect(result?.canAccessDashboard).toBe(false)
			expect(result?.needsOrgSetup).toBe(false)
		})

		it('New User: hasVsme=true, no org, no vsmeDb', async () => {
			mockAuth.mockResolvedValue({
				userId: 'user_123',
				orgId: null,
				getToken: vi.fn().mockResolvedValue('mock-token'),
			})
			mockConvexQuery.mockResolvedValue({ hasVsme: true })

			const { getAuthContext } = await import('../context')
			const result = await getAuthContext()

			expect(result?.hasVsme).toBe(true)
			expect(result?.orgHasVsme).toBe(false)
			expect(result?.vsmeDb).toBe(false)
			expect(result?.canAccessDashboard).toBe(false)
			expect(result?.needsOrgSetup).toBe(true)
		})

		it('Org Created: hasVsme=true, orgHasVsme=true, vsmeDb=false', async () => {
			mockAuth.mockResolvedValue({
				userId: 'user_123',
				orgId: 'org_456',
				getToken: vi.fn().mockResolvedValue('mock-token'),
			})
			mockConvexQuery
				.mockResolvedValueOnce({ hasVsme: true })
				.mockResolvedValueOnce({ hasVsme: true, exists: false })

			const { getAuthContext } = await import('../context')
			const result = await getAuthContext()

			expect(result?.hasVsme).toBe(true)
			expect(result?.orgHasVsme).toBe(true)
			expect(result?.vsmeDb).toBe(false)
			expect(result?.canAccessDashboard).toBe(false)
			expect(result?.needsOrgSetup).toBe(true)
		})

		it('Full Access: hasVsme=true, orgHasVsme=true, vsmeDb=true', async () => {
			mockAuth.mockResolvedValue({
				userId: 'user_123',
				orgId: 'org_456',
				getToken: vi.fn().mockResolvedValue('mock-token'),
			})
			mockConvexQuery
				.mockResolvedValueOnce({ hasVsme: true })
				.mockResolvedValueOnce({ hasVsme: true, exists: true })

			const { getAuthContext } = await import('../context')
			const result = await getAuthContext()

			expect(result?.hasVsme).toBe(true)
			expect(result?.orgHasVsme).toBe(true)
			expect(result?.vsmeDb).toBe(true)
			expect(result?.canAccessDashboard).toBe(true)
			expect(result?.needsOrgSetup).toBe(false)
		})
	})

	describe('Error Handling and Edge Cases', () => {
		it('handles missing getToken gracefully', async () => {
			mockAuth.mockResolvedValue({
				userId: 'user_123',
				orgId: null,
				// No getToken function
			})
			mockConvexQuery.mockResolvedValue({ hasVsme: true })

			const { getAuthContext } = await import('../context')
			const result = await getAuthContext()

			// Should still work, just without auth token set
			expect(result).not.toBeNull()
			expect(result?.hasVsme).toBe(true)
		})

		it('handles Convex query failure gracefully', async () => {
			mockAuth.mockResolvedValue({
				userId: 'user_123',
				orgId: null,
				getToken: vi.fn().mockResolvedValue('mock-token'),
			})
			mockConvexQuery.mockRejectedValue(new Error('Convex query failed'))

			const { getAuthContext } = await import('../context')

			// Should throw the error (not swallow it)
			await expect(getAuthContext()).rejects.toThrow('Convex query failed')
		})

		it('sets auth token on ConvexHttpClient when available', async () => {
			const mockGetToken = vi.fn().mockResolvedValue('test-token-123')
			mockAuth.mockResolvedValue({
				userId: 'user_123',
				orgId: null,
				getToken: mockGetToken,
			})
			mockConvexQuery.mockResolvedValue({ hasVsme: true })

			const { getAuthContext } = await import('../context')
			await getAuthContext()

			// Verify getToken was called with correct template
			expect(mockGetToken).toHaveBeenCalledWith({ template: 'convex' })
			// Verify setAuth was called with the token
			expect(mockConvexSetAuth).toHaveBeenCalledWith('test-token-123')
		})
	})
})
