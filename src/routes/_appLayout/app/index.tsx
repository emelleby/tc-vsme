import { useOrganization, useUser } from '@clerk/react'
import {
	type HighchartsOptionsType,
	Chart as HighchartsReact,
} from '@highcharts/react'
import { useQuery as useTanstackQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { useAction, useConvexAuth, useQuery } from 'convex/react'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { yearStore } from '@/lib/year-store'
import { api } from '../../../../convex/_generated/api'

const HARDCODED_ORG_ID = 'org_2tWO47gV8vEOLN1lrpV57N02Dh2'
const USE_HARDCODED_ORG = false

export const Route = createFileRoute('/_appLayout/app/')({
	component: RouteComponent,
})

type EmissionsData = {
	TotalCo2?: number
	[key: string]: string | number | boolean | null | undefined
}

function RouteComponent() {
	const { user, isLoaded: isUserLoaded } = useUser()
	const { organization, isLoaded: isOrgLoaded } = useOrganization()
	const { isAuthenticated } = useConvexAuth()
	const selectedYear = useStore(yearStore, (s) => s.selectedYear)
	const { authContext } = Route.useRouteContext()
	const { orgId } = authContext

	const orgData = useQuery(
		api.organizations.getByClerkOrgId,
		isAuthenticated && organization?.id
			? { clerkOrgId: organization.id }
			: 'skip',
	)

	const getEmissions = useAction(api.emissions.getEmissionsByOrgId)
	const orgIdToUse = USE_HARDCODED_ORG
		? HARDCODED_ORG_ID
		: orgId || HARDCODED_ORG_ID

	const { data: allEmissions } = useTanstackQuery({
		queryKey: ['emissions', { orgId: orgIdToUse }],
		enabled: isAuthenticated,
		queryFn: async () => {
			const result = await getEmissions({
				orgIdToUse,
				testingMode: USE_HARDCODED_ORG,
			})
			if (!result.success)
				throw new Error(result.error || 'Failed to fetch data')
			return result.data as Record<string, EmissionsData>
		},
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	})

	const years = ['2023', '2024', '2025']
	const locationBasedData = years.map(
		(y) => (allEmissions?.[y]?.locationBased as number) ?? null,
	)

	const labelStyle = { color: 'var(--foreground)' }

	const chartOptions: HighchartsOptionsType = {
		chart: {
			type: 'column',
			backgroundColor: 'transparent',
		},
		title: { text: undefined },
		xAxis: {
			categories: years,
			labels: { style: labelStyle },
		},
		yAxis: {
			title: { text: 'tCO₂e', style: labelStyle },
			labels: { style: labelStyle },
			min: 0,
		},
		series: [
			{
				type: 'column',
				name: 'Location based scope 2',
				data: locationBasedData,
			},
		],
		credits: { enabled: false },
		legend: { enabled: false },
	}

	const latest = allEmissions?.[String(selectedYear)]

	const stats = [
		{ label: 'Total CO₂', key: 'TotalCo2' },
		{ label: 'Scope 1', key: 'Scope1' },
		{ label: 'Scope 2', key: 'Scope2' },
		{ label: 'Scope 3', key: 'Scope3' },
	] as const

	if (!isUserLoaded || !isOrgLoaded) return <div>Loading...</div>

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col gap-4 overflow-x-auto">
				<div className="text-3xl">Hello App!</div>

				<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
					{stats.map(({ label, key }) => {
						const value = latest?.[key] as number | undefined
						const miniData = years.map(
							(y) => (allEmissions?.[y]?.[key] as number) ?? null,
						)
						const miniOptions: HighchartsOptionsType = {
							chart: {
								type: 'column',
								backgroundColor: 'transparent',
								height: 100,
								margin: [4, 0, 28, 0],
								spacing: [0, 0, 0, 0],
							},
							title: { text: undefined },
							xAxis: {
								categories: years,
								labels: { style: { ...labelStyle, fontSize: '10px' } },
							},
							yAxis: {
								title: { text: undefined },
								labels: { enabled: false },
								gridLineWidth: 0,
							},
							series: [{ type: 'column', data: miniData, name: label }],
							credits: { enabled: false },
							legend: { enabled: false },
							tooltip: { pointFormat: '<b>{point.y}</b> tCO₂e' },
						}
						return (
							<Card key={key}>
								<CardHeader className="pb-1">
									<CardDescription>{label}</CardDescription>
								</CardHeader>
								<CardContent className="pb-2">
									<p className="text-2xl font-semibold">
										{value !== undefined ? value.toLocaleString() : '—'}
									</p>
									<p className="text-xs text-muted-foreground">tCO₂e</p>
									<HighchartsReact options={miniOptions} />
								</CardContent>
							</Card>
						)
					})}
				</div>

				<Card className="max-w-2xl">
					<CardHeader>
						<CardTitle>Location based scope 2</CardTitle>
					</CardHeader>
					<CardContent>
						<HighchartsReact options={chartOptions} />
					</CardContent>
				</Card>

				{/* {organization && (
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
				)} */}

				{/* <pre className="p-4 border border-border rounded text-xs bg-muted/50 overflow-auto max-h-[400px]">
					{JSON.stringify(user, null, 2)}
				</pre> */}
			</div>
		</div>
	)
}
