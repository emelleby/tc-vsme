import handler from '@tanstack/react-start/server-entry'
import { paraglideMiddleware } from './paraglide/server.js'

export default {
	async fetch(req: Request, env: any, ctx: any): Promise<Response> {
		try {
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
