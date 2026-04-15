import {
	SignedIn,
	SignedOut,
	useAuth,
	useOrganization,
	useUser,
} from '@clerk/tanstack-react-start'
import { createFileRoute } from '@tanstack/react-router'
import { useConvexAuth, useQuery } from 'convex/react'
import Header from '@/components/Header'
import Home from '@/routes/-home'
import { api } from '../../convex/_generated/api'

export const Route = createFileRoute('/')({
	component: RouteComponent,
})

function AuthStatus() {
	const { user, isLoaded: userLoaded } = useUser()
	const { organization, isLoaded: orgLoaded } = useOrganization()
	const { isLoaded: authLoaded } = useAuth()
	const { isAuthenticated: isConvexAuthed } = useConvexAuth()

	const loaded = userLoaded && orgLoaded && authLoaded

	const clerkHasVsme = Boolean(user?.publicMetadata?.hasVsme)
	const clerkOrgHasVsme = Boolean(organization?.publicMetadata?.hasVsme)
	const clerkVsmeDb = Boolean(organization?.publicMetadata?.vsmeDb)

	const convexOrgFlags = useQuery(
		api.organizations.getPermissionFlags,
		isConvexAuthed && organization?.id
			? { clerkOrgId: organization.id }
			: 'skip',
	)

	const convexUserFlags = useQuery(
		api.users.getPermissionFlags,
		isConvexAuthed ? {} : 'skip',
	)

	const mismatch =
		loaded &&
		organization &&
		convexOrgFlags !== undefined &&
		(clerkOrgHasVsme !== convexOrgFlags.hasVsme ||
			clerkVsmeDb !== convexOrgFlags.exists)

	return (
		<div className="w-full bg-muted/80 border-b text-xs font-mono px-4 py-1.5 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-muted-foreground z-40">
			<span>
				<span className="font-semibold text-foreground">Auth:</span>{' '}
				{loaded ? (
					<>
						<SignedIn>
							<span className="text-green-600">Signed In</span>
							{' · '}
							{user?.fullName ??
								user?.primaryEmailAddress?.emailAddress ??
								'User'}
						</SignedIn>
						<SignedOut>
							<span className="text-yellow-600">Signed Out</span>
						</SignedOut>
					</>
				) : (
					<span className="animate-pulse">Loading...</span>
				)}
			</span>
			<SignedIn>
				<span>
					<span className="font-semibold text-foreground">Clerk:</span>{' '}
					{clerkHasVsme ? 'user✓' : 'user✗'}
					{' | '}
					{clerkOrgHasVsme ? 'org✓' : 'org✗'}
					{' | '}
					{clerkVsmeDb ? 'db✓' : 'db✗'}
				</span>
				{organization && (
					<span>
						<span className="font-semibold text-foreground">Convex:</span>{' '}
						{convexOrgFlags === undefined ? (
							<span className="animate-pulse">...</span>
						) : (
							<>
								{convexUserFlags?.hasVsme ? 'user✓' : 'user✗'}
								{' | '}
								{convexOrgFlags.hasVsme ? 'org✓' : 'org✗'}
								{' | '}
								{convexOrgFlags.exists ? 'db✓' : 'db✗'}
							</>
						)}
					</span>
				)}
				{mismatch && (
					<span className="text-red-500 font-bold">
						⚠ CLERK/CONVEX MISMATCH
					</span>
				)}
				<span>
					<span className="font-semibold text-foreground">Org:</span>{' '}
					{organization ? (
						<span className="text-foreground">{organization.name}</span>
					) : (
						<span className="text-yellow-600">None</span>
					)}
				</span>
				<span>
					<span className="font-semibold text-foreground">State:</span>{' '}
					{!clerkHasVsme && !clerkOrgHasVsme
						? 'Get Access'
						: (clerkOrgHasVsme || clerkHasVsme) && !clerkVsmeDb
							? 'Create Organization'
							: clerkOrgHasVsme && clerkVsmeDb
								? 'Full Access'
								: 'Unknown'}
				</span>
			</SignedIn>
		</div>
	)
}

function RouteComponent() {
	return (
		<div className="flex flex-col min-h-screen">
			<Header />
			<AuthStatus />
			<Home />
		</div>
	)
}