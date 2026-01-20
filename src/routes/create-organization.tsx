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
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import { getAuthContext } from '@/lib/auth'
import { setupOrganization } from '@/lib/convex/setup-organization'

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
	const navigate = useNavigate()
	const [isSettingUp, setIsSettingUp] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// Listen for organization changes
	useEffect(() => {
		const setupOrgInConvex = async () => {
			// Only proceed if:
			// 1. User has selected an org
			// 2. Org doesn't have vsmeDb flag yet
			// 3. Not already setting up
			if (!authContext.orgId || authContext.vsmeDb || isSettingUp) {
				return
			}

			setIsSettingUp(true)
			setError(null)

			try {
				const result = await setupOrganization({
					data: {
						orgId: authContext.orgId,
					},
				})

				if (result.success) {
					// Success! Redirect to dashboard
					// The _appLayout route will now pass because vsmeDb is true
					navigate({ to: '/app' })
				} else {
					setError(result.error || 'Failed to set up organization')
				}
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : 'An unexpected error occurred'
				setError(errorMessage)
			} finally {
				setIsSettingUp(false)
			}
		}

		setupOrgInConvex()
	}, [authContext.orgId, authContext.vsmeDb, navigate, isSettingUp])

	// Show loading state while setting up
	if (isSettingUp) {
		return (
			<>
				<Header />
				<div className="min-h-screen flex items-center justify-center">
					<div className="text-center space-y-4">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
						<p className="text-muted-foreground">
							Setting up your organization...
						</p>
					</div>
				</div>
			</>
		)
	}

	// Show error if setup failed
	if (error) {
		return (
			<>
				<Header />
				<div className="min-h-screen flex items-center justify-center">
					<div className="max-w-md p-8 space-y-4 text-center">
						<div className="text-destructive text-4xl">⚠️</div>
						<h2 className="text-2xl font-bold">Setup Failed</h2>
						<p className="text-muted-foreground">{error}</p>
						<button
							type="button"
							onClick={() => setError(null)}
							className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
						>
							Try Again
						</button>
					</div>
				</div>
			</>
		)
	}

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
				</div>
			</div>
		</>
	)
}
