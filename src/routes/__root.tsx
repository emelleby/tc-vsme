import { TanStackDevtools } from '@tanstack/react-devtools'
import type { QueryClient } from '@tanstack/react-query'
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	redirect,
	Scripts,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { Toaster } from 'sonner'
import { DefaultCatchBoundary } from '@/components/DefaultCatchBoundary'
import { NotFound } from '@/components/NotFound'
import { getLocale, shouldRedirect } from '@/paraglide/runtime'
import Header from '../components/Header'
import ClerkProvider from '../integrations/clerk/provider'
import ConvexProvider from '../integrations/convex/provider'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'
import AiDevtools from '../lib/ai-devtools'
import StoreDevtools from '../lib/demo-store-devtools'
import appCss from '../styles.css?url'

interface MyRouterContext {
	queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	beforeLoad: async () => {
		// Other redirect strategies are possible; see
		// https://github.com/TanStack/router/tree/main/examples/react/i18n-paraglide#offline-redirect
		if (typeof document !== 'undefined') {
			document.documentElement.setAttribute('lang', getLocale())
		}
	},

	head: () => ({
		meta: [
			{
				charSet: 'utf-8',
			},
			{
				name: 'viewport',
				content: 'width=device-width, initial-scale=1',
			},
			{
				title: 'TC VSME',
			},
		],
		links: [
			{
				rel: 'stylesheet',
				href: appCss,
			},
		],
	}),
	errorComponent: (props) => {
		return (
			<RootDocument>
				<DefaultCatchBoundary {...props} />
			</RootDocument>
		)
	},
	notFoundComponent: () => <NotFound />,

	shellComponent: RootComponent,
})
function RootComponent() {
	return (
		<ClerkProvider>
			<ConvexProvider>
				<RootDocument>
					<Outlet />
				</RootDocument>
			</ConvexProvider>
		</ClerkProvider>
	)
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang={getLocale()}>
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				<TanStackDevtools
					config={{
						position: 'bottom-right',
					}}
					plugins={[
						{
							name: 'Tanstack Router',
							render: <TanStackRouterDevtoolsPanel />,
						},
						AiDevtools,
						StoreDevtools,
						TanStackQueryDevtools,
					]}
				/>
				<Toaster />
				<Scripts />
			</body>
		</html>
	)
}
