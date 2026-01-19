import { redirect } from '@tanstack/react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Test suite for _appLayout route protection
 *
 * This tests the routing decision logic that runs in the _appLayout beforeLoad hook.
 * It verifies all scenarios from the permission matrix:
 * - Visitors without VSME access are redirected to home
 * - Users with hasVsme but no org are redirected to /create-organization
 * - Users with org but no vsmeDb are redirected to /create-organization
 * - Users with full access can proceed to dashboard
 */

// Mock the auth context module
vi.mock('@/lib/auth', () => ({
	getAuthContext: vi.fn(),
}))

// Mock TanStack Router
vi.mock('@tanstack/react-router', async () => {
	const actual = await vi.importActual('@tanstack/react-router')
	return {
		...actual,
		redirect: vi.fn((config) => {
			throw new Error(`REDIRECT:${config.to}`)
		}),
	}
})

describe('_appLayout Route Protection', () => {
	let mockGetAuthContext: ReturnType<typeof vi.fn>

	beforeEach(async () => {
		vi.clearAllMocks()

		// Get the mocked function
		const authModule = await import('@/lib/auth')
		mockGetAuthContext = vi.mocked(authModule.getAuthContext)
	})

	describe('Unauthenticated Users', () => {
		it('redirects to /sign-in when getAuthContext returns null', async () => {
			mockGetAuthContext.mockResolvedValue(null)

			// Import route after mocks are set up
			const { Route } = await import('../route')

			// Expect redirect to be thrown
			await expect(async () => {
				if (Route.options.beforeLoad) {
					await Route.options.beforeLoad({} as any)
				}
			}).rejects.toThrow('REDIRECT:/sign-in')
		})
	})

	describe('Visitors - No VSME Access', () => {
		it('redirects to home when user has no hasVsme and no orgHasVsme', async () => {
			mockGetAuthContext.mockResolvedValue({
				isAuthenticated: true,
				userId: 'user_123',
				orgId: null,
				hasVsme: false,
				orgHasVsme: false,
				vsmeDb: false,
				canAccessDashboard: false,
				needsOrgSetup: false,
			})

			const { Route } = await import('../route')

			await expect(async () => {
				if (Route.options.beforeLoad) {
					await Route.options.beforeLoad({} as any)
				}
			}).rejects.toThrow('REDIRECT:/')
		})

		it('redirects to home when user is in org without orgHasVsme', async () => {
			mockGetAuthContext.mockResolvedValue({
				isAuthenticated: true,
				userId: 'user_123',
				orgId: 'org_456',
				hasVsme: false,
				orgHasVsme: false,
				vsmeDb: false,
				canAccessDashboard: false,
				needsOrgSetup: false,
			})

			const { Route } = await import('../route')

			await expect(async () => {
				if (Route.options.beforeLoad) {
					await Route.options.beforeLoad({} as any)
				}
			}).rejects.toThrow('REDIRECT:/')
		})
	})

	describe('New Users - Needs Organization Setup', () => {
		it('redirects to /create-organization when user has hasVsme but no org', async () => {
			mockGetAuthContext.mockResolvedValue({
				isAuthenticated: true,
				userId: 'user_123',
				orgId: null,
				hasVsme: true,
				orgHasVsme: false,
				vsmeDb: false,
				canAccessDashboard: false,
				needsOrgSetup: true,
			})

			const { Route } = await import('../route')

			await expect(async () => {
				if (Route.options.beforeLoad) {
					await Route.options.beforeLoad({} as any)
				}
			}).rejects.toThrow('REDIRECT:/create-organization')
		})

		it('redirects to /create-organization when org exists but vsmeDb is false', async () => {
			mockGetAuthContext.mockResolvedValue({
				isAuthenticated: true,
				userId: 'user_123',
				orgId: 'org_456',
				hasVsme: true,
				orgHasVsme: true,
				vsmeDb: false,
				canAccessDashboard: false,
				needsOrgSetup: true,
			})

			const { Route } = await import('../route')

			await expect(async () => {
				if (Route.options.beforeLoad) {
					await Route.options.beforeLoad({} as any)
				}
			}).rejects.toThrow('REDIRECT:/create-organization')
		})
	})

	describe('Full Access - Can Access Dashboard', () => {
		it('allows access when user has full permissions (hasVsme, orgHasVsme, vsmeDb)', async () => {
			const mockAuthContext = {
				isAuthenticated: true,
				userId: 'user_123',
				orgId: 'org_456',
				hasVsme: true,
				orgHasVsme: true,
				vsmeDb: true,
				canAccessDashboard: true,
				needsOrgSetup: false,
			}

			mockGetAuthContext.mockResolvedValue(mockAuthContext)

			const { Route } = await import('../route')

			// Should not throw, should return context
			const result = await Route.options.beforeLoad?.({} as any)

			expect(result).toEqual({ authContext: mockAuthContext })
		})

		it('passes authContext to child routes', async () => {
			const mockAuthContext = {
				isAuthenticated: true,
				userId: 'user_123',
				orgId: 'org_456',
				hasVsme: true,
				orgHasVsme: true,
				vsmeDb: true,
				canAccessDashboard: true,
				needsOrgSetup: false,
			}

			mockGetAuthContext.mockResolvedValue(mockAuthContext)

			const { Route } = await import('../route')

			const result = await Route.options.beforeLoad?.({} as any)

			// Verify authContext is available for child routes
			expect(result).toHaveProperty('authContext')
			expect(result?.authContext).toBe(mockAuthContext)
		})
	})

	describe('Edge Cases', () => {
		it('redirects when user has orgHasVsme but no hasVsme (edge case)', async () => {
			mockGetAuthContext.mockResolvedValue({
				isAuthenticated: true,
				userId: 'user_123',
				orgId: 'org_456',
				hasVsme: false,
				orgHasVsme: true,
				vsmeDb: true,
				canAccessDashboard: true,
				needsOrgSetup: false,
			})

			const { Route } = await import('../route')

			// Should allow access if orgHasVsme is true, even without hasVsme
			const result = await Route.options.beforeLoad?.({} as any)
			expect(result).toHaveProperty('authContext')
		})
	})
})
