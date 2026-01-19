/**
 * Organization Setup Page
 *
 * This page allows users with VSME permission to create or select an organization.
 * It's accessible to users who have hasVsme but haven't completed organization setup.
 *
 * Route Protection:
 * - Requires authentication
 * - Requires hasVsme permission
 * - Redirects users with full access to /app
 *
 * Story 3 Scope: Basic page with route protection and placeholder UI
 * Story 5 Integration: Will add Convex mutations for org/user record creation
 */

import { OrganizationSwitcher, useUser } from '@clerk/clerk-react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import Header from '@/components/Header'
import { getAuthContext } from '@/lib/auth'

/**
 * Route configuration with permission checks
 */
export const Route = createFileRoute('/create-organization')({
	component: CreateOrganizationPage,
	beforeLoad: async () => {
		// Fetch full authentication context
		const authContext = await getAuthContext()

		// Check 1: User must be authenticated
		if (!authContext) {
			throw redirect({ to: '/sign-in' })
		}

		// Check 2: User must have hasVsme permission
		if (!authContext.hasVsme) {
			throw redirect({ to: '/' })
		}

		// Check 3: Redirect if user already has full access
		if (authContext.canAccessDashboard) {
			throw redirect({ to: '/app' })
		}

		// Pass auth context to component
		return { authContext }
	},
})

/**
 * Organization Setup Page Component
 *
 * Story 3: Displays Clerk's OrganizationSwitcher for org creation/selection
 * Story 5: Will add webhook/mutation integration for Convex record creation
 */
function CreateOrganizationPage() {
	const { authContext } = Route.useRouteContext()
	const { user } = useUser()

	return (
		<>
			<Header />
			<div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-muted/20">
				<div className="w-full max-w-md p-8 space-y-6">
					{/* Header */}
					<div className="text-center space-y-2">
						<h1 className="text-3xl font-bold tracking-tight">
							Set Up Your Organization
						</h1>
						<p className="text-muted-foreground">
							Create or select an organization to access the VSME dashboard
						</p>
					</div>

					{/* Organization Switcher */}
					<div className="flex justify-center">
						<OrganizationSwitcher
							hidePersonal
							afterCreateOrganizationUrl="/app"
							afterSelectOrganizationUrl="/app"
							appearance={{
								baseTheme: undefined, // Let Clerk auto-detect theme
								// elements: {
								// 	rootBox: 'mx-auto',
								// 	card: 'shadow-xl border border-border bg-card',
								// 	cardBox: 'shadow-none',
								// 	organizationSwitcherTrigger:
								// 		'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
								// 	organizationPreview: 'text-foreground',
								// 	organizationSwitcherTriggerIcon: 'text-muted-foreground',
								// 	formButtonPrimary:
								// 		'bg-primary text-primary-foreground hover:bg-primary/90',
								// 	formFieldInput: 'bg-background border-input text-foreground',
								// 	identityPreviewText: 'text-foreground',
								// 	identityPreviewEditButton: 'text-muted-foreground',
								// },
							}}
						/>
					</div>

					{/* Info Card */}
					<div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border">
						<h3 className="font-semibold mb-2">What happens next?</h3>
						<ul className="text-sm text-muted-foreground space-y-1">
							<li>• Create a new organization or select an existing one</li>
							<li>• Your organization will be set up in the system</li>
							<li>• You'll be redirected to the dashboard</li>
						</ul>
					</div>

					{/* Debug Info (Development Only) */}
					{import.meta.env.DEV && (
						<details className="mt-4 p-4 rounded-lg bg-muted/30 border border-border text-xs">
							<summary className="cursor-pointer font-semibold">
								Debug: Auth Context
							</summary>
							<pre className="mt-2 overflow-auto">
								{JSON.stringify(authContext, null, 2)}
							</pre>
							<pre className="mt-2 overflow-auto">
								{JSON.stringify(user, null, 2)}
							</pre>
						</details>
					)}

					{/* Story 5 Integration Point */}
					{/* TODO: Add Convex mutation calls on org creation/selection */}
					{/* See docs/story3-to-story5-handover.md for integration details */}
				</div>
			</div>
		</>
	)
}
