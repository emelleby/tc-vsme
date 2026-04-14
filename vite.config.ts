import { cloudflare } from '@cloudflare/vite-plugin'
import contentCollections from '@content-collections/vite'
import { paraglideVitePlugin } from '@inlang/paraglide-js'
import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { fileURLToPath, URL } from 'url'
import { defineConfig } from 'vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'

const config = defineConfig({
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
			// TanStack devtools depend on solid-js internally. In SSR/worker environments
			// Vite resolves solid-js/web to its server.js stub (via `node`/`worker` export
			// conditions), which omits client-only exports like `use` and `setStyleProperty`.
			// Since solid-js is only used by client-side devtools (never executed in SSR),
			// we bypass the conditional exports and always use the full browser bundle.
			// 'solid-js/web': 'solid-js/web/dist/web.js',
		},
	},
	plugins: [
		devtools(),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/paraglide',
			strategy: ['url'],
		}),
		contentCollections(),
		// cloudflare({ viteEnvironment: { name: 'ssr' } }),
		// this is the plugin that enables path aliases
		viteTsConfigPaths({
			projects: ['./tsconfig.json'],
		}),
		tailwindcss(),
		tanstackStart(),
		// tanstackStart({ preset: 'cloudflare-workers' }),
		viteReact({
			babel: {
				plugins: ['babel-plugin-react-compiler'],
			},
		}),
	],
})

export default config
