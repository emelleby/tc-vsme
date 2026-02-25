import { defineConfig } from 'vitest/config'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import { fileURLToPath } from 'url'

const alias = {
	'@': fileURLToPath(new URL('./src', import.meta.url)),
}

const tsconfigPaths = viteTsConfigPaths({
	projects: ['./tsconfig.json'],
})

export default defineConfig({
	plugins: [tsconfigPaths],
	test: {
		globals: true,
		setupFiles: [],
		exclude: ['node_modules', '.output', 'dist'],
		projects: [
			{
				name: 'edge-runtime',
				plugins: [tsconfigPaths],
				resolve: { alias },
				test: {
					environment: 'edge-runtime',
					include: ['convex/**/*.test.{ts,tsx}'],
				},
			},
			{
				name: 'jsdom',
				plugins: [tsconfigPaths],
				resolve: { alias },
				test: {
					environment: 'jsdom',
					include: ['**/__tests__/**/*.test.{ts,tsx}', '**/*.test.{ts,tsx}'],
					exclude: ['convex/**'],
				},
			},
		],
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
	resolve: { alias },
})

