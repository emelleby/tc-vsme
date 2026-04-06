import handler from '@tanstack/react-start/server-entry'
import { paraglideMiddleware } from './paraglide/server.js'

// Server-side URL localization/redirects for Paraglide
export default {
	async fetch(req: Request): Promise<Response> {
		try {
			return await paraglideMiddleware(req, () => handler.fetch(req))
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err)
			const stack = err instanceof Error ? err.stack : undefined

			// Full error details go to the Cloudflare Workers log stream only
			console.error(
				'[Worker] Unhandled error during request:',
				stack ?? message,
			)

			// Safe, non-leaking response to the client
			return new Response(
				JSON.stringify({ error: 'Internal Server Error!', message }),
				{
					status: 500,
					headers: { 'Content-Type': 'application/json' },
				},
			)
		}
	},
}
