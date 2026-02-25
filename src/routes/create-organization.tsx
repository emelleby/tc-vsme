import { useOrganizationList, useUser } from '@clerk/clerk-react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { BrregSearch, type BrregUnit } from '@/components/BrregSearch'
import Header from '@/components/Header'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getAuthContext, invalidateAuthContext } from '@/lib/auth'
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
		if (authContext.hasVsme) {
			return { authContext }
		}
		// Check 2: User must have hasVsme permission
		// if (authContext.orgHasVsme && !authContext.vsmeDb) {
		if (authContext.needsOrgSetup) {
			return { authContext }
		}

		// Check 2: User must have hasVsme permission
		if (!authContext.hasVsme && !authContext.orgHasVsme) {
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
 * Custom flow to create organization via Brønnøysund Register Center lookup.
 */
function CreateOrganizationPage() {
	const { authContext } = Route.useRouteContext()
	const {
		createOrganization,
		setActive,
		isLoaded: isOrgListLoaded,
	} = useOrganizationList()
	const { user, isLoaded: isUserLoaded } = useUser()
	const navigate = useNavigate()

	const [selectedOrg, setSelectedOrg] = useState<BrregUnit | null>(null)
	const [slug, setSlug] = useState('')
	const [isCreating, setIsCreating] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const handleSelect = (org: BrregUnit) => {
		setSelectedOrg(org)
		// Suggest slug: lowercase, replace spaces/special chars with hyphens
		const suggestedSlug = org.navn
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric chars (except spaces/hyphens)
			.trim()
			.replace(/\s+/g, '-')
		setSlug(suggestedSlug)
		setError(null)
	}

	const handleCreate = async () => {
		if (!selectedOrg || !createOrganization || !setActive) return

		setIsCreating(true)
		setError(null)

		try {
			// 1. Create Organization in Clerk
			const clerkOrg = await createOrganization({
				name: selectedOrg.navn,
				slug: slug,
			})

			// 1.5. Set as active organization (Explicitly)
			await setActive({ organization: clerkOrg.id })

			// 2. Setup Organization in Convex (store extra metadata)
			const result = await setupOrganization({
				data: {
					orgId: clerkOrg.id,
					orgName: clerkOrg.name,
					orgSlug: clerkOrg.slug || slug,
					userEmail: user?.emailAddresses[0]?.emailAddress || '',
					userFirstName: user?.firstName || undefined,
					userLastName: user?.lastName || undefined,
					userName: user?.username || undefined,
					orgNumber: selectedOrg.organisasjonsnummer,
					address: selectedOrg.forretningsadresse
						? {
								street: selectedOrg.forretningsadresse.adresse,
								postalCode: selectedOrg.forretningsadresse.postnummer,
								city: selectedOrg.forretningsadresse.poststed,
								country: selectedOrg.forretningsadresse.land,
								countryCode: selectedOrg.forretningsadresse.landkode,
							}
						: undefined,
					orgForm: selectedOrg.organisasjonsform?.kode,
					website: selectedOrg.hjemmeside,
					naceCode: selectedOrg.naeringskode1?.kode,
					industry: selectedOrg.naeringskode1?.beskrivelse,
					numberEmployees: selectedOrg.antallAnsatte,
					businessModel: selectedOrg.aktivitet?.join(' '),
				},
			})

			if (result.success) {
				// Invalidate auth context cache to ensure fresh data on next navigation
				await invalidateAuthContext()

				// Success! Redirect to dashboard
				navigate({ to: '/app' })
			} else {
				setError(result.error || 'Failed to set up organization in database')
			}
		} catch (err: unknown) {
			console.error('Creation error:', err)
			let msg = 'An unexpected error occurred'
			if (
				typeof err === 'object' &&
				err !== null &&
				'errors' in err &&
				Array.isArray((err as { errors: { message: string }[] }).errors)
			) {
				msg =
					(err as { errors: { message: string }[] }).errors[0]?.message || msg
			} else if (err instanceof Error) {
				msg = err.message
			}
			setError(msg)
		} finally {
			setIsCreating(false)
		}
	}

	if (!isOrgListLoaded || !isUserLoaded) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		)
	}

	return (
		<>
			<Header />
			<div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-muted/20 p-4">
				<div className="w-full max-w-lg space-y-6">
					<div className="text-center space-y-2">
						<h1 className="text-3xl font-bold tracking-tight">
							Set Up Your Organization
						</h1>
						<p className="text-muted-foreground">
							Search for your organization in the Brønnøysund Register Center
						</p>
					</div>

					<Card>
						<CardHeader>
							<CardTitle>Find Organization</CardTitle>
							<CardDescription>
								Search by name or organization number (9 digits).
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<BrregSearch onSelect={handleSelect} />

							{selectedOrg && (
								<div className="mt-4 pt-4 border-t space-y-4 animate-in fade-in slide-in-from-top-2">
									<div className="grid gap-2">
										<Label>Organization Name</Label>
										<Input value={selectedOrg.navn} disabled />
									</div>

									<div className="grid gap-2">
										<Label>Organization Slug (URL)</Label>
										<Input
											value={slug}
											onChange={(e) => setSlug(e.target.value)}
											placeholder="organization-slug"
										/>
										<p className="text-xs text-muted-foreground">
											This will be used in your organization's URL.
										</p>
									</div>

									<div className="grid grid-cols-2 gap-4">
										<div className="grid gap-2">
											<Label>Org. Number</Label>
											<Input value={selectedOrg.organisasjonsnummer} disabled />
										</div>
										<div className="grid gap-2">
											<Label>Type</Label>
											<Input
												value={selectedOrg.organisasjonsform?.beskrivelse || ''}
												disabled
											/>
										</div>
									</div>
								</div>
							)}

							{error && (
								<div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
									⚠️ {error}
								</div>
							)}
						</CardContent>
						<CardFooter className="flex justify-end">
							<Button
								onClick={handleCreate}
								disabled={!selectedOrg || !slug || isCreating}
								className="w-full sm:w-auto"
							>
								{isCreating && (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								)}
								{isCreating
									? 'Creating Organization...'
									: 'Create Organization'}
							</Button>
						</CardFooter>
					</Card>

					{import.meta.env.DEV && (
						<details className="mt-4 p-4 rounded-lg bg-muted/30 border border-border text-xs">
							<summary className="cursor-pointer font-semibold">
								Debug: Auth Context
							</summary>
							<pre className="mt-2 overflow-auto">
								{JSON.stringify(authContext, null, 2)}
							</pre>
						</details>
					)}
				</div>
			</div>
		</>
	)
}
