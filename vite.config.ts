import { cloudflare } from '@cloudflare/vite-plugin'
import contentCollections from '@content-collections/vite'
import { paraglideVitePlugin } from '@inlang/paraglide-js'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { fileURLToPath, URL } from 'url'
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'

const VIRTUAL_PREFIX = '\0virtual:demo-stub:'

// This plugin excludes demo routes from production builds to reduce bundle size.
// function excludeDemoRoutes(): Plugin {
// 	const isProd = process.env.NODE_ENV === 'production'
// 	return {
// 		name: 'exclude-demo-routes',
// 		enforce: 'pre',
// 		resolveId(source, importer) {
// 			if (!isProd || !importer) return
// 			if (
// 				importer.includes('routeTree.gen') &&
// 				source.includes('_demoLayout')
// 			) {
// 				return VIRTUAL_PREFIX + source
// 			}
// 		},
// 		load(id) {
// 			if (id.startsWith(VIRTUAL_PREFIX)) {
// 				return 'export const Route = {}'
// 			}
// 		},
// 	}
// }

const config = defineConfig({
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
	plugins: [
		// For production builds, we want to exclude the demo routes to reduce bundle size.
		// excludeDemoRoutes(),
		devtools(),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/paraglide',
			strategy: ['url'],
		}),
		contentCollections(),
		cloudflare({ viteEnvironment: { name: 'ssr' } }),
		viteTsConfigPaths({
			projects: ['./tsconfig.json'],
		}),
		tailwindcss(),
		tanstackStart(),
		viteReact({
			babel: {
				plugins: ['babel-plugin-react-compiler'],
			},
		}),
		process.env.ANALYZE
			? visualizer({
					filename: './bundle-stats.html',
					template: 'treemap',
					gzipSize: true,
					brotliSize: true,
				})
			: null,
	].filter(Boolean),
})

export default config
