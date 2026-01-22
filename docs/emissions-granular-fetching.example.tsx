/**
 * GRANULAR FETCHING EXAMPLE
 *
 * This file demonstrates an alternative approach where each year's data
 * is fetched independently. This is useful when:
 * - Users typically view 1-2 years at a time
 * - Data per year is large (> 50KB)
 * - Implementing lazy loading or virtual scrolling
 *
 * Trade-offs:
 * - More network requests (N years = N requests)
 * - Better memory efficiency (only viewed years loaded)
 * - Independent loading states per card
 * - Partial failure handling (one year fails doesn't break others)
 *
 * IMPORTANT: React Hooks Rules
 * Hooks must be called unconditionally at the top level of the component.
 * That's why we don't wrap useQuery in a custom function here.
 */

import { useQuery } from '@tanstack/react-query'
import { useAction } from 'convex/react'
import { api } from '../convex/_generated/api'

const HARDCODED_ORG_ID = 'org_2tWO47gV8vEOLN1lrpV57N02Dh2'

type EmissionsData = {
	TotalCo2?: number
	[key: string]: string | number | boolean | null | undefined
}

export function EmissionsPageGranular() {
	const getEmissions = useAction(api.emissions.getEmissionsByOrgId)

	// Each year fetched independently in parallel
	// Hooks must be called unconditionally at the top level
	const query2022 = useQuery({
		queryKey: ['emissions', HARDCODED_ORG_ID, 2022],
		queryFn: async () => {
			const result = await getEmissions({ orgId: HARDCODED_ORG_ID, year: 2022 })
			if (!result.success) {
				throw new Error(result.error || 'Failed to fetch data')
			}
			return result.data as EmissionsData
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		retry: 3,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
	})

	const query2023 = useQuery({
		queryKey: ['emissions', HARDCODED_ORG_ID, 2023],
		queryFn: async () => {
			const result = await getEmissions({ orgId: HARDCODED_ORG_ID, year: 2023 })
			if (!result.success) {
				throw new Error(result.error || 'Failed to fetch data')
			}
			return result.data as EmissionsData
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		retry: 3,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
	})

	const query2024 = useQuery({
		queryKey: ['emissions', HARDCODED_ORG_ID, 2024],
		queryFn: async () => {
			const result = await getEmissions({ orgId: HARDCODED_ORG_ID, year: 2024 })
			if (!result.success) {
				throw new Error(result.error || 'Failed to fetch data')
			}
			return result.data as EmissionsData
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		retry: 3,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
	})

	const yearData = [
		{ year: 2022, query: query2022 },
		{ year: 2023, query: query2023 },
		{ year: 2024, query: query2024 },
	]

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-2">
				<h1 className="text-3xl font-bold">Emissions Data (Granular)</h1>
				<p className="text-muted-foreground">
					Viewing emissions data for organization: {HARDCODED_ORG_ID}
				</p>
				<p className="text-xs text-muted-foreground">
					Each year fetched independently with separate loading states
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				{yearData.map(({ year, query }) => (
					<EmissionsCard
						key={year}
						year={year}
						data={query.data}
						loading={query.isLoading}
						error={query.error?.message || null}
						isRefetching={query.isRefetching}
						onRefetch={() => query.refetch()}
					/>
				))}
			</div>
		</div>
	)
}

function EmissionsCard({
	year,
	data,
	loading,
	error,
	isRefetching,
	onRefetch,
}: {
	year: number
	data: EmissionsData | null | undefined
	loading: boolean
	error: string | null
	isRefetching: boolean
	onRefetch: () => void
}) {
	return (
		<div className="rounded-lg border border-border bg-card p-6 shadow-sm">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-xl font-semibold">{year} Emissions</h2>
				{!loading && !error && (
					<button
						type="button"
						onClick={onRefetch}
						disabled={isRefetching}
						className="text-xs px-2 py-1 bg-muted hover:bg-muted/80 rounded disabled:opacity-50"
					>
						{isRefetching ? '...' : '↻'}
					</button>
				)}
			</div>

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
						.slice(0, 5)
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
