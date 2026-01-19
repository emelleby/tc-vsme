import { clerkMiddleware } from '@clerk/tanstack-react-start/server'
import { createStart } from '@tanstack/react-start'

/**
 * TanStack Start instance configuration
 *
 * Authentication Strategy:
 * - clerkMiddleware() parses JWT and makes auth state available
 * - Route protection is handled in route-level beforeLoad hooks (see _appLayout/route.tsx)
 * - We don't use custom auth middleware because Clerk's auth() requires Start context
 *   which isn't available in request middleware
 *
 * @see https://clerk.com/docs/tanstack-react-start/getting-started/quickstart#server-side
 */
export const startInstance = createStart(() => {
	return {
		requestMiddleware: [clerkMiddleware()],
	}
})

// import { clerkMiddleware } from '@clerk/tanstack-react-start/server'
// import { createStart } from '@tanstack/react-start'

// export const startInstance = createStart(() => {
// 	return {
// 		requestMiddleware: [
// 			clerkMiddleware({
// 				publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY,
// 				secretKey: process.env.CLERK_SECRET_KEY,
// 			}),
// 		],
// 	}
// })

// export default startInstance
