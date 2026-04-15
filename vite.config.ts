import { cloudflare } from '@cloudflare/vite-plugin'
import contentCollections from '@content-collections/vite'
import { paraglideVitePlugin } from '@inlang/paraglide-js'
import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
// import { nitroV2Plugin } from '@tanstack/nitro-v2-vite-plugin'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'url'
import { defineConfig } from 'vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'

const config = defineConfig({
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
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
		cloudflare({ viteEnvironment: { name: 'ssr' } }),
		// this is the plugin that enables path aliases, I guess
		viteTsConfigPaths({
			projects: ['./tsconfig.json'],
		}),
		tailwindcss(),
		tanstackStart(),
		// tanstackStart({ preset: 'cloudflare_module', compatibilityDate: '2026-04-15' }),
		// nitroV2Plugin({ preset: 'cloudflare_module', compatibilityDate: '2026-04-15' }),
		viteReact({
			babel: {
				plugins: ['babel-plugin-react-compiler'],
			},
		}),
	],
})

export default config
