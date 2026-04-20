// src/server.ts
import handler from '@tanstack/react-start/server-entry'
import { paraglideMiddleware } from './paraglide/server.js'

export interface Env {
	ENVIRONMENT?: string
	MONGODB_URI?: string
	OPENAI_API_KEY?: string
	VITE_GOOGLE_MAPS_API_KEY?: string
}

export default {
	async fetch(req: Request, env: Env): Promise<Response> {
		const res = await paraglideMiddleware(req, () => handler.fetch(req))

		const headers = new Headers(res.headers)

		// Don't expose full secrets; just length / prefix for sanity
		headers.set('x-env-environment', env.ENVIRONMENT ?? 'undefined')
		headers.set(
			'x-env-mongodb-uri',
			env.MONGODB_URI ? `len:${env.MONGODB_URI.length}` : 'undefined',
		)
		headers.set(
			'x-env-openai-api-key',
			env.OPENAI_API_KEY
				? `starts:${env.OPENAI_API_KEY.slice(0, 5)}`
				: 'undefined',
		)
		headers.set(
			'x-env-google-maps-key',
			env.VITE_GOOGLE_MAPS_API_KEY
				? `starts:${env.VITE_GOOGLE_MAPS_API_KEY.slice(0, 5)}`
				: 'undefined',
		)

		return new Response(res.body, {
			status: res.status,
			headers,
		})
	},
}
