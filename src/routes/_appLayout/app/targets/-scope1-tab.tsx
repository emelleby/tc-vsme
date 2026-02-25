import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { itemVariants } from './-animations'
import { createScopeFieldListeners } from './-field-listeners'
import type { useScope1Form } from './-hooks'
import type { EmissionRow } from './-schemas'

interface Scope1TabProps {
	scope1Form: ReturnType<typeof useScope1Form>['form']
	isSavingScope1: boolean
	existingTargets:
		| {
				baseYear?: number
				targetYear?: number
				longTermTargetYear?: number
				projections?: EmissionRow[]
		  }
		| null
		| undefined
	baseScope1Value: number
}

export function Scope1Tab({
	scope1Form,
	isSavingScope1,
	existingTargets,
	baseScope1Value,
}: Scope1TabProps) {
	const { AppForm, AppField } = scope1Form

	// Create field listeners for percentage ↔ absolute synchronization
	const listeners = createScopeFieldListeners({
		form: scope1Form,
		baseValue: baseScope1Value,
		targetReductionField: 'targetReduction',
		targetAbsoluteField: 'targetAbsolute',
		longTermTargetReductionField: 'longTermTargetReduction',
		longTermTargetAbsoluteField: 'longTermTargetAbsolute',
	})

	return (
		<motion.div variants={itemVariants} transition={{ type: 'tween' }}>
			<Card>
				<CardHeader>
					<CardTitle>Scope 1 Targets</CardTitle>
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
									scope1Form.handleSubmit()
								}}
								className="space-y-6"
							>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-2">
										<div className="text-sm font-medium">Base Year</div>
										<div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
											{existingTargets.baseYear}
										</div>
									</div>
									<div className="space-y-2">
										<div className="text-sm font-medium">
											Base Year Emissions (Scope 1)
										</div>
										<div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
											{baseScope1Value.toLocaleString()} tCO2e
										</div>
									</div>

									<div className="space-y-2">
										<div className="text-sm font-medium">Target Year</div>
										<div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
											{existingTargets.targetYear}
										</div>
									</div>
									{/* empty div for alignment */}
									<div className="hidden md:block" />

									<AppField
										name="targetReduction"
										listeners={listeners.targetReduction}
									>
										{(field) => (
											<field.NumberField
												label="Target reduction"
												placeholder="e.g., 50"
												unit="%"
											/>
										)}
									</AppField>

									<AppField
										name="targetAbsolute"
										listeners={listeners.targetAbsolute}
									>
										{(field) => (
											<field.NumberField
												label="Target emissions"
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
												listeners={listeners.longTermTargetReduction}
											>
												{(field) => (
													<field.NumberField
														label="Long term target reduction"
														placeholder="e.g., 90"
														unit="%"
													/>
												)}
											</AppField>

											<AppField
												name="longTermTargetAbsolute"
												listeners={listeners.longTermTargetAbsolute}
											>
												{(field) => (
													<field.NumberField
														label="Long term target emissions"
														placeholder="e.g., 100"
														unit="tCO2e"
													/>
												)}
											</AppField>
										</>
									)}
								</div>

								<div className="flex justify-end">
									<Button type="submit" disabled={isSavingScope1}>
										{isSavingScope1 ? 'Saving...' : 'Save Scope 1 targets'}
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
