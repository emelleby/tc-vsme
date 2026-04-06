import handler from '@tanstack/react-start/server-entry'
import { paraglideMiddleware } from './paraglide/server.js'

// Catch promise rejections that are NOT awaited anywhere in the request chain.
// These appear in wrangler tail as { unhandled: true } with no useful context.
// Cloudflare Workers supports this global event; it fires before the runtime
// marks the rejection as unhandled, giving us the real error + stack.
addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
	const reason = event.reason
	const message = reason instanceof Error ? reason.message : String(reason)
	const stack = reason instanceof Error ? (reason.stack ?? message) : message
	console.error('[Worker] Floating promise rejection caught:', stack)
})

// Server-side URL localization/redirects for Paraglide
export default {
	async fetch(req: Request): Promise<Response> {
		const { method } = req
		const url = new URL(req.url)
		console.log(`[Worker] → ${method} ${url.pathname}`)

		try {
			const response = await paraglideMiddleware(req, () => handler.fetch(req))
			console.log(`[Worker] ← ${method} ${url.pathname} ${response.status}`)
			return response
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err)
			const stack = err instanceof Error ? err.stack : undefined

			// Full error details go to the Cloudflare Workers log stream only
			console.error(
				`[Worker] ✗ ${method} ${url.pathname} — caught error:`,
				stack ?? message,
			)

			// Safe, non-leaking response to the client
			return new Response(
				JSON.stringify({ error: 'Internal Server Error', message }),
				{
					status: 500,
					headers: { 'Content-Type': 'application/json' },
				},
			)
		}
	},
}
