import { useStore } from '@tanstack/react-form'
import { createFileRoute } from '@tanstack/react-router'
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from '@tanstack/react-table'
import { useMutation, useQuery } from 'convex/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { EmissionsChart } from '@/components/emissions-chart'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppForm } from '@/hooks/tanstack-form'
import { useOrgGuard } from '@/hooks/use-org-guard'
import { api } from '../../../../../convex/_generated/api'
import {
	type BaseYearEmissionsData,
	type EmissionRow,
	type Scope1TargetsFormValues,
	type Scope2TargetsFormValues,
	scope1TargetsFormSchema,
	scope2TargetsFormSchema,
	type TargetsFormValues,
	targetsFormSchema,
} from './targets/-schemas'
import {
	calculateOverallReductions,
	calculateTotalEmissions,
	generateEmissionRows,
	updateScope1Projections,
	updateScope2Projections,
} from './targets/-utils'

const listVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
		},
	},
}

const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0 },
}

export const Route = createFileRoute('/_appLayout/app/targets/')({
	component: TargetsPage,
})

// --- Table Logic & Components ---

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
					hasScopeSpecificTargets: {
						scope1: false,
						scope2: false,
						scope3: false,
					},
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

	// Scope 1 Form Default Values & Setup
	const scope1DefaultValues = useMemo(() => {
		if (!existingTargets?.projections) {
			return {
				targetReduction: undefined,
				targetAbsolute: undefined,
				longTermTargetReduction: undefined,
				longTermTargetAbsolute: undefined,
			}
		}

		const base = existingTargets.projections.find(
			(p: EmissionRow) => p.isBaseYear,
		)
		const tgt = existingTargets.projections.find(
			(p: EmissionRow) => p.isTargetYear,
		)
		const ltTgt = existingTargets.projections.find(
			(p: EmissionRow) => p.isLongTermTargetYear,
		)

		const baseVal = base?.scope1 ?? 0
		const targetVal = tgt?.scope1

		let targetPct: number | undefined
		if (baseVal > 0 && targetVal !== undefined) {
			targetPct = (1 - targetVal / baseVal) * 100
		} else if (baseVal === 0 && targetVal !== undefined) {
			targetPct = 0
		}

		const ltVal = ltTgt?.scope1
		let ltPct: number | undefined
		if (ltVal !== undefined) {
			if (baseVal > 0) {
				ltPct = (1 - ltVal / baseVal) * 100
			} else {
				ltPct = 0
			}
		}

		return {
			targetReduction:
				targetPct !== undefined ? Number(targetPct.toFixed(2)) : undefined,
			targetAbsolute:
				targetVal !== undefined ? Number(targetVal.toFixed(2)) : undefined,
			longTermTargetReduction:
				ltPct !== undefined ? Number(ltPct.toFixed(2)) : undefined,
			longTermTargetAbsolute:
				ltVal !== undefined ? Number(ltVal.toFixed(2)) : undefined,
		}
	}, [existingTargets])

	const [isSavingScope1, setIsSavingScope1] = useState(false)

	const scope1Form = useAppForm({
		defaultValues: scope1DefaultValues as Scope1TargetsFormValues,
		validators: {
			onSubmit: scope1TargetsFormSchema,
		},
		onSubmit: async ({ value }) => {
			setIsSavingScope1(true)
			try {
				if (!existingTargets || !existingTargets.projections) {
					throw new Error('No base projections found')
				}

				const newProjections = updateScope1Projections(
					existingTargets.projections,
					value.targetReduction || 0,
					value.longTermTargetReduction,
				)

				const {
					targetReduction: newGlobalTargetReduction,
					longTermTargetReduction: newGlobalLongTermTargetReduction,
				} = calculateOverallReductions(newProjections)

				await saveTargets({
					baseYear: existingTargets.baseYear,
					baseYearEmissions: existingTargets.baseYearEmissions,
					targetYear: existingTargets.targetYear,
					targetReduction: newGlobalTargetReduction,
					longTermTargetYear: existingTargets.longTermTargetYear,
					longTermTargetReduction:
						newGlobalLongTermTargetReduction ??
						existingTargets.longTermTargetReduction,
					hasScopeSpecificTargets: {
						scope1: true,
						scope2: existingTargets.hasScopeSpecificTargets?.scope2 ?? false,
						scope3: existingTargets.hasScopeSpecificTargets?.scope3 ?? false,
					},
					projections: newProjections,
				})
				toast.success('Scope 1 targets saved successfully')
			} catch (error) {
				console.error('Failed to save Scope 1 targets:', error)
				toast.error('Failed to save Scope 1 targets')
			} finally {
				setIsSavingScope1(false)
			}
		},
	})

	// Scope 2 Form Default Values & Setup
	const scope2DefaultValues = useMemo(() => {
		if (!existingTargets?.projections) {
			return {
				targetReduction: undefined,
				targetAbsolute: undefined,
				longTermTargetReduction: undefined,
				longTermTargetAbsolute: undefined,
			}
		}

		const base = existingTargets.projections.find(
			(p: EmissionRow) => p.isBaseYear,
		)
		const tgt = existingTargets.projections.find(
			(p: EmissionRow) => p.isTargetYear,
		)
		const ltTgt = existingTargets.projections.find(
			(p: EmissionRow) => p.isLongTermTargetYear,
		)

		const baseVal = base?.scope2 ?? 0
		const targetVal = tgt?.scope2

		let targetPct: number | undefined
		if (baseVal > 0 && targetVal !== undefined) {
			targetPct = (1 - targetVal / baseVal) * 100
		} else if (baseVal === 0 && targetVal !== undefined) {
			targetPct = 0
		}

		const ltVal = ltTgt?.scope2
		let ltPct: number | undefined
		if (ltVal !== undefined) {
			if (baseVal > 0) {
				ltPct = (1 - ltVal / baseVal) * 100
			} else {
				ltPct = 0
			}
		}

		return {
			targetReduction:
				targetPct !== undefined ? Number(targetPct.toFixed(2)) : undefined,
			targetAbsolute:
				targetVal !== undefined ? Number(targetVal.toFixed(2)) : undefined,
			longTermTargetReduction:
				ltPct !== undefined ? Number(ltPct.toFixed(2)) : undefined,
			longTermTargetAbsolute:
				ltVal !== undefined ? Number(ltVal.toFixed(2)) : undefined,
		}
	}, [existingTargets])

	const [isSavingScope2, setIsSavingScope2] = useState(false)

	const scope2Form = useAppForm({
		defaultValues: scope2DefaultValues as Scope2TargetsFormValues,
		validators: {
			onSubmit: scope2TargetsFormSchema,
		},
		onSubmit: async ({ value }) => {
			setIsSavingScope2(true)
			try {
				if (!existingTargets || !existingTargets.projections) {
					throw new Error('No base projections found')
				}

				const newProjections = updateScope2Projections(
					existingTargets.projections,
					value.targetReduction || 0,
					value.longTermTargetReduction,
				)

				const {
					targetReduction: newGlobalTargetReduction,
					longTermTargetReduction: newGlobalLongTermTargetReduction,
				} = calculateOverallReductions(newProjections)

				await saveTargets({
					baseYear: existingTargets.baseYear,
					baseYearEmissions: existingTargets.baseYearEmissions,
					targetYear: existingTargets.targetYear,
					targetReduction: newGlobalTargetReduction,
					longTermTargetYear: existingTargets.longTermTargetYear,
					longTermTargetReduction:
						newGlobalLongTermTargetReduction ??
						existingTargets.longTermTargetReduction,
					hasScopeSpecificTargets: {
						scope1: existingTargets.hasScopeSpecificTargets?.scope1 ?? false,
						scope2: true,
						scope3: existingTargets.hasScopeSpecificTargets?.scope3 ?? false,
					},
					projections: newProjections,
				})
				toast.success('Scope 2 targets saved successfully')
			} catch (error) {
				console.error('Failed to save Scope 2 targets:', error)
				toast.error('Failed to save Scope 2 targets')
			} finally {
				setIsSavingScope2(false)
			}
		},
	})

	// Watch form values for table generation
	const formValues = useStore(form.store, (state: any) => state.values)

	const baseScope1Proj = existingTargets?.projections?.find(
		(p: EmissionRow) => p.isBaseYear,
	)
	const baseScope1Value = baseScope1Proj?.scope1 ?? 0

	const baseScope2Proj = existingTargets?.projections?.find(
		(p: EmissionRow) => p.isBaseYear,
	)
	const baseScope2Value = baseScope2Proj?.scope2 ?? 0

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

	const hasSpecificTargetsActive = useMemo(() => {
		if (!existingTargets?.hasScopeSpecificTargets) return false
		const targets = existingTargets.hasScopeSpecificTargets
		return targets.scope1 || targets.scope2 || targets.scope3
	}, [existingTargets])

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

			<Tabs defaultValue="main" className="w-full">
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="main">Main</TabsTrigger>
					<TabsTrigger value="scope1">Scope 1</TabsTrigger>
					<TabsTrigger value="scope2">Scope 2</TabsTrigger>
					<TabsTrigger value="scope3">Scope 3</TabsTrigger>
				</TabsList>

				<div className="mt-6">
					<TabsContent value="main" className="mt-0">
						<AnimatePresence>
							<motion.div
								animate="visible"
								className="space-y-8"
								exit="hidden"
								initial="hidden"
								variants={listVariants}
							>
								<motion.div
									variants={itemVariants}
									transition={{ type: 'tween' }}
								>
									{hasSpecificTargetsActive && (
										<div className="bg-amber-50 dark:bg-amber-950 border-l-4 border-amber-500 p-4 mb-6 rounded-r-md">
											<div className="flex">
												<div className="ml-3">
													<p className="text-sm text-amber-800 dark:text-amber-200">
														<strong>Note:</strong> You have set scope-specific
														targets. Saving new global targets here will
														recalculate and overwrite your specific targets
														across all scopes.
													</p>
												</div>
											</div>
										</div>
									)}
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
															<div className="text-sm font-medium">
																Base Year with data
															</div>
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
																	<option
																		key={option.value}
																		value={option.value}
																	>
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
																					{baseYearEmissionsData.scope1Emissions !==
																					null
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
																				<span className="font-medium">
																					Total:
																				</span>
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
																					form.setFieldValue(
																						'baseYearEmissions',
																						total,
																					)
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
								</motion.div>

								{/* Emissions Chart - shows saved projections from database */}
								{existingTargets?.projections &&
									existingTargets.projections.length > 0 && (
										<motion.div
											variants={itemVariants}
											transition={{ type: 'tween' }}
										>
											<Card>
												<CardHeader>
													<CardTitle>Emissions Reduction Trajectory</CardTitle>
												</CardHeader>
												<CardContent>
													<EmissionsChart
														projections={existingTargets.projections}
													/>
												</CardContent>
											</Card>
										</motion.div>
									)}

								{/* Emissions Projection Table */}
								{tableData.length > 0 && (
									<motion.div
										variants={itemVariants}
										transition={{ type: 'tween' }}
									>
										<Card>
											<CardHeader>
												<CardTitle>Emission Reduction Trajectory</CardTitle>
											</CardHeader>
											<CardContent>
												<EmissionsTable data={tableData} />
											</CardContent>
										</Card>
									</motion.div>
								)}
							</motion.div>
						</AnimatePresence>
					</TabsContent>
					<TabsContent value="scope1" className="mt-0">
						<AnimatePresence>
							<motion.div
								animate="visible"
								exit="hidden"
								initial="hidden"
								variants={listVariants}
							>
								<motion.div
									variants={itemVariants}
									transition={{ type: 'tween' }}
								>
									<Card>
										<CardHeader>
											<CardTitle>Scope 1 Targets</CardTitle>
										</CardHeader>
										<CardContent>
											{!existingTargets?.projections ||
											existingTargets.projections.length === 0 ? (
												<div className="rounded-md bg-muted p-4 text-sm text-muted-foreground border">
													Please set your Base Year and global emissions targets
													in the Main tab first before setting scope-specific
													targets.
												</div>
											) : (
												<scope1Form.AppForm>
													<form
														onSubmit={(e) => {
															e.preventDefault()
															e.stopPropagation()
															scope1Form.handleSubmit()
														}}
														className="space-y-6"
													>
														<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
															<div className="space-y-2">
																<div className="text-sm font-medium">
																	Base Year
																</div>
																<div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
																	{existingTargets.baseYear}
																</div>
															</div>
															<div className="space-y-2">
																<div className="text-sm font-medium">
																	Base Year Emissions (Scope 1)
																</div>
																<div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
																	{baseScope1Value.toLocaleString()} tCO₂e
																</div>
															</div>

															<div className="space-y-2">
																<div className="text-sm font-medium">
																	Target Year
																</div>
																<div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
																	{existingTargets.targetYear}
																</div>
															</div>
															{/* empty div for alignment */}
															<div className="hidden md:block" />

															<scope1Form.AppField
																name="targetReduction"
																listeners={{
																	onBlur: ({ value }) => {
																		if (
																			value !== undefined &&
																			baseScope1Value > 0
																		) {
																			const expected =
																				baseScope1Value * (1 - value / 100)
																			const current =
																				scope1Form.getFieldValue(
																					'targetAbsolute',
																				)
																			if (
																				Math.abs(expected - (current || 0)) >
																				0.01
																			) {
																				scope1Form.setFieldValue(
																					'targetAbsolute',
																					Number(expected.toFixed(2)),
																				)
																			}
																		}
																	},
																}}
															>
																{(field) => (
																	<field.NumberField
																		label="Target reduction"
																		placeholder="e.g., 50"
																		unit="%"
																	/>
																)}
															</scope1Form.AppField>

															<scope1Form.AppField
																name="targetAbsolute"
																listeners={{
																	onBlur: ({ value }) => {
																		if (
																			value !== undefined &&
																			baseScope1Value > 0
																		) {
																			const expectedPct =
																				(1 - value / baseScope1Value) * 100
																			const currentPct =
																				scope1Form.getFieldValue(
																					'targetReduction',
																				)
																			if (
																				Math.abs(
																					expectedPct - (currentPct || 0),
																				) > 0.01
																			) {
																				scope1Form.setFieldValue(
																					'targetReduction',
																					Number(expectedPct.toFixed(2)),
																				)
																			}
																		}
																	},
																}}
															>
																{(field) => (
																	<field.NumberField
																		label="Target emissions"
																		placeholder="e.g., 500"
																		unit="tCO₂e"
																	/>
																)}
															</scope1Form.AppField>

															{existingTargets.longTermTargetYear && (
																<>
																	<div className="space-y-2 col-span-1 md:col-span-2 mt-4 pt-4 border-t">
																		<div className="text-sm font-medium">
																			Long Term Target Year
																		</div>
																		<div className="flex h-10 w-full md:w-[calc(50%-12px)] xl:w-[calc(50%-12px)] rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
																			{existingTargets.longTermTargetYear}
																		</div>
																	</div>

																	<scope1Form.AppField
																		name="longTermTargetReduction"
																		listeners={{
																			onBlur: ({ value }) => {
																				if (
																					value !== undefined &&
																					baseScope1Value > 0
																				) {
																					const expected =
																						baseScope1Value * (1 - value / 100)
																					const current =
																						scope1Form.getFieldValue(
																							'longTermTargetAbsolute',
																						)
																					if (
																						Math.abs(
																							expected - (current || 0),
																						) > 0.01
																					) {
																						scope1Form.setFieldValue(
																							'longTermTargetAbsolute',
																							Number(expected.toFixed(2)),
																						)
																					}
																				}
																			},
																		}}
																	>
																		{(field) => (
																			<field.NumberField
																				label="Long term target reduction"
																				placeholder="e.g., 90"
																				unit="%"
																			/>
																		)}
																	</scope1Form.AppField>

																	<scope1Form.AppField
																		name="longTermTargetAbsolute"
																		listeners={{
																			onBlur: ({ value }) => {
																				if (
																					value !== undefined &&
																					baseScope1Value > 0
																				) {
																					const expectedPct =
																						(1 - value / baseScope1Value) * 100
																					const currentPct =
																						scope1Form.getFieldValue(
																							'longTermTargetReduction',
																						)
																					if (
																						Math.abs(
																							expectedPct - (currentPct || 0),
																						) > 0.01
																					) {
																						scope1Form.setFieldValue(
																							'longTermTargetReduction',
																							Number(expectedPct.toFixed(2)),
																						)
																					}
																				}
																			},
																		}}
																	>
																		{(field) => (
																			<field.NumberField
																				label="Long term target emissions"
																				placeholder="e.g., 100"
																				unit="tCO₂e"
																			/>
																		)}
																	</scope1Form.AppField>
																</>
															)}
														</div>

														<div className="flex justify-end">
															<Button type="submit" disabled={isSavingScope1}>
																{isSavingScope1
																	? 'Saving...'
																	: 'Save Scope 1 targets'}
															</Button>
														</div>
													</form>
												</scope1Form.AppForm>
											)}
										</CardContent>
									</Card>
								</motion.div>
							</motion.div>
						</AnimatePresence>
					</TabsContent>
					<TabsContent value="scope2" className="mt-0">
						<AnimatePresence>
							<motion.div
								animate="visible"
								exit="hidden"
								initial="hidden"
								variants={listVariants}
							>
								<motion.div
									variants={itemVariants}
									transition={{ type: 'tween' }}
								>
									<Card>
										<CardHeader>
											<CardTitle>Scope 2 Targets</CardTitle>
										</CardHeader>
										<CardContent>
											{!existingTargets?.projections ||
											existingTargets.projections.length === 0 ? (
												<div className="rounded-md bg-muted p-4 text-sm text-muted-foreground border">
													Please set your Base Year and global emissions targets
													in the Main tab first before setting scope-specific
													targets.
												</div>
											) : (
												<scope2Form.AppForm>
													<form
														onSubmit={(e) => {
															e.preventDefault()
															e.stopPropagation()
															scope2Form.handleSubmit()
														}}
														className="space-y-6"
													>
														<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
															<div className="space-y-2">
																<div className="text-sm font-medium">
																	Base Year
																</div>
																<div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
																	{existingTargets.baseYear}
																</div>
															</div>
															<div className="space-y-2">
																<div className="text-sm font-medium">
																	Base Year Emissions (Scope 2)
																</div>
																<div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
																	{baseScope2Value.toLocaleString()} tCO₂e
																</div>
															</div>

															<div className="space-y-2">
																<div className="text-sm font-medium">
																	Target Year
																</div>
																<div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
																	{existingTargets.targetYear}
																</div>
															</div>
															{/* empty div for alignment */}
															<div className="hidden md:block" />

															<scope2Form.AppField
																name="targetReduction"
																listeners={{
																	onBlur: ({ value }) => {
																		if (
																			value !== undefined &&
																			baseScope2Value > 0
																		) {
																			const expected =
																				baseScope2Value * (1 - value / 100)
																			const current =
																				scope2Form.getFieldValue(
																					'targetAbsolute',
																				)
																			if (
																				Math.abs(expected - (current || 0)) >
																				0.01
																			) {
																				scope2Form.setFieldValue(
																					'targetAbsolute',
																					Number(expected.toFixed(2)),
																				)
																			}
																		}
																	},
																}}
															>
																{(field) => (
																	<field.NumberField
																		label="Target reduction"
																		placeholder="e.g., 50"
																		unit="%"
																	/>
																)}
															</scope2Form.AppField>

															<scope2Form.AppField
																name="targetAbsolute"
																listeners={{
																	onBlur: ({ value }) => {
																		if (
																			value !== undefined &&
																			baseScope2Value > 0
																		) {
																			const expectedPct =
																				(1 - value / baseScope2Value) * 100
																			const currentPct =
																				scope2Form.getFieldValue(
																					'targetReduction',
																				)
																			if (
																				Math.abs(
																					expectedPct - (currentPct || 0),
																				) > 0.01
																			) {
																				scope2Form.setFieldValue(
																					'targetReduction',
																					Number(expectedPct.toFixed(2)),
																				)
																			}
																		}
																	},
																}}
															>
																{(field) => (
																	<field.NumberField
																		label="Target emissions"
																		placeholder="e.g., 500"
																		unit="tCO₂e"
																	/>
																)}
															</scope2Form.AppField>

															{existingTargets.longTermTargetYear && (
																<>
																	<div className="space-y-2 col-span-1 md:col-span-2 mt-4 pt-4 border-t">
																		<div className="text-sm font-medium">
																			Long Term Target Year
																		</div>
																		<div className="flex h-10 w-full md:w-[calc(50%-12px)] xl:w-[calc(50%-12px)] rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
																			{existingTargets.longTermTargetYear}
																		</div>
																	</div>

																	<scope2Form.AppField
																		name="longTermTargetReduction"
																		listeners={{
																			onBlur: ({ value }) => {
																				if (
																					value !== undefined &&
																					baseScope2Value > 0
																				) {
																					const expected =
																						baseScope2Value * (1 - value / 100)
																					const current =
																						scope2Form.getFieldValue(
																							'longTermTargetAbsolute',
																						)
																					if (
																						Math.abs(
																							expected - (current || 0),
																						) > 0.01
																					) {
																						scope2Form.setFieldValue(
																							'longTermTargetAbsolute',
																							Number(expected.toFixed(2)),
																						)
																					}
																				}
																			},
																		}}
																	>
																		{(field) => (
																			<field.NumberField
																				label="Long term target reduction"
																				placeholder="e.g., 90"
																				unit="%"
																			/>
																		)}
																	</scope2Form.AppField>

																	<scope2Form.AppField
																		name="longTermTargetAbsolute"
																		listeners={{
																			onBlur: ({ value }) => {
																				if (
																					value !== undefined &&
																					baseScope2Value > 0
																				) {
																					const expectedPct =
																						(1 - value / baseScope2Value) * 100
																					const currentPct =
																						scope2Form.getFieldValue(
																							'longTermTargetReduction',
																						)
																					if (
																						Math.abs(
																							expectedPct - (currentPct || 0),
																						) > 0.01
																					) {
																						scope2Form.setFieldValue(
																							'longTermTargetReduction',
																							Number(expectedPct.toFixed(2)),
																						)
																					}
																				}
																			},
																		}}
																	>
																		{(field) => (
																			<field.NumberField
																				label="Long term target emissions"
																				placeholder="e.g., 100"
																				unit="tCO₂e"
																			/>
																		)}
																	</scope2Form.AppField>
																</>
															)}
														</div>

														<div className="flex justify-end">
															<Button type="submit" disabled={isSavingScope2}>
																{isSavingScope2
																	? 'Saving...'
																	: 'Save Scope 2 targets'}
															</Button>
														</div>
													</form>
												</scope2Form.AppForm>
											)}
										</CardContent>
									</Card>
								</motion.div>
							</motion.div>
						</AnimatePresence>
					</TabsContent>
					<TabsContent value="scope3" className="mt-0">
						<AnimatePresence>
							<motion.div
								animate="visible"
								exit="hidden"
								initial="hidden"
								variants={listVariants}
							>
								<motion.div
									variants={itemVariants}
									transition={{ type: 'tween' }}
								>
									<Card>
										<CardHeader>
											<CardTitle>Scope 3 Targets</CardTitle>
										</CardHeader>
										<CardContent>
											<p className="text-muted-foreground">
												Scope 3 targets coming soon...
											</p>
										</CardContent>
									</Card>
								</motion.div>
							</motion.div>
						</AnimatePresence>
					</TabsContent>
				</div>
			</Tabs>
		</div>
	)
}
