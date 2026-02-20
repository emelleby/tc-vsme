import { useStore } from '@tanstack/react-form'
import { createFileRoute } from '@tanstack/react-router'
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from '@tanstack/react-table'
import { useMutation, useQuery } from 'convex/react'
import { useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { EmissionsChart } from '@/components/emissions-chart'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppForm } from '@/hooks/tanstack-form'
import { useOrgGuard } from '@/hooks/use-org-guard'
import { api } from '../../../../../convex/_generated/api'

// Schema for the targets form - required fields for submission
const targetsFormSchema = z.object({
	baseYear: z
		.number('Base year is required')
		.min(2015, 'Base year must be at least 2015')
		.max(2024, 'Base year must be at most 2024'),
	baseYearEmissions: z
		.number('Base year emissions is required')
		.min(0, 'Base year emissions must be at least 0'),
	targetYear: z
		.number('Target year is required')
		.min(2025, 'Target year must be at least 2025'),
	targetReduction: z
		.number('Target reduction is required')
		.min(0, 'Target reduction must be at least 0%')
		.max(100, 'Target reduction cannot exceed 100%'),
	longTermTargetYear: z.number().optional(),
	longTermTargetReduction: z.number().min(0).max(100).optional(),
})

type TargetsFormValues = z.infer<typeof targetsFormSchema>

// Type for base year emissions data from Convex
interface BaseYearEmissionsData {
	scope1Emissions: number | null
	scope2EmissionsMarketBased: number | null
	totalScope3Emissions: number | null
	category1: number | null
	category2: number | null
	category3: number | null
	category4: number | null
	category5: number | null
	category6: number | null
	category7: number | null
	category8: number | null
	category9: number | null
	category10: number | null
	category11: number | null
	category12: number | null
	category13: number | null
	category14: number | null
	category15: number | null
	energyEmissionsStatus: string | null
	scope3EmissionsStatus: string | null
}

// Helper to calculate total emissions (treating nulls as zero)
function calculateTotalEmissions(data: BaseYearEmissionsData | null): number {
	if (!data) return 0
	const scope1 = data.scope1Emissions ?? 0
	const scope2 = data.scope2EmissionsMarketBased ?? 0
	const scope3 = data.totalScope3Emissions ?? 0
	return scope1 + scope2 + scope3
}

export const Route = createFileRoute('/_appLayout/app/targets/')({
	component: TargetsPage,
})

// --- Table Logic & Components ---

interface EmissionRow {
	year: number
	scope1: number
	scope2: number
	scope3: number
	total: number
	isBaseYear?: boolean
	isTargetYear?: boolean
	isLongTermTargetYear?: boolean
}

function calculateCompoundReduction(
	startValue: number,
	startYear: number,
	endYear: number,
	reductionPercentage: number,
): number {
	if (startYear >= endYear) return 0 // Should not happen given constraints
	const targetValue = startValue * (1 - reductionPercentage / 100)
	// CAGR formula: (End / Start)^(1 / n) - 1
	// Here we want the factor x such that Start * x^n = Target
	// x = (Target / Start)^(1 / n)
	if (startValue === 0) return 0

	const n = endYear - startYear
	const rate = Math.pow(targetValue / startValue, 1 / n)
	return rate
}

function generateEmissionRows(
	baseYear: number,
	targetYear: number,
	targetReduction: number,
	longTermTargetYear: number | undefined,
	longTermTargetReduction: number | undefined,
	baseEmissions: BaseYearEmissionsData,
): EmissionRow[] {
	const rows: EmissionRow[] = []
	const startYear = baseYear
	// If long term target is present and valid (after target year), go up to that
	// otherwise just go to target year
	const endYear =
		longTermTargetYear && longTermTargetYear > targetYear
			? longTermTargetYear
			: targetYear

	// Initial values
	let currentScope1 = baseEmissions.scope1Emissions ?? 0
	let currentScope2 = baseEmissions.scope2EmissionsMarketBased ?? 0
	let currentScope3 = baseEmissions.totalScope3Emissions ?? 0

	// 1. Calculate rate for Base -> Target
	const rate1Scope1 = calculateCompoundReduction(
		baseEmissions.scope1Emissions ?? 0,
		baseYear,
		targetYear,
		targetReduction,
	)
	const rate1Scope2 = calculateCompoundReduction(
		baseEmissions.scope2EmissionsMarketBased ?? 0,
		baseYear,
		targetYear,
		targetReduction,
	)
	const rate1Scope3 = calculateCompoundReduction(
		baseEmissions.totalScope3Emissions ?? 0,
		baseYear,
		targetYear,
		targetReduction,
	)

	// 2. Calculate rate for Target -> Long Term (if applicable)
	let rate2Scope1 = 0
	let rate2Scope2 = 0
	let rate2Scope3 = 0

	if (
		longTermTargetYear &&
		longTermTargetReduction !== undefined &&
		longTermTargetYear > targetYear
	) {
		// We need the values AT target year to calculate the next leg
		const targetScope1 =
			(baseEmissions.scope1Emissions ?? 0) * (1 - targetReduction / 100)
		const targetScope2 =
			(baseEmissions.scope2EmissionsMarketBased ?? 0) *
			(1 - targetReduction / 100)
		const targetScope3 =
			(baseEmissions.totalScope3Emissions ?? 0) * (1 - targetReduction / 100)

		// Calculate rate from Target Year value -> Long Term value relative to Base Year
		// The Long Term Reduction is usually relative to Base Year
		const longTermValueScope1 =
			(baseEmissions.scope1Emissions ?? 0) * (1 - longTermTargetReduction / 100)
		const longTermValueScope2 =
			(baseEmissions.scope2EmissionsMarketBased ?? 0) *
			(1 - longTermTargetReduction / 100)
		const longTermValueScope3 =
			(baseEmissions.totalScope3Emissions ?? 0) *
			(1 - longTermTargetReduction / 100)

		// Calculate annual reduction rate for the second period
		// Formula: (Final / Intermediate)^(1 / n_years_period_2)
		const n2 = longTermTargetYear - targetYear
		if (targetScope1 > 0)
			rate2Scope1 = Math.pow(longTermValueScope1 / targetScope1, 1 / n2)
		if (targetScope2 > 0)
			rate2Scope2 = Math.pow(longTermValueScope2 / targetScope2, 1 / n2)
		if (targetScope3 > 0)
			rate2Scope3 = Math.pow(longTermValueScope3 / targetScope3, 1 / n2)
	}

	for (let y = startYear; y <= endYear; y++) {
		// Round to 2 decimals
		const s1 = Number(currentScope1.toFixed(2))
		const s2 = Number(currentScope2.toFixed(2))
		const s3 = Number(currentScope3.toFixed(2))
		const tot = Number(
			(currentScope1 + currentScope2 + currentScope3).toFixed(2),
		)

		rows.push({
			year: y,
			scope1: s1,
			scope2: s2,
			scope3: s3,
			total: tot,
			isBaseYear: y === baseYear,
			isTargetYear: y === targetYear,
			isLongTermTargetYear: longTermTargetYear
				? y === longTermTargetYear
				: undefined,
		})

		// Prepare for next iteration
		if (y < targetYear) {
			currentScope1 *= rate1Scope1
			currentScope2 *= rate1Scope2
			currentScope3 *= rate1Scope3
		} else if (y >= targetYear && y < endYear) {
			currentScope1 *= rate2Scope1
			currentScope2 *= rate2Scope2
			currentScope3 *= rate2Scope3
		}
	}

	return rows
}

const columnHelper = createColumnHelper<EmissionRow>()

const columns = [
	columnHelper.accessor('year', {
		header: 'Year',
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor('scope1', {
		header: 'Scope 1',
		cell: (info) => info.getValue().toLocaleString(),
	}),
	columnHelper.accessor('scope2', {
		header: 'Scope 2',
		cell: (info) => info.getValue().toLocaleString(),
	}),
	columnHelper.accessor('scope3', {
		header: 'Scope 3',
		cell: (info) => info.getValue().toLocaleString(),
	}),
	columnHelper.accessor('total', {
		header: 'Total Emissions',
		cell: (info) => info.getValue().toLocaleString(),
	}),
]

function EmissionsTable({ data }: { data: EmissionRow[] }) {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		filterFns: {
			fuzzy: () => true,
		},
	})

	return (
		<div className="rounded-md border">
			<table className="w-full text-sm">
				<thead className="bg-muted/50">
					{table.getHeaderGroups().map((headerGroup) => (
						<tr key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<th
									key={header.id}
									className="h-10 px-4 text-left align-middle font-medium text-muted-foreground"
								>
									{header.isPlaceholder
										? null
										: flexRender(
												header.column.columnDef.header,
												header.getContext(),
											)}
								</th>
							))}
						</tr>
					))}
				</thead>
				<tbody className="divide-y">
					{table.getRowModel().rows.map((row) => (
						<tr key={row.id} className="hover:bg-muted/50">
							{row.getVisibleCells().map((cell) => (
								<td key={cell.id} className="p-4 align-middle">
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}

function TargetsPage() {
	const { organization } = useOrgGuard()
	const [selectedBaseYear, setSelectedBaseYear] = useState<number | null>(null)
	const [isSaving, setIsSaving] = useState(false)

	// Fetch organization data to get company name
	const orgData = useQuery(
		api.organizations.getByClerkOrgId,
		organization ? { clerkOrgId: organization.id } : 'skip',
	)

	// Fetch existing targets for the organization
	const existingTargets = useQuery(
		api.targets.getTargets,
		organization ? {} : 'skip',
	)

	// Fetch reporting years from formEnvironmental table for Base Year dropdown
	const environmentalYears = useQuery(
		api.forms.get.getEnvironmentalReportingYears,
		organization ? {} : 'skip',
	)

	// Fetch emissions data for selected base year
	const baseYearEmissionsData = useQuery(
		api.forms.get.getBaseYearEmissions,
		selectedBaseYear ? { reportingYear: selectedBaseYear } : 'skip',
	)

	// Mutation to save targets
	const saveTargets = useMutation(api.targets.saveTargets)

	// Ref to access latest emissions data in onSubmit
	const baseYearEmissionsDataRef = useRef(baseYearEmissionsData)
	baseYearEmissionsDataRef.current = baseYearEmissionsData

	const companyName = orgData?.name || 'Your Company'

	// Convert years to select options
	const yearOptions = useMemo(() => {
		return [
			{ label: '- Select year -', value: '' },
			...(environmentalYears ?? []).map((year) => ({
				label: year.toString(),
				value: year.toString(),
			})),
		]
	}, [environmentalYears])

	// Compute default values from existing targets
	const defaultValues = useMemo(() => {
		if (existingTargets) {
			// If we have existing targets, we should also set the selected base year
			// so that we can fetch the emissions data for it
			if (selectedBaseYear === null && existingTargets.baseYear) {
				setSelectedBaseYear(existingTargets.baseYear)
			}

			return {
				baseYear: existingTargets.baseYear,
				baseYearEmissions: existingTargets.baseYearEmissions,
				targetYear: existingTargets.targetYear,
				targetReduction: existingTargets.targetReduction,
				longTermTargetYear: existingTargets.longTermTargetYear,
				longTermTargetReduction: existingTargets.longTermTargetReduction,
			}
		}
		return {
			baseYear: undefined as number | undefined,
			baseYearEmissions: undefined as number | undefined,
			targetYear: undefined as number | undefined,
			targetReduction: undefined as number | undefined,
			longTermTargetYear: undefined as number | undefined,
			longTermTargetReduction: undefined as number | undefined,
		}
	}, [existingTargets, selectedBaseYear])

	// Initialize TanStack Form with default values
	const form = useAppForm({
		defaultValues: defaultValues as TargetsFormValues,
		validators: {
			onSubmit: targetsFormSchema,
		},
		onSubmit: async ({ value }) => {
			setIsSaving(true)
			try {
				const currentBaseEmissions = baseYearEmissionsDataRef.current
				let projections: EmissionRow[] = []

				if (currentBaseEmissions) {
					projections = generateEmissionRows(
						value.baseYear,
						value.targetYear,
						value.targetReduction,
						value.longTermTargetYear,
						value.longTermTargetReduction,
						currentBaseEmissions,
					)
				}

				await saveTargets({
					baseYear: value.baseYear,
					baseYearEmissions: value.baseYearEmissions,
					targetYear: value.targetYear,
					targetReduction: value.targetReduction,
					longTermTargetYear: value.longTermTargetYear,
					longTermTargetReduction: value.longTermTargetReduction,
					projections: projections.length > 0 ? projections : undefined,
				})
				toast.success('Targets saved successfully')
			} catch (error) {
				console.error('Failed to save targets:', error)
				toast.error('Failed to save targets')
			} finally {
				setIsSaving(false)
			}
		},
	})

	// Watch form values for table generation
	const formValues = useStore(form.store, (state: any) => state.values)

	// Generate table data efficiently
	const tableData = useMemo(() => {
		if (
			!baseYearEmissionsData ||
			!formValues.baseYear ||
			!formValues.targetYear ||
			!formValues.targetReduction
		) {
			return []
		}

		return generateEmissionRows(
			formValues.baseYear,
			formValues.targetYear,
			formValues.targetReduction,
			formValues.longTermTargetYear,
			formValues.longTermTargetReduction,
			baseYearEmissionsData,
		)
	}, [
		baseYearEmissionsData,
		formValues.baseYear,
		formValues.targetYear,
		formValues.targetReduction,
		formValues.longTermTargetYear,
		formValues.longTermTargetReduction,
	])

	// Show loading state
	if (!organization || existingTargets === undefined) {
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
					<form.AppForm>
						<form
							onSubmit={(e) => {
								e.preventDefault()
								e.stopPropagation()
								form.handleSubmit()
							}}
							className="space-y-6"
						>
							{/* Base Year with data selector and emissions verification */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-2">
									<div className="text-sm font-medium">Base Year with data</div>
									<select
										className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
										value={selectedBaseYear ?? ''}
										onChange={(e) => {
											const year = e.target.value
												? Number.parseInt(e.target.value, 10)
												: null
											setSelectedBaseYear(year)
											if (year) {
												form.setFieldValue('baseYear', year)
											}
										}}
									>
										{yearOptions.map((option) => (
											<option key={option.value} value={option.value}>
												{option.label}
											</option>
										))}
									</select>
								</div>

								{/* Emissions verification column */}
								{selectedBaseYear && (
									<div className="space-y-2">
										<div className="text-sm font-medium text-muted-foreground">
											Verified Emissions for {selectedBaseYear}
										</div>
										<div className="rounded-md border bg-muted/30 p-3 space-y-1 text-sm">
											{baseYearEmissionsData === undefined ? (
												<div className="text-muted-foreground">
													Loading emissions data...
												</div>
											) : (
												<>
													<div className="flex justify-between">
														<span className="text-muted-foreground">
															Scope 1:
														</span>
														<span className="font-mono">
															{baseYearEmissionsData.scope1Emissions !== null
																? `${baseYearEmissionsData.scope1Emissions.toLocaleString()} tCO₂e`
																: baseYearEmissionsData.energyEmissionsStatus ===
																		null
																	? 'N/A (no record)'
																	: `N/A (${baseYearEmissionsData.energyEmissionsStatus})`}
														</span>
													</div>
													<div className="flex justify-between">
														<span className="text-muted-foreground">
															Scope 2 (market-based):
														</span>
														<span className="font-mono">
															{baseYearEmissionsData.scope2EmissionsMarketBased !==
															null
																? `${baseYearEmissionsData.scope2EmissionsMarketBased.toLocaleString()} tCO₂e`
																: baseYearEmissionsData.energyEmissionsStatus ===
																		null
																	? 'N/A (no record)'
																	: `N/A (${baseYearEmissionsData.energyEmissionsStatus})`}
														</span>
													</div>
													<div className="flex justify-between">
														<span className="text-muted-foreground">
															Scope 3:
														</span>
														<span className="font-mono">
															{baseYearEmissionsData.totalScope3Emissions !==
															null
																? `${baseYearEmissionsData.totalScope3Emissions.toLocaleString()} tCO₂e`
																: baseYearEmissionsData.scope3EmissionsStatus ===
																		null
																	? 'N/A (no record)'
																	: `N/A (${baseYearEmissionsData.scope3EmissionsStatus})`}
														</span>
													</div>
													<div className="flex justify-between pt-1 border-t mt-1">
														<span className="font-medium">Total:</span>
														<span className="font-mono font-medium">
															{calculateTotalEmissions(
																baseYearEmissionsData,
															).toLocaleString()}{' '}
															tCO₂e
														</span>
													</div>
													<Button
														type="button"
														variant="outline"
														size="sm"
														className="w-full mt-2"
														onClick={() => {
															const total = calculateTotalEmissions(
																baseYearEmissionsData,
															)
															form.setFieldValue('baseYearEmissions', total)
														}}
													>
														Use this total
													</Button>
												</>
											)}
										</div>
									</div>
								)}
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<form.AppField name="baseYear">
									{(field) => (
										<field.NumberField
											label="Base year"
											placeholder="e.g., 2020"
										/>
									)}
								</form.AppField>

								<form.AppField name="baseYearEmissions">
									{(field) => (
										<field.NumberField
											label="Base year emissions (tCO₂e)"
											placeholder="e.g., 1000"
										/>
									)}
								</form.AppField>

								<form.AppField name="targetYear">
									{(field) => (
										<field.NumberField
											label="Target year"
											placeholder="e.g., 2030"
										/>
									)}
								</form.AppField>

								<form.AppField name="targetReduction">
									{(field) => (
										<field.NumberField
											label="Target reduction"
											placeholder="e.g., 50"
											unit="%"
										/>
									)}
								</form.AppField>

								<form.AppField name="longTermTargetYear">
									{(field) => (
										<field.NumberField
											label="Long term target year"
											placeholder="e.g., 2050"
										/>
									)}
								</form.AppField>

								<form.AppField name="longTermTargetReduction">
									{(field) => (
										<field.NumberField
											label="Long term target reduction"
											placeholder="e.g., 90"
											unit="%"
										/>
									)}
								</form.AppField>
							</div>

							<div className="flex justify-end">
								<Button type="submit" disabled={isSaving}>
									{isSaving ? 'Saving...' : 'Save targets'}
								</Button>
							</div>
						</form>
					</form.AppForm>
				</CardContent>
			</Card>

			{/* Emissions Chart - shows saved projections from database */}
			{existingTargets?.projections &&
				existingTargets.projections.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle>Emissions Reduction Trajectory</CardTitle>
						</CardHeader>
						<CardContent>
							<EmissionsChart projections={existingTargets.projections} />
						</CardContent>
					</Card>
				)}

			{/* Emissions Projection Table */}
			{tableData.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Emission Reduction Trajectory</CardTitle>
					</CardHeader>
					<CardContent>
						<EmissionsTable data={tableData} />
					</CardContent>
				</Card>
			)}
		</div>
	)
}
