import { motion } from 'framer-motion'
import { EmissionsChart } from '@/components/emissions-chart'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { itemVariants } from './-animations'
import type { useTargetsForm } from './-hooks'
import type { BaseYearEmissionsData, EmissionRow } from './-schemas'
import { EmissionsTable } from './-table'
import { calculateTotalEmissions } from './-utils'

interface MainTabProps {
	form: ReturnType<typeof useTargetsForm>['form']
	isSaving: boolean

	hasSpecificTargetsActive: boolean
	selectedBaseYear: number | null
	setSelectedBaseYear: (year: number | null) => void
	yearOptions: { label: string; value: string }[]
	baseYearEmissionsData: BaseYearEmissionsData | null | undefined
	existingTargets:
		| {
				projections?: EmissionRow[]
		  }
		| null
		| undefined
	tableData: EmissionRow[]
	companyName: string
}

export function MainTab({
	form,
	isSaving,
	hasSpecificTargetsActive,
	selectedBaseYear,
	setSelectedBaseYear,
	yearOptions,
	baseYearEmissionsData,
	existingTargets,
	tableData,
}: MainTabProps) {
	const { AppForm, AppField } = form

	return (
		<motion.div variants={itemVariants} transition={{ type: 'tween' }}>
			{hasSpecificTargetsActive && (
				<div className="bg-amber-50 dark:bg-amber-950 border-l-4 border-amber-500 p-4 mb-6 rounded-r-md">
					<div className="flex">
						<div className="ml-3">
							<p className="text-sm text-amber-800 dark:text-amber-200">
								<strong>Note:</strong> You have set scope-specific targets.
								Saving new global targets here will recalculate and overwrite
								your specific targets across all scopes.
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
					<AppForm>
						<form
							onSubmit={(e: React.FormEvent) => {
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
								{selectedBaseYear && baseYearEmissionsData && (
									<div className="space-y-2">
										<div className="text-sm font-medium text-muted-foreground">
											Verified Emissions for {selectedBaseYear}
										</div>
										<div className="rounded-md border bg-muted/30 p-3 space-y-1 text-sm">
											<div className="flex justify-between">
												<span className="text-muted-foreground">Scope 1:</span>
												<span className="font-mono">
													{baseYearEmissionsData.scope1Emissions !== null
														? `${baseYearEmissionsData.scope1Emissions.toLocaleString()} tCO2e`
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
														? `${baseYearEmissionsData.scope2EmissionsMarketBased.toLocaleString()} tCO2e`
														: baseYearEmissionsData.energyEmissionsStatus ===
																null
															? 'N/A (no record)'
															: `N/A (${baseYearEmissionsData.energyEmissionsStatus})`}
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-muted-foreground">Scope 3:</span>
												<span className="font-mono">
													{baseYearEmissionsData.totalScope3Emissions !== null
														? `${baseYearEmissionsData.totalScope3Emissions.toLocaleString()} tCO2e`
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
													tCO2e
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
										</div>
									</div>
								)}

								{selectedBaseYear && baseYearEmissionsData === undefined && (
									<div className="space-y-2">
										<div className="text-sm font-medium text-muted-foreground">
											Verified Emissions for {selectedBaseYear}
										</div>
										<div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
											Loading emissions data...
										</div>
									</div>
								)}
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<AppField name="baseYear">
									{(field) => (
										<field.NumberField
											label="Base year"
											placeholder="e.g., 2020"
										/>
									)}
								</AppField>

								<AppField name="baseYearEmissions">
									{(field) => (
										<field.NumberField
											label="Base year emissions (tCO2e)"
											placeholder="e.g., 1000"
										/>
									)}
								</AppField>

								<AppField name="targetYear">
									{(field) => (
										<field.NumberField
											label="Target year"
											placeholder="e.g., 2030"
										/>
									)}
								</AppField>

								<AppField name="targetReduction">
									{(field) => (
										<field.NumberField
											label="Target reduction"
											placeholder="e.g., 50"
											unit="%"
										/>
									)}
								</AppField>

								<AppField name="longTermTargetYear">
									{(field) => (
										<field.NumberField
											label="Long term target year"
											placeholder="e.g., 2050"
										/>
									)}
								</AppField>

								<AppField name="longTermTargetReduction">
									{(field) => (
										<field.NumberField
											label="Long term target reduction"
											placeholder="e.g., 90"
											unit="%"
										/>
									)}
								</AppField>
							</div>

							<div className="flex justify-end">
								<Button type="submit" disabled={isSaving}>
									{isSaving ? 'Saving...' : 'Save targets'}
								</Button>
							</div>
						</form>
					</AppForm>
				</CardContent>
			</Card>

			{/* Emissions Chart - shows saved projections from database */}
			{existingTargets?.projections &&
				existingTargets.projections.length > 0 && (
					<motion.div variants={itemVariants} transition={{ type: 'tween' }}>
						<Card>
							<CardHeader>
								<CardTitle>Emissions Reduction Trajectory</CardTitle>
							</CardHeader>
							<CardContent>
								<EmissionsChart projections={existingTargets.projections} />
							</CardContent>
						</Card>
					</motion.div>
				)}

			{/* Emissions Projection Table */}
			{tableData.length > 0 && (
				<motion.div variants={itemVariants} transition={{ type: 'tween' }}>
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
	)
}
