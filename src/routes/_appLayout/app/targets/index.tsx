import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
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
	}, [existingTargets])

	// Initialize TanStack Form with default values
	const form = useAppForm({
		defaultValues: defaultValues as TargetsFormValues,
		validators: {
			onSubmit: targetsFormSchema,
		},
		onSubmit: async ({ value }) => {
			setIsSaving(true)
			try {
				await saveTargets({
					baseYear: value.baseYear,
					baseYearEmissions: value.baseYearEmissions,
					targetYear: value.targetYear,
					targetReduction: value.targetReduction,
					longTermTargetYear: value.longTermTargetYear,
					longTermTargetReduction: value.longTermTargetReduction,
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
		</div>
	)
}
