import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from '../../../../../convex/_generated/api'

export const Route = createFileRoute('/_appLayout/app/settings/')({
	component: SettingsPage,
})

function SettingsPage() {
	const { authContext } = Route.useRouteContext()
	const { userId, orgId } = authContext

	// Fetch current user's data from Convex (uses JWT auth)
	const userData = useQuery(api.users.getMe)

	// Fetch organization data from Convex if orgId exists
	const orgData = useQuery(
		api.organizations.getByClerkOrgId,
		orgId ? { clerkOrgId: orgId } : 'skip',
	)

	if (userData === undefined || (orgId && orgData === undefined)) {
		return <div className="p-6">Loading...</div>
	}

	return (
		<div className="p-6 space-y-8">
			<div>
				<h1 className="text-3xl font-bold mb-2">Settings</h1>
				<p className="text-muted-foreground">
					View your user and organization information
				</p>
			</div>

			{/* User Information Section */}
			<div className="border border-border rounded-lg p-6">
				<h2 className="text-xl font-semibold mb-4">User Information</h2>
				{userData ? (
					<dl className="space-y-3">
						<div className="flex flex-col sm:flex-row sm:gap-4">
							<dt className="font-medium text-muted-foreground min-w-35">
								Email:
							</dt>
							<dd className="text-foreground">{userData.email}</dd>
						</div>
						{userData.firstName && (
							<div className="flex flex-col sm:flex-row sm:gap-4">
								<dt className="font-medium text-muted-foreground min-w-35">
									First Name:
								</dt>
								<dd className="text-foreground">{userData.firstName}</dd>
							</div>
						)}
						{userData.lastName && (
							<div className="flex flex-col sm:flex-row sm:gap-4">
								<dt className="font-medium text-muted-foreground min-w-35">
									Last Name:
								</dt>
								<dd className="text-foreground">{userData.lastName}</dd>
							</div>
						)}
						{userData.username && (
							<div className="flex flex-col sm:flex-row sm:gap-4">
								<dt className="font-medium text-muted-foreground min-w-35">
									Username:
								</dt>
								<dd className="text-foreground">{userData.username}</dd>
							</div>
						)}
						<div className="flex flex-col sm:flex-row sm:gap-4">
							<dt className="font-medium text-muted-foreground min-w-35">
								Clerk ID:
							</dt>
							<dd className="text-foreground font-mono text-sm">
								{userData.clerkId}
							</dd>
						</div>
						<div className="flex flex-col sm:flex-row sm:gap-4">
							<dt className="font-medium text-muted-foreground min-w-35">
								Organizations:
							</dt>
							<dd className="text-foreground">
								{userData.organizationIds.length > 0 ? (
									<ul className="list-disc list-inside">
										{userData.organizationIds.map((id) => (
											<li key={id} className="font-mono text-sm">
												{id}
											</li>
										))}
									</ul>
								) : (
									<span className="text-muted-foreground">None</span>
								)}
							</dd>
						</div>
					</dl>
				) : (
					<p className="text-muted-foreground">No user data found</p>
				)}
			</div>

			{/* Organization Information Section */}
			<div className="border border-border rounded-lg p-6">
				<h2 className="text-xl font-semibold mb-4">Organization Information</h2>
				{orgId ? (
					orgData ? (
						<dl className="space-y-3">
							<div className="flex flex-col sm:flex-row sm:gap-4">
								<dt className="font-medium text-muted-foreground min-w-35">
									Name:
								</dt>
								<dd className="text-foreground">{orgData.name}</dd>
							</div>
							<div className="flex flex-col sm:flex-row sm:gap-4">
								<dt className="font-medium text-muted-foreground min-w-35">
									Slug:
								</dt>
								<dd className="text-foreground">{orgData.slug}</dd>
							</div>
							<div className="flex flex-col sm:flex-row sm:gap-4">
								<dt className="font-medium text-muted-foreground min-w-35">
									Clerk Org ID:
								</dt>
								<dd className="text-foreground font-mono text-sm">
									{orgData.clerkOrgId}
								</dd>
							</div>
							<div className="flex flex-col sm:flex-row sm:gap-4">
								<dt className="font-medium text-muted-foreground min-w-35">
									Created:
								</dt>
								<dd className="text-foreground">
									{new Date(orgData._creationTime).toLocaleString()}
								</dd>
							</div>
						</dl>
					) : (
						<p className="text-muted-foreground">No organization data found</p>
					)
				) : (
					<p className="text-muted-foreground">
						No organization selected. Please select or create an organization.
					</p>
				)}
			</div>
		</div>
	)
}
