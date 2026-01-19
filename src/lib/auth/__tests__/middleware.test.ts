import { describe, expect, it } from 'vitest'

/**
 * Test suite for authentication approach
 *
 * NOTE: This test file documents why we don't use request middleware
 * for authentication in TanStack Start + Clerk.
 *
 * The correct pattern is route-level protection using beforeLoad hooks.
 * See src/routes/_appLayout/route.tsx for the actual implementation.
 *
 * ## Why No Request Middleware?
 *
 * Clerk's auth() function requires the TanStack Start AsyncLocalStorage context,
 * which is NOT available in request middleware. This causes errors like:
 * "No Start context found in AsyncLocalStorage"
 *
 * ## The Correct Pattern
 *
 * Route-level protection with createServerFn() in beforeLoad:
 *
 * ```tsx
 * const authStateFn = createServerFn({ method: 'GET' }).handler(async () => {
 *   const { isAuthenticated, userId } = await auth()
 *   if (!isAuthenticated) throw redirect({ to: '/' })
 *   return { userId }
 * })
 *
 * export const Route = createFileRoute('/_appLayout')({
 *   beforeLoad: async () => await authStateFn(),
 * })
 * ```
 */

describe('Authentication Pattern Documentation', () => {
	it('documents why we use route-level protection instead of request middleware', () => {
		// This test serves as documentation for the authentication approach

		const explanation = {
			problem:
				"Clerk's auth() requires TanStack Start AsyncLocalStorage context, which isn't available in request middleware",
			solution:
				'Use route-level protection with createServerFn() in beforeLoad hooks',
			implementation: 'See src/routes/_appLayout/route.tsx',
			reference:
				'https://clerk.com/docs/tanstack-react-start/getting-started/quickstart#server-side',
		}

		expect(explanation.problem).toBeTruthy()
		expect(explanation.solution).toBeTruthy()
		expect(explanation.implementation).toBeTruthy()
		expect(explanation.reference).toBeTruthy()
	})

	it('documents the correct authentication pattern', () => {
		const pattern = {
			step1: 'clerkMiddleware() in src/start.ts parses JWT',
			step2: 'createServerFn() in route beforeLoad calls auth()',
			step3: 'auth() works because server functions have Start context',
			step4: 'beforeLoad redirects if not authenticated',
			step5: 'All routes under _appLayout are protected',
		}

		expect(pattern.step1).toBeTruthy()
		expect(pattern.step2).toBeTruthy()
		expect(pattern.step3).toBeTruthy()
		expect(pattern.step4).toBeTruthy()
		expect(pattern.step5).toBeTruthy()
	})

	it('documents the middleware chain', () => {
		const middlewareChain = {
			global: ['clerkMiddleware()'],
			routeLevel: ['authStateFn() in beforeLoad'],
			note: 'No custom request middleware needed',
		}

		expect(middlewareChain.global).toHaveLength(1)
		expect(middlewareChain.routeLevel).toHaveLength(1)
		expect(middlewareChain.note).toBeTruthy()
	})
})
