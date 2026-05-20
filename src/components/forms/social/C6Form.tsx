import { useStore } from '@tanstack/react-form'
import { useStore as useYearStore } from '@tanstack/react-store'
import { Card, CardContent } from '@/components/ui/card'
import { FormButtons } from '@/hooks/tanstack-form'
import { useFormSubmission } from '@/hooks/use-form-submission'
import {
	type C6HumanRightsPoliciesValues,
	c6HumanRightsPoliciesSchema,
} from '@/lib/forms/schemas/c6-human-rights-policies-schema'
import { yearStore } from '@/lib/year-store'

export function C6HumanRightsPoliciesForm() {
	const reportingYear = useYearStore(yearStore, (state) => state.selectedYear)

	const { form, status, isSaving, isLoading, saveDraft, submit, reopen } =
		useFormSubmission<C6HumanRightsPoliciesValues>({
			table: 'formSocial',
			reportingYear,
			section: 'humanRightsPolicies',
			schema: c6HumanRightsPoliciesSchema,
			defaultValues: {
				reportingYear: reportingYear.toString(),
				hasCodeOfConduct: false,
				childLaborPolicy: false,
				forcedLaborPolicy: false,
				humanTraffickingPolicy: false,
				discriminationPolicy: false,
				accidentPreventionPolicy: false,
				hasOtherPolicies: false,
				otherPolicies: '',
				hasComplaintsHandlingMechanism: false,
			} as C6HumanRightsPoliciesValues,
		})

	// Subscribe to gate fields for conditional rendering
	const hasCodeOfConduct = useStore(
		form.store,
		(state) => state.values.hasCodeOfConduct,
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

							{/* (a) Does the undertaking have a code of conduct or human rights policy? */}
							<div className="flex flex-col items-start gap-3">
								<h3 className="text-base font-semibold">
									Code of Conduct / Human Rights Policy
								</h3>

								<form.AppField
									name="hasCodeOfConduct"
									listeners={{
										onChange: ({ value, fieldApi }) => {
											if (!value) {
												// Reset all sub-fields when gate is NO
												fieldApi.form.setFieldValue('childLaborPolicy', false)
												fieldApi.form.setFieldValue('forcedLaborPolicy', false)
												fieldApi.form.setFieldValue(
													'humanTraffickingPolicy',
													false,
												)
												fieldApi.form.setFieldValue(
													'discriminationPolicy',
													false,
												)
												fieldApi.form.setFieldValue(
													'accidentPreventionPolicy',
													false,
												)
												fieldApi.form.setFieldValue('hasOtherPolicies', false)
												fieldApi.form.setFieldValue('otherPolicies', '')
											}
										},
									}}
								>
									{(field) => (
										<field.SwitchField
											label=""
											description="Does the undertaking have a code of conduct or human rights policy for its own workforce?"
										/>
									)}
								</form.AppField>
								<span className="text-sm">
									{hasCodeOfConduct ? 'Yes' : 'No'}
								</span>
							</div>

							{/* (b) If yes, does this cover: */}
							<form.Subscribe
								selector={(state) => state.values.hasCodeOfConduct}
							>
								{(hasPolicy) =>
									hasPolicy ? (
										<div className="space-y-4 pl-4 border-l-2 border-muted">
											<h4 className="text-sm font-semibold text-muted-foreground">
												Does the policy cover:
											</h4>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												{/* (b.i) Child labour */}
												<form.AppField name="childLaborPolicy">
													{(field) => (
														<field.CheckboxField label="Child labour" />
													)}
												</form.AppField>

												{/* (b.ii) Forced labour */}
												<form.AppField name="forcedLaborPolicy">
													{(field) => (
														<field.CheckboxField label="Forced labour" />
													)}
												</form.AppField>

												{/* (b.iii) Human trafficking */}
												<form.AppField name="humanTraffickingPolicy">
													{(field) => (
														<field.CheckboxField label="Human trafficking" />
													)}
												</form.AppField>

												{/* (b.iv) Discrimination */}
												<form.AppField name="discriminationPolicy">
													{(field) => (
														<field.CheckboxField label="Discrimination" />
													)}
												</form.AppField>

												{/* (b.v) Accident prevention */}
												<form.AppField name="accidentPreventionPolicy">
													{(field) => (
														<field.CheckboxField label="Accident prevention" />
													)}
												</form.AppField>

												{/* (b.vi) Other */}
												<form.AppField
													name="hasOtherPolicies"
													listeners={{
														onChange: ({ value, fieldApi }) => {
															if (!value) {
																fieldApi.form.setFieldValue('otherPolicies', '')
															}
														},
													}}
												>
													{(field) => <field.CheckboxField label="Other" />}
												</form.AppField>
											</div>

											{/* Other policies specification — conditional on hasOtherPolicies */}
											<form.Subscribe
												selector={(state) => state.values.hasOtherPolicies}
											>
												{(hasOther) =>
													hasOther ? (
														<form.AppField name="otherPolicies">
															{(field) => (
																<field.TextareaField
																	label="Specify other policies"
																	placeholder="Describe the other policies covered..."
																	rows={2}
																/>
															)}
														</form.AppField>
													) : null
												}
											</form.Subscribe>
										</div>
									) : null
								}
							</form.Subscribe>

							{/* (c) Complaints-handling mechanism */}
							<div className="flex flex-col items-start gap-3">
								<h3 className="text-base font-semibold">
									Complaints-handling Mechanism
								</h3>

								<form.AppField name="hasComplaintsHandlingMechanism">
									{(field) => (
										<field.SwitchField
											label=""
											description="Does the undertaking have a complaints-handling mechanism for its own workforce?"
										/>
									)}
								</form.AppField>
								<form.Subscribe
									selector={(state) =>
										state.values.hasComplaintsHandlingMechanism
									}
								>
									{(hasMechanism) => (
										<span className="text-sm">
											{hasMechanism ? 'Yes' : 'No'}
										</span>
									)}
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
