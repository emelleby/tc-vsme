import { useOrganization, useUser } from '@clerk/clerk-react'
import { createFileRoute } from '@tanstack/react-router'
import { useConvexAuth, useQuery } from 'convex/react'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { api } from '../../../../convex/_generated/api'

export const Route = createFileRoute('/_appLayout/app/')({
	component: RouteComponent,
})

function RouteComponent() {
	const { user, isLoaded: isUserLoaded } = useUser()
	const { organization, isLoaded: isOrgLoaded } = useOrganization()
	const { isAuthenticated } = useConvexAuth()

	const orgData = useQuery(
		api.organizations.getByClerkOrgId,
		isAuthenticated && organization?.id
			? { clerkOrgId: organization.id }
			: 'skip',
	)

	if (!isUserLoaded || !isOrgLoaded) return <div>Loading...</div>

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col gap-4 overflow-x-auto">
				<div className="text-3xl">Hello App!</div>

				{organization && (
					<Card className="max-w-2xl">
						<CardHeader>
							<CardTitle>{orgData?.name || organization.name}</CardTitle>
							<CardDescription>Current Organization</CardDescription>
						</CardHeader>
						<CardContent className="space-y-2 text-sm">
							<p className="text-muted-foreground">ID: {organization.id}</p>
							{orgData?.name && (
								<p className="text-muted-foreground">Name: {orgData.name}</p>
							)}
							{orgData?.slug && (
								<p className="text-muted-foreground">Slug: {orgData.slug}</p>
							)}
							{orgData?.orgNumber && (
								<p className="text-muted-foreground">
									Org. Number: {orgData.orgNumber}
								</p>
							)}
							{orgData?.website && (
								<p className="text-muted-foreground">
									Website: {orgData.website}
								</p>
							)}
						</CardContent>
					</Card>
				)}

				<pre className="p-4 border border-border rounded text-xs bg-muted/50 overflow-auto max-h-[400px]">
					{JSON.stringify(user, null, 2)}
				</pre>
			</div>
		</div>
	)
}
