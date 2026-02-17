import { useStore as useYearStore } from '@tanstack/react-store'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FormButtons } from '@/hooks/tanstack-form'
import { useFormSubmission } from '@/hooks/use-form-submission'
import {
	RECYCLED_MATERIAL_UNITS,
	type B7ResourceUseCircularEconomyFormValues,
	b7ResourceUseCircularEconomySchema,
} from '@/lib/forms/schemas/b7-resource-use-circular-economy-schema'
import { yearStore } from '@/lib/year-store'

export function B7ResourceUseCircularEconomyForm() {
	const reportingYear = useYearStore(yearStore, (state) => state.selectedYear)

	const { form, status, isSaving, isLoading, saveDraft, submit, reopen } =
		useFormSubmission<B7ResourceUseCircularEconomyFormValues>({
			table: 'formEnvironmental',
			reportingYear,
			section: 'resourceUseCircularEconomy',
			schema: b7ResourceUseCircularEconomySchema,
			defaultValues: {
				reportingYear: reportingYear.toString(),
				totalWaste: 0,
				recyclingRate: 0,
				energyRecovery: 0,
				landfill: 0,
				hazardousWaste: 0,
				recycledMaterials: [],
			} as B7ResourceUseCircularEconomyFormValues,
		})

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-8 text-muted-foreground">
				Loading...
			</div>
		)
	}

	return (
		<form.AppForm>
			<form
				onSubmit={(e) => {
					e.preventDefault()
					e.stopPropagation()
					form.handleSubmit()
				}}
			>
				<fieldset disabled={status === 'submitted'} className="space-y-6">
					<form.AppField name="reportingYear">
						{(field) => (
							<field.TextField
								label="Rapporteringsår"
								placeholder="YYYY"
								hidden
							/>
						)}
					</form.AppField>

					<Card>
						<CardContent className="pt-6 space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<form.AppField name="totalWaste">
									{(field) => (
										<field.NumberField
											label="Total Waste"
											unit="tons"
											description="Total amount of waste generated"
										/>
									)}
								</form.AppField>

								<form.AppField name="recyclingRate">
									{(field) => (
										<field.NumberField
											label="Recycling Rate"
											unit="%"
											description="Percentage of waste sent for recycling"
										/>
									)}
								</form.AppField>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<form.AppField name="energyRecovery">
									{(field) => (
										<field.NumberField
											label="Energy Recovery"
											unit="%"
											description="Percentage of waste used for energy recovery"
										/>
									)}
								</form.AppField>

								<form.AppField name="landfill">
									{(field) => (
										<field.NumberField
											label="Landfill"
											unit="%"
											description="Percentage of waste sent to landfill"
										/>
									)}
								</form.AppField>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<form.AppField name="hazardousWaste">
									{(field) => (
										<field.NumberField
											label="Hazardous Waste"
											unit="tons"
											description="Total amount of hazardous waste generated"
										/>
									)}
								</form.AppField>
							</div>

							<form.AppField name="recycledMaterials">
								{(field) => (
									<div className="space-y-4">
										<h3 className="text-base font-medium">Recycled Materials</h3>

										{field.state.value?.length === 0 && (
											<Card className="bg-muted/30">
												<CardContent className="pt-6 text-center">
													<div className="text-4xl mb-2">♻️</div>
													<h4 className="font-medium mb-2">
														No recycled materials added yet
													</h4>
													<p className="text-sm text-muted-foreground mb-4">
														You can add recycled materials below if applicable.
													</p>
												</CardContent>
											</Card>
										)}

										{field.state.value?.map((item, i) => (
											<Card key={item.id} className="relative">
												<CardContent className="pt-6 space-y-6">
													<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
														<form.AppField
															name={`recycledMaterials[${i}].materialType`}
														>
															{(f) => (
																<f.TextField label="Material Type" />
															)}
														</form.AppField>

														<form.AppField
															name={`recycledMaterials[${i}].amount`}
														>
															{(f) => (
																<f.NumberField label="Amount" />
															)}
														</form.AppField>

														<form.AppField
															name={`recycledMaterials[${i}].unit`}
														>
															{(f) => (
																<f.SelectField
																	label="Unit"
																	options={RECYCLED_MATERIAL_UNITS.map(
																		(unit) => ({
																				label: unit,
																				value: unit,
																			}),
																	)}
																/>
															)}
														</form.AppField>
													</div>

													<div className="flex justify-end">
														<Button
															type="button"
															variant="outline"
															size="sm"
															className="text-destructive border-destructive/20 hover:bg-destructive/10"
															onClick={() => field.removeValue(i)}
															disabled={status === 'submitted'}
														>
															<Trash2 className="h-4 w-4" />
															Remove
														</Button>
													</div>
												</CardContent>
											</Card>
										))}

										<Button
											type="button"
											variant="outline"
											className="w-full"
											onClick={() =>
												field.pushValue({
													id: crypto.randomUUID(),
													materialType: '',
													amount: 0,
													unit: RECYCLED_MATERIAL_UNITS[0],
												})
											}
											disabled={status === 'submitted'}
										>
											<Plus className="h-4 w-4 mr-2" />
											Add Recycled Material
										</Button>
									</div>
								)}
							</form.AppField>
						</CardContent>
					</Card>
				</fieldset>

				<FormButtons
					status={status as 'draft' | 'submitted'}
					isSaving={isSaving}
					onSaveDraft={saveDraft}
					onSubmit={submit}
					onReopen={reopen}
				/>
			</form>
		</form.AppForm>
	)
}
