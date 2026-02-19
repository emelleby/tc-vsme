import { createFileRoute } from '@tanstack/react-router'
import { useConvexAuth, useQuery } from 'convex/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { api } from '../../../../../convex/_generated/api'

export const Route = createFileRoute('/_appLayout/app/targets/')({
	component: TargetsPage,
})

function TargetsPage() {
	const { authContext } = Route.useRouteContext()
	const { orgId } = authContext
	const { isAuthenticated } = useConvexAuth()

	// Fetch organization data to get company name
	const orgData = useQuery(
		api.organizations.getByClerkOrgId,
		isAuthenticated && orgId ? { clerkOrgId: orgId } : 'skip',
	)

	const companyName = orgData?.name || 'Your Company'

	if (orgId && orgData === undefined) {
		return <div className="p-6">Loading...</div>
	}

	return (
		<div className="p-6 space-y-8 max-w-4xl mx-auto">
			<div>
				<h1 className="text-3xl font-bold mb-2">
					Climate emissions targets for {companyName}
				</h1>
				<p className="text-muted-foreground">
					Page for setting climate targets
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Emissions Targets</CardTitle>
				</CardHeader>
				<CardContent>
					<form className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-2">
								<Label htmlFor="base-year">Base year</Label>
								<Input id="base-year" type="number" placeholder="e.g., 2020" />
							</div>

							<div className="space-y-2">
								<Label htmlFor="base-year-emissions">Base year emissions</Label>
								<Input
									id="base-year-emissions"
									type="number"
									placeholder="e.g., 1000"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="target-year">Target year</Label>
								<Input
									id="target-year"
									type="number"
									placeholder="e.g., 2030"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="target-reduction">Target reduction</Label>
								<Input
									id="target-reduction"
									type="number"
									placeholder="e.g., 50"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="long-term-target-year">
									Long term target year
								</Label>
								<Input
									id="long-term-target-year"
									type="number"
									placeholder="e.g., 2050"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="long-term-target-reduction">
									Long term target reduction
								</Label>
								<InputGroup>
									<InputGroupInput
										id="long-term-target-reduction"
										type="number"
										placeholder="e.g., 90"
									/>
									<InputGroupAddon
										align="inline-end"
										className="bg-secondary/10 pl-2 pr-2 py-2 rounded-r-md"
									>
										%
									</InputGroupAddon>
								</InputGroup>
							</div>
						</div>

						<div className="flex justify-end">
							<Button type="submit">Save targets</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
