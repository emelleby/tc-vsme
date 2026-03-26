import { motion } from 'framer-motion'
import { useEffect } from 'react'
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
}: MainTabProps) {
	const { AppForm, AppField } = form

	useEffect(() => {
		if (selectedBaseYear && selectedBaseYear.toString().length === 4 && baseYearEmissionsData) {
			const total = calculateTotalEmissions(baseYearEmissionsData)
			const currentTotal = form.getFieldValue('baseYearEmissions')
			if (currentTotal !== total) {
				form.setFieldValue('baseYearEmissions', total)
			}
		}
	}, [selectedBaseYear, baseYearEmissionsData, form])

	return (
		<motion.div
			variants={itemVariants}
			className="space-y-6"
			transition={{ type: 'tween' }}
		>
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
							{/* Base Year with data selector */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<AppField
									name="baseYear_with_data"
									listeners={{
										onChange: ({ value }) => {
											const year = value
												? Number.parseInt(value.toString(), 10)
												: undefined
											setSelectedBaseYear(year ?? null)
											if (year) {
												form.setFieldValue('baseYear', year as any)
											}
										},
									}}
								>
									{(field) => (
										<field.SelectField
											label="Base Year with data"
											placeholder="Select year"
											options={yearOptions}
										/>
									)}
								</AppField>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<AppField
									name="baseYear"
									listeners={{
										onChange: ({ value }) => {
											setSelectedBaseYear(value ?? null)
										},
									}}
								>
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
			<motion.div variants={itemVariants} transition={{ type: 'tween' }}>
				<Card>
					<CardHeader>
						<CardTitle>Emissions Reduction Trajectory (Chart)</CardTitle>
					</CardHeader>
					<CardContent>
						{existingTargets?.projections && existingTargets.projections.length > 0 ? (
							<EmissionsChart projections={existingTargets.projections} />
						) : (
							<div className="flex h-[400px] items-center justify-center text-muted-foreground border rounded-md bg-muted/20">
								Save targets to view projection chart
							</div>
						)}
					</CardContent>
				</Card>
			</motion.div>

			{/* Emissions Projection Table */}
			<motion.div variants={itemVariants} transition={{ type: 'tween' }}>
				<Card>
					<CardHeader>
						<CardTitle>Emission Reduction Trajectory (Table)</CardTitle>
					</CardHeader>
					<CardContent>
						{existingTargets?.projections && existingTargets.projections.length > 0 ? (
							<EmissionsTable data={existingTargets.projections} />
						) : (
							<div className="flex p-8 items-center justify-center text-muted-foreground border rounded-md bg-muted/20">
								Save targets to view projection table
							</div>
						)}
					</CardContent>
				</Card>
			</motion.div>
		</motion.div>
	)
}
