import handler from '@tanstack/react-start/server-entry'
import { paraglideMiddleware } from './paraglide/server.js'

export default {
	async fetch(req: Request, env: any, ctx: any): Promise<Response> {
		// Cloudflare Workers pass runtime variables in the `env` argument.
		// During Server-Side Rendering (SSR), `import.meta.env` is missing these.
		// We inject `env` into globalThis so Providers can read them during SSR.
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		;(globalThis as any).__ENV__ = env

		try {
			// CHECK CLERK KEYS
			console.log('--- Environment Check ---')
			console.log(
				'VITE_CLERK_PUBLISHABLE_KEY exists:',
				!!env.VITE_CLERK_PUBLISHABLE_KEY,
			)
			console.log('CLERK_SECRET_KEY exists:', !!env.CLERK_SECRET_KEY)
			// Optional: log first few chars if you need to be sure it's the right one
			if (env.CLERK_SECRET_KEY) {
				console.log('SK prefix:', env.CLERK_SECRET_KEY.substring(0, 12))
			}
			if (env.VITE_CLERK_PUBLISHABLE_KEY) {
				console.log(
					'PK prefix:',
					env.VITE_CLERK_PUBLISHABLE_KEY.substring(0, 12),
				)
			}
			console.log('--- Env Traceing ---')
			console.log('Worker env PK:', !!env.VITE_CLERK_PUBLISHABLE_KEY)
			console.log(
				'Import Meta PK:',
				!!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
			)
			console.log('--- End Environment Check ---')

			// Pass the request through the Paraglide middleware
			console.log('🔥🔥🔥🔥🔥')
			return await paraglideMiddleware(req, () => handler.fetch(req))
		} catch (error: any) {
			console.error('🔥 FATAL SERVER ERROR IN CLOUDFLARE WORKER:')
			console.error('Error Message:', error?.message)
			console.error('Error Stack:', error?.stack)

			// Catch generic fetch/HTTP errors (like from 'ofetch' or Clerk)
			if (error?.data) {
				console.error('Error Data:', JSON.stringify(error.data, null, 2))
			}
			if (error?.response) {
				console.error('Failed Response Status:', error.response.status)
				console.error('Failed URL:', error.response.url)
			}

			// We still throw it so Cloudflare returns a 500, but now we have logs!
			throw error
		}
	},
}
