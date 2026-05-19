import { useStore } from '@tanstack/react-form'
import { useStore as useYearStore } from '@tanstack/react-store'
import { Card, CardContent } from '@/components/ui/card'
import { FormButtons } from '@/hooks/tanstack-form'
import { useFormSubmission } from '@/hooks/use-form-submission'
import {
	type B11FinesPenaltiesValues,
	b11FinesPenaltiesSchema,
} from '@/lib/forms/schemas/b11-fines-penalties-schema'
import { yearStore } from '@/lib/year-store'

export function B11FinesPenaltiesForm() {
	const reportingYear = useYearStore(yearStore, (state) => state.selectedYear)

	const { form, status, isSaving, isLoading, saveDraft, submit, reopen } =
		useFormSubmission<B11FinesPenaltiesValues>({
			table: 'formGovernance',
			reportingYear,
			section: 'finesPenalties',
			schema: b11FinesPenaltiesSchema,
			defaultValues: {
				reportingYear: reportingYear.toString(),
				hasCorruptionFines: false,
				corruptionFinesDescription: '',
			} as B11FinesPenaltiesValues,
		})

	// Subscribe to branch field for reactive updates
	const hasCorruptionFines = useStore(
		form.store,
		(state) => state.values.hasCorruptionFines,
	)

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
				<Card>
					<CardContent>
						<fieldset disabled={status === 'submitted'} className="space-y-6">
							{/* Hidden reporting year */}
							<form.AppField name="reportingYear">
								{(field) => (
									<field.TextField
										label="Rapporteringsår"
										placeholder="YYYY"
										hidden
									/>
								)}
							</form.AppField>

							<div className="flex flex-col items-start gap-3">
								<h3 className="text-base font-semibold">
									Bøter og straffer for korrupsjon
								</h3>

								<form.AppField
									name="hasCorruptionFines"
									listeners={{
										onChange: ({ value, fieldApi }) => {
											if (!value) {
												fieldApi.form.setFieldValue(
													'corruptionFinesDescription',
													'',
												)
												fieldApi.form.setFieldValue(
													'numberOfConvictions',
													undefined as any,
												)
												fieldApi.form.setFieldValue(
													'totalFines',
													undefined as any,
												)
												fieldApi.form.setFieldValue(
													'currency',
													undefined as any,
												)
											} else {
												fieldApi.form.setFieldValue('currency', 'NOK')
											}
										},
									}}
								>
									{(field) => (
										<field.SwitchField
											label=""
											description="Has fines or penalties during the period related to violations of anti-corruption or anti-bribery laws?"
										/>
									)}
								</form.AppField>
								<span className="text-sm">
									{hasCorruptionFines ? 'Ja' : 'Nei'}
								</span>

								<form.Subscribe
									selector={(state) => state.values.hasCorruptionFines}
								>
									{(hasFines) =>
										hasFines ? (
											<div className="flex flex-col gap-4 w-full">
												<form.AppField name="numberOfConvictions">
													{(field) => (
														<field.NumberField
															label="Number of Convictions"
															placeholder="0"
														/>
													)}
												</form.AppField>
												<div className="flex gap-4">
													<div className="flex-1">
														<form.AppField name="totalFines">
															{(field) => (
																<field.NumberField
																	label="Total Fines"
																	placeholder="0"
																/>
															)}
														</form.AppField>
													</div>
													<div className="flex-1">
														<form.AppField name="currency">
															{(field) => (
																<field.SelectField
																	label="Currency"
																	options={[
																		{ label: 'NOK', value: 'NOK' },
																		{ label: 'SEK', value: 'SEK' },
																		{ label: 'DKK', value: 'DKK' },
																		{ label: 'EUR', value: 'EUR' },
																		{ label: 'USD', value: 'USD' },
																		{ label: 'GBP', value: 'GBP' },
																	]}
																/>
															)}
														</form.AppField>
													</div>
												</div>
												<form.AppField name="corruptionFinesDescription">
													{(field) => (
														<field.TextareaField
															label="Description"
															placeholder="Provide more information if relevant..."
															rows={4}
														/>
													)}
												</form.AppField>
											</div>
										) : null
									}
								</form.Subscribe>
							</div>
						</fieldset>
					</CardContent>
				</Card>

				<FormButtons
					status={status as 'not_started' | 'draft' | 'submitted'}
					isSaving={isSaving}
					onSaveDraft={saveDraft}
					onSubmit={submit}
					onReopen={reopen}
				/>
			</form>
		</form.AppForm>
	)
}
