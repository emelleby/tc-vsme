import { createFileRoute } from '@tanstack/react-router'
import { useAction } from 'convex/react'
import { useEffect, useState } from 'react'
import { api } from '../../../../convex/_generated/api'

export const Route = createFileRoute('/_appLayout/app/emissions')({
	component: EmissionsPage,
})

// Hardcoded orgId for now
const HARDCODED_ORG_ID = 'org_2tWO47gV8vEOLN1lrpV57N02Dh2'

type EmissionsData = {
	TotalCo2?: number
	[key: string]: string | number | boolean | null | undefined
}

type YearData = {
	year: number
	data: EmissionsData | null
	loading: boolean
	error: string | null
}

type AllEmissionsData = {
	[year: string]: EmissionsData
}

function EmissionsPage() {
	const getEmissions = useAction(api.emissions.getEmissionsByOrgId)
	const [yearData, setYearData] = useState<YearData[]>([
		{ year: 2022, data: null, loading: true, error: null },
		{ year: 2023, data: null, loading: true, error: null },
		{ year: 2024, data: null, loading: true, error: null },
	])

	useEffect(() => {
		// Fetch all emissions data in a single call (without year parameter)
		const fetchAllEmissions = async () => {
			try {
				const result = await getEmissions({
					orgId: HARDCODED_ORG_ID,
					// Omit year to get all emissions data
				})

				if (result.success && result.data) {
					const allEmissions = result.data as AllEmissionsData

					// Parse the emissions object and extract data for each year
					setYearData([
						{
							year: 2022,
							data: allEmissions['2022'] || null,
							loading: false,
							error: null,
						},
						{
							year: 2023,
							data: allEmissions['2023'] || null,
							loading: false,
							error: null,
						},
						{
							year: 2024,
							data: allEmissions['2024'] || null,
							loading: false,
							error: null,
						},
					])
				} else {
					// Handle error case
					setYearData((prev) =>
						prev.map((item) => ({
							...item,
							loading: false,
							error: result.error || 'Failed to fetch data',
						})),
					)
				}
			} catch (error) {
				// Handle exception
				setYearData((prev) =>
					prev.map((item) => ({
						...item,
						loading: false,
						error: error instanceof Error ? error.message : 'Unknown error',
					})),
				)
			}
		}

		fetchAllEmissions()
	}, [getEmissions])

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-2">
				<h1 className="text-3xl font-bold">Emissions Data</h1>
				<p className="text-muted-foreground">
					Viewing emissions data for organization: {HARDCODED_ORG_ID}
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				{yearData.map(({ year, data, loading, error }) => (
					<div
						key={year}
						className="rounded-lg border border-border bg-card p-6 shadow-sm"
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
								<p className="text-sm text-muted-foreground">
									No data available
								</p>
							</div>
						)}

						{!loading && !error && data && (
							<div className="space-y-3">
								<div className="flex flex-col gap-1">
									<span className="text-sm text-muted-foreground">
										Total CO₂
									</span>
									<span className="text-2xl font-bold">
										{data.TotalCo2 !== undefined
											? `${data.TotalCo2.toLocaleString()} kg`
											: 'N/A'}
									</span>
								</div>

								{/* Display other fields if available */}
								{Object.keys(data)
									.filter((key) => key !== 'TotalCo2')
									.slice(0, 5)
									.map((key) => (
										<div key={key} className="flex flex-col gap-1">
											<span className="text-xs text-muted-foreground">
												{key}
											</span>
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
				))}
			</div>
		</div>
	)
}
