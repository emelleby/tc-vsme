import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { useAction } from 'convex/react'
import { yearStore } from '@/lib/year-store'
import { api } from '../../../../convex/_generated/api'

export const Route = createFileRoute('/_appLayout/app/emissions')({
	component: EmissionsPage,
})

// Hardcoded orgId for now
const HARDCODED_ORG_ID = 'org_2tWO47gV8vEOLN1lrpV57N02Dh2'

// Toggle between hardcoded and authContext orgId for testing
const USE_HARDCODED_ORG = false // Set to true to use hardcoded orgId instead of authContext

type EmissionsData = {
	TotalCo2?: number
	[key: string]: string | number | boolean | null | undefined
}

type YearData = {
	year: number
	data: EmissionsData | null
	loading: boolean
	error: string | null
	isSelected?: boolean
}

/**
 * Emissions Page Component
 *
 * Uses TanStack Query for intelligent caching, automatic retries, and
 * stale-while-revalidate pattern. Data is cached for 5 minutes and
 * retained in memory for 10 minutes.
 *
 * @see https://tanstack.com/query/latest/docs/react/overview
 */
function EmissionsPage() {
	const getEmissions = useAction(api.emissions.getEmissionsByOrgId)
	const selectedYear = useStore(yearStore, (state) => state.selectedYear)

	const { authContext } = Route.useRouteContext()
	const { orgId } = authContext
	const orgIdToUse = USE_HARDCODED_ORG
		? HARDCODED_ORG_ID
		: orgId || HARDCODED_ORG_ID
	console.log('orgIdToUse', orgIdToUse)

	// TanStack Query with intelligent caching
	const {
		data: allEmissions,
		isLoading,
		error,
		refetch,
		isRefetching,
	} = useQuery({
		queryKey: ['emissions', { orgId: orgIdToUse }],
		queryFn: async () => {
			const result = await getEmissions({
				orgIdToUse: orgIdToUse,
				testingMode: USE_HARDCODED_ORG,
			})
			if (!result.success) {
				throw new Error(result.error || 'Failed to fetch data')
			}
			console.log('result.data', result.data)
			return result.data as Record<string, EmissionsData>
		},
		staleTime: 5 * 60 * 1000, // Data fresh for 5 minutes
		gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
		retry: 3,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
	})

	// Transform data for display
	const yearData: YearData[] = [
		{
			year: 2022,
			data: allEmissions?.['2022'] || null,
			loading: isLoading,
			error: error?.message || null,
			isSelected: selectedYear === 2022,
		},
		{
			year: 2023,
			data: allEmissions?.['2023'] || null,
			loading: isLoading,
			error: error?.message || null,
			isSelected: selectedYear === 2023,
		},
		{
			year: 2024,
			data: allEmissions?.['2024'] || null,
			loading: isLoading,
			error: error?.message || null,
			isSelected: selectedYear === 2024,
		},
	]

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<div className="flex flex-col gap-2">
					<h1 className="text-3xl font-bold">Emissions Data</h1>
					<p className="text-muted-foreground">
						Viewing emissions data for organization: {orgIdToUse}
					</p>
				</div>
				<button
					type="button"
					onClick={() => refetch()}
					disabled={isRefetching}
					className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					{isRefetching ? 'Refreshing...' : 'Refresh'}
				</button>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				{yearData.map(({ year, data, loading, error, isSelected }) => (
					<EmissionsCard
						key={year}
						year={year}
						data={data}
						loading={loading}
						error={error}
						isSelected={isSelected}
					/>
				))}
			</div>
		</div>
	)
}

/**
 * Extracted card component for displaying emissions data for a single year.
 * Handles loading, error, and empty states with appropriate UI feedback.
 */
function EmissionsCard({ year, data, loading, error, isSelected }: YearData) {
	return (
		<div
			className={`rounded-lg border p-6 shadow-sm transition-colors ${
				isSelected ? 'border-primary bg-primary/10' : 'border-border bg-card'
			}`}
		>
			<h2 className="text-xl font-semibold mb-4">{year} Emissions</h2>

			{loading && (
				<div className="flex items-center justify-center py-8">
					<div className="text-muted-foreground">Loading...</div>
				</div>
			)}

			{error && (
				<div className="rounded-md bg-destructive/10 p-4 text-destructive">
					<p className="text-sm font-medium">Error</p>
					<p className="text-sm">{error}</p>
				</div>
			)}

			{!loading && !error && !data && (
				<div className="rounded-md bg-muted p-4">
					<p className="text-sm text-muted-foreground">No data available</p>
				</div>
			)}

			{!loading && !error && data && (
				<div className="space-y-3">
					<div className="flex flex-col gap-1">
						<span className="text-sm text-muted-foreground">Total CO₂</span>
						<span className="text-2xl font-bold">
							{data.TotalCo2 !== undefined
								? `${data.TotalCo2.toLocaleString()} kg`
								: 'N/A'}
						</span>
					</div>

					{Object.keys(data)
						.filter((key) => key !== 'TotalCo2')
						.slice(0, 7)
						.map((key) => (
							<div key={key} className="flex flex-col gap-1">
								<span className="text-xs text-muted-foreground">{key}</span>
								<span className="text-sm font-medium">
									{typeof data[key] === 'number'
										? data[key].toLocaleString()
										: String(data[key])}
								</span>
							</div>
						))}
				</div>
			)}
		</div>
	)
}
