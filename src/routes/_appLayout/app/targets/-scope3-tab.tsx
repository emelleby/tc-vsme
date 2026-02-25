import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { itemVariants } from './-animations'
import {
	createScope3CategoryToTotal,
	createScope3TotalToCategories,
	createScopeFieldListeners,
} from './-field-listeners'
import type { BaseYearEmissionsData, EmissionRow } from './-schemas'
import { getScope3CategoryProportions } from './-utils'

const SCOPE3_CATEGORIES = [
	'Purchased goods and services',
	'Capital goods',
	'Fuel and energy-related activities',
	'Upstream transportation and distribution',
	'Waste generated in operations',
	'Business travel',
	'Employee commuting',
	'Upstream leased assets',
	'Downstream transportation and distribution',
	'Processing of sold products',
	'Use of sold products',
	'End-of-life treatment of sold products',
	'Downstream leased assets',
	'Franchises',
	'Investments',
]

interface Scope3TabProps {
	scope3Form: {
		AppForm: any
		AppField: React.ComponentType<any>
		handleSubmit: () => void
		getFieldValue: any
		setFieldValue: any
	}
	isSavingScope3: boolean
	existingTargets:
		| {
				baseYear?: number
				targetYear?: number
				longTermTargetYear?: number
				projections?: EmissionRow[]
		  }
		| null
		| undefined
	baseScope3Value: number
	baseYearEmissionsData: BaseYearEmissionsData | null | undefined
}

export function Scope3Tab({
	scope3Form,
	isSavingScope3,
	existingTargets,
	baseScope3Value,
	baseYearEmissionsData,
}: Scope3TabProps) {
	const { AppForm, AppField } = scope3Form

	const proportions = baseYearEmissionsData
		? getScope3CategoryProportions(baseYearEmissionsData)
		: Array(15).fill(1 / 15)

	// Listeners for top-level % <-> Absolute sync
	const topLevelListeners = createScopeFieldListeners({
		form: scope3Form,
		baseValue: baseScope3Value,
		targetReductionField: 'targetReduction',
		targetAbsoluteField: 'targetAbsolute',
		longTermTargetReductionField: 'longTermTargetReduction',
		longTermTargetAbsoluteField: 'longTermTargetAbsolute',
	})

	// Listeners for redistributing total to categories
	const totalToCategoriesListener = createScope3TotalToCategories(
		scope3Form,
		proportions,
		false,
	)
	const totalToCategoriesLtListener = createScope3TotalToCategories(
		scope3Form,
		proportions,
		true,
	)

	// Listeners for individual categories to update total
	const categoryToTotalListener = createScope3CategoryToTotal(
		scope3Form,
		baseScope3Value,
		false,
	)
	const categoryToTotalLtListener = createScope3CategoryToTotal(
		scope3Form,
		baseScope3Value,
		true,
	)

	return (
		<motion.div variants={itemVariants} transition={{ type: 'tween' }}>
			<Card className="mb-8">
				<CardHeader>
					<CardTitle>Scope 3 Targets Summary</CardTitle>
				</CardHeader>
				<CardContent>
					{!existingTargets?.projections ||
					existingTargets.projections.length === 0 ? (
						<div className="rounded-md bg-muted p-4 text-sm text-muted-foreground border">
							Please set your Base Year and global emissions targets in the Main
							tab first before setting scope-specific targets.
						</div>
					) : (
						<AppForm>
							<form
								onSubmit={(e: React.FormEvent) => {
									e.preventDefault()
									e.stopPropagation()
									scope3Form.handleSubmit()
								}}
								className="space-y-8"
							>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b">
									<div className="space-y-2">
										<div className="text-sm font-medium">Base Year</div>
										<div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
											{existingTargets.baseYear}
										</div>
									</div>
									<div className="space-y-2">
										<div className="text-sm font-medium">
											Base Year Emissions (Scope 3)
										</div>
										<div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
											{baseScope3Value.toLocaleString()} tCO2e
										</div>
									</div>

									<div className="space-y-2">
										<div className="text-sm font-medium">Target Year</div>
										<div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
											{existingTargets.targetYear}
										</div>
									</div>
									<div className="hidden md:block" />

									<AppField
										name="targetReduction"
										listeners={topLevelListeners.targetReduction}
									>
										{(field: any) => (
											<field.NumberField
												label="Overall Scope 3 target reduction"
												placeholder="e.g., 50"
												unit="%"
											/>
										)}
									</AppField>

									<AppField
										name="targetAbsolute"
										listeners={{
											...topLevelListeners.targetAbsolute,
											onBlur: (args: any) => {
												topLevelListeners.targetAbsolute.onBlur(args)
												totalToCategoriesListener.onBlur(args)
											},
										}}
									>
										{(field: any) => (
											<field.NumberField
												label="Overall Scope 3 target emissions"
												placeholder="e.g., 500"
												unit="tCO2e"
											/>
										)}
									</AppField>

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

											<AppField
												name="longTermTargetReduction"
												listeners={topLevelListeners.longTermTargetReduction}
											>
												{(field: any) => (
													<field.NumberField
														label="Overall LT target reduction"
														placeholder="e.g., 90"
														unit="%"
													/>
												)}
											</AppField>

											<AppField
												name="longTermTargetAbsolute"
												listeners={{
													...topLevelListeners.longTermTargetAbsolute,
													onBlur: (args: any) => {
														topLevelListeners.longTermTargetAbsolute.onBlur(
															args,
														)
														totalToCategoriesLtListener.onBlur(args)
													},
												}}
											>
												{(field: any) => (
													<field.NumberField
														label="Overall LT target emissions"
														placeholder="e.g., 100"
														unit="tCO2e"
													/>
												)}
											</AppField>
										</>
									)}
								</div>

								<div className="overflow-x-auto">
									<h3 className="text-lg font-semibold mb-4">
										Category Breakdown
									</h3>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Category</TableHead>
												<TableHead className="text-right">Base Year</TableHead>
												<TableHead className="text-right">
													Target Year
												</TableHead>
												{existingTargets.longTermTargetYear && (
													<TableHead className="text-right">
														Long-Term
													</TableHead>
												)}
											</TableRow>
										</TableHeader>
										<TableBody>
											{SCOPE3_CATEGORIES.map((name, i) => {
												const categoryBaseValue =
													(baseYearEmissionsData?.[
														`category${i + 1}` as keyof BaseYearEmissionsData
													] as number) || 0

												return (
													<TableRow key={name}>
														<TableCell className="font-medium max-w-[250px]">
															Category {i + 1} — {name}
														</TableCell>
														<TableCell className="text-right text-muted-foreground">
															{categoryBaseValue.toLocaleString()}
														</TableCell>
														<TableCell className="text-right">
															<AppField
																name={`targetCategory${i + 1}`}
																listeners={categoryToTotalListener}
															>
																{(field: any) => (
																	<field.NumberField
																		hideLabel
																		unit="tCO2e"
																		className="w-full text-right"
																	/>
																)}
															</AppField>
														</TableCell>
														{existingTargets.longTermTargetYear && (
															<TableCell className="text-right">
																<AppField
																	name={`ltCategory${i + 1}`}
																	listeners={categoryToTotalLtListener}
																>
																	{(field: any) => (
																		<field.NumberField
																			hideLabel
																			unit="tCO2e"
																			className="w-full text-right"
																		/>
																	)}
																</AppField>
															</TableCell>
														)}
													</TableRow>
												)
											})}
										</TableBody>
									</Table>
								</div>

								<div className="flex justify-end pt-6">
									<Button type="submit" disabled={isSavingScope3}>
										{isSavingScope3 ? 'Saving...' : 'Save Scope 3 targets'}
									</Button>
								</div>
							</form>
						</AppForm>
					)}
				</CardContent>
			</Card>
		</motion.div>
	)
}
