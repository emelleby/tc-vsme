import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Test suite for /create-organization route protection
 *
 * This route is accessible to users with hasVsme permission who need to
 * set up their organization. It should:
 * - Allow access to authenticated users with hasVsme
 * - Redirect unauthenticated users to /sign-in
 * - Redirect users without hasVsme to home
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

describe('/create-organization Route Protection', () => {
	let mockGetAuthContext: ReturnType<typeof vi.fn>

	beforeEach(async () => {
		vi.clearAllMocks()

		// Get the mocked function
		const authModule = await import('@/lib/auth')
		mockGetAuthContext = vi.mocked(authModule.getAuthContext)
	})

	describe('Access Control', () => {
		it('redirects to /sign-in when user is not authenticated', async () => {
			mockGetAuthContext.mockResolvedValue(null)

			const { Route } = await import('../create-organization')

			await expect(async () => {
				if (Route.options.beforeLoad) {
					await Route.options.beforeLoad({} as any)
				}
			}).rejects.toThrow('REDIRECT:/sign-in')
		})

		it('redirects to home when user has no hasVsme permission', async () => {
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

			const { Route } = await import('../create-organization')

			await expect(async () => {
				if (Route.options.beforeLoad) {
					await Route.options.beforeLoad({} as any)
				}
			}).rejects.toThrow('REDIRECT:/')
		})

		it('allows access when user has hasVsme but no org', async () => {
			const mockAuthContext = {
				isAuthenticated: true,
				userId: 'user_123',
				orgId: null,
				hasVsme: true,
				orgHasVsme: false,
				vsmeDb: false,
				canAccessDashboard: false,
				needsOrgSetup: true,
			}

			mockGetAuthContext.mockResolvedValue(mockAuthContext)

			const { Route } = await import('../create-organization')

			const result = await Route.options.beforeLoad?.({} as any)

			expect(result).toEqual({ authContext: mockAuthContext })
		})

		it('allows access when user has org but no vsmeDb', async () => {
			const mockAuthContext = {
				isAuthenticated: true,
				userId: 'user_123',
				orgId: 'org_456',
				hasVsme: true,
				orgHasVsme: true,
				vsmeDb: false,
				canAccessDashboard: false,
				needsOrgSetup: true,
			}

			mockGetAuthContext.mockResolvedValue(mockAuthContext)

			const { Route } = await import('../create-organization')

			const result = await Route.options.beforeLoad?.({} as any)

			expect(result).toEqual({ authContext: mockAuthContext })
		})

		it('redirects to /app when user already has full access', async () => {
			mockGetAuthContext.mockResolvedValue({
				isAuthenticated: true,
				userId: 'user_123',
				orgId: 'org_456',
				hasVsme: true,
				orgHasVsme: true,
				vsmeDb: true,
				canAccessDashboard: true,
				needsOrgSetup: false,
			})

			const { Route } = await import('../create-organization')

			await expect(async () => {
				if (Route.options.beforeLoad) {
					await Route.options.beforeLoad({} as any)
				}
			}).rejects.toThrow('REDIRECT:/app')
		})
	})
})
