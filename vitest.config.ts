import { defineConfig } from 'vitest/config'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import { fileURLToPath } from 'url'

export default defineConfig({
	plugins: [
		viteTsConfigPaths({
			projects: ['./tsconfig.json'],
		}),
	],
	test: {
		globals: true,
		environment: 'jsdom',
		environmentMatchGlobs: [
			// all tests in convex/ will run in edge-runtime
			['convex/**', 'edge-runtime'],
			// all other tests use jsdom
			['**', 'jsdom'],
		],
		setupFiles: [],
		include: ['**/__tests__/**/*.test.{ts,tsx}', '**/*.test.{ts,tsx}'],
		exclude: ['node_modules', '.output', 'dist'],
		server: {
			deps: {
				inline: ['convex-test'],
			},
		},
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: [
				'node_modules/',
				'.output/',
				'dist/',
				'**/*.config.{ts,js}',
				'**/*.d.ts',
				'**/routeTree.gen.ts',
			],
		},
	},
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
})

