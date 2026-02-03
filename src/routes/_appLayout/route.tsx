// This is the layout file of the app

import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { AppSidebar } from '@/components/app-sidebar'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from '@/components/ui/sidebar'
import { getAuthContext } from '@/lib/auth'

/**
 * Protected app layout route with VSME permission checks.
 *
 * This route implements Story 2 of the authentication plan:
 * - Fetches full auth context with user/org metadata
 * - Checks VSME permission flags (hasVsme, orgHasVsme, vsmeDb)
 * - Redirects users based on their permission level
 * - Passes auth context to child routes
 *
 * Routing Logic:
 * 1. Not authenticated → redirect to /sign-in
 * 2. No VSME access (no hasVsme AND no orgHasVsme) → redirect to /
 * 3. Needs org setup (hasVsme but no org or no vsmeDb) → redirect to /create-organization
 * 4. Full access (orgHasVsme + vsmeDb) → allow dashboard access
 */
export const Route = createFileRoute('/_appLayout')({
	component: RouteComponent,
	beforeLoad: async () => {
		// Fetch full authentication context with metadata
		const authContext = await getAuthContext()

		const hasVsme = authContext?.hasVsme
		const orgHasVsme = authContext?.orgHasVsme
		const needsOrgSetup = authContext?.needsOrgSetup
		const vsmeDb = authContext?.vsmeDb

		// Check 1: User must be authenticated
		if (!authContext) {
			throw redirect({ to: '/sign-in' })
		}

		// Check 2: User must have VSME access (either personal or org-level)
		if (!authContext.hasVsme && !authContext.orgHasVsme) {
			throw redirect({ to: '/' })
		}

		// Check 3: User must complete organization setup if needed
		if (authContext.needsOrgSetup) {
			throw redirect({ to: '/create-organization' })
		}

		// Pass auth context to child routes
		return { authContext }
	},
})

function RouteComponent() {
	// Auth context is available via Route.useRouteContext() for child routes
	const { authContext } = Route.useRouteContext()
	const needsOrgSetup = authContext?.needsOrgSetup
	const vsmeDb = authContext?.vsmeDb
	const hasVsme = authContext?.hasVsme
	const orgHasVsme = authContext?.orgHasVsme
	const canAccessDashboard = authContext?.canAccessDashboard
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
					<div className="flex items-center gap-2 px-4">
						<SidebarTrigger className="-ml-1" />
						<Separator orientation="vertical" className="mr-2 h-4" />
						<Breadcrumb>
							<BreadcrumbList>
								<BreadcrumbItem>
									<BreadcrumbPage>
										{canAccessDashboard
											? 'Can access dashboard'
											: 'Cannot access dashboard'}
									</BreadcrumbPage>
								</BreadcrumbItem>
								<BreadcrumbSeparator className="hidden md:block" />
								<BreadcrumbItem>
									<BreadcrumbPage>
										{needsOrgSetup
											? `Org setup = ${needsOrgSetup}`
											: `Org setup = ${needsOrgSetup}`}
									</BreadcrumbPage>
								</BreadcrumbItem>
								<BreadcrumbSeparator className="hidden md:block" />
								<BreadcrumbPage>
									{vsmeDb ? 'Has VSME DB' : 'Needs VSME DB'}
								</BreadcrumbPage>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
					<div className="flex items-center gap-2 px-4">
						<ThemeSwitcher />
					</div>
				</header>
				<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
					<Outlet />
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
