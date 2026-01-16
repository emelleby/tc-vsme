import { clerkMiddleware } from '@clerk/tanstack-react-start/server'
import { createStart } from '@tanstack/react-start'

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
