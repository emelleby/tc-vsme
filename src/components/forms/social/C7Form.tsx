import { useStore } from '@tanstack/react-form'
import { useStore as useYearStore } from '@tanstack/react-store'
import { Card, CardContent } from '@/components/ui/card'
import { FormButtons } from '@/hooks/tanstack-form'
import { useFormSubmission } from '@/hooks/use-form-submission'
import {
	type C7SeriousHumanRightsValues,
	c7SeriousHumanRightsSchema,
} from '@/lib/forms/schemas/c7-serious-human-rights-schema'
import { yearStore } from '@/lib/year-store'

const INCIDENT_ITEMS = [
	{
		boolField: 'childLabor' as const,
		measuresField: 'childLaborMeasures' as const,
		label: 'Child Labour',
		description: 'Confirmed incidents of child labour in own workforce',
		measuresLabel: 'Measures taken – Child Labour',
	},
	{
		boolField: 'forcedLabor' as const,
		measuresField: 'forcedLaborMeasures' as const,
		label: 'Forced Labour',
		description: 'Confirmed incidents of forced labour in own workforce',
		measuresLabel: 'Measures taken – Forced Labour',
	},
	{
		boolField: 'humanTrafficking' as const,
		measuresField: 'humanTraffickingMeasures' as const,
		label: 'Human Trafficking',
		description: 'Confirmed incidents of human trafficking in own workforce',
		measuresLabel: 'Measures taken – Human Trafficking',
	},
	{
		boolField: 'discrimination' as const,
		measuresField: 'discriminationMeasures' as const,
		label: 'Discrimination',
		description: 'Confirmed incidents of discrimination in own workforce',
		measuresLabel: 'Measures taken – Discrimination',
	},
	{
		boolField: 'other' as const,
		measuresField: 'otherMeasures' as const,
		label: 'Other',
		description: 'Other confirmed serious human rights violations',
		measuresLabel: 'Measures taken – Other',
	},
] satisfies {
	boolField: keyof C7SeriousHumanRightsValues
	measuresField: keyof C7SeriousHumanRightsValues
	label: string
	description: string
	measuresLabel: string
}[]

export function C7SeriousHumanRightsForm() {
	const reportingYear = useYearStore(yearStore, (state) => state.selectedYear)

	const { form, status, isSaving, isLoading, saveDraft, submit, reopen } =
		useFormSubmission<C7SeriousHumanRightsValues>({
			table: 'formSocial',
			reportingYear,
			section: 'seriousHumanRightsIncidents',
			schema: c7SeriousHumanRightsSchema,
			defaultValues: {
				reportingYear: reportingYear.toString(),
				childLabor: false,
				childLaborMeasures: '',
				forcedLabor: false,
				forcedLaborMeasures: '',
				humanTrafficking: false,
				humanTraffickingMeasures: '',
				discrimination: false,
				discriminationMeasures: '',
				other: false,
				otherMeasures: '',
				hasValueChainIncidents: false,
				valueChainIncidentsDescription: '',
			} as C7SeriousHumanRightsValues,
		})

	// Subscribe to value chain gate for reactive display
	const hasValueChainIncidents = useStore(
		form.store,
		(state) => state.values.hasValueChainIncidents,
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

							{/* (a) Confirmed incidents in own workforce */}
							<div className="flex flex-col items-start gap-3">
								<h3 className="text-base font-semibold">
									Confirmed Incidents – Own Workforce
								</h3>
								<p className="text-sm text-muted-foreground">
									Does the undertaking have confirmed incidents in its own
									workforce related to:
								</p>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{INCIDENT_ITEMS.map((item) => (
									<div key={item.boolField} className="flex flex-col gap-2">
										<form.AppField
											name={item.boolField}
											listeners={{
												onChange: ({ value, fieldApi }) => {
													if (!value) {
														fieldApi.form.setFieldValue(item.measuresField, '')
													}
												},
											}}
										>
											{(field) => (
												<field.CheckboxField
													label={item.label}
													description={item.description}
												/>
											)}
										</form.AppField>

										<form.Subscribe
											selector={(state) => state.values[item.boolField]}
										>
											{(isChecked) =>
												isChecked ? (
													<form.AppField name={item.measuresField}>
														{(field) => (
															<field.TextareaField
																label={item.measuresLabel}
																placeholder="Describe the measures taken to address this incident..."
																rows={3}
															/>
														)}
													</form.AppField>
												) : null
											}
										</form.Subscribe>
									</div>
								))}
							</div>

							{/* (c) Value chain / affected communities / consumers incidents */}
							<div className="flex flex-col items-start gap-3 pt-4 border-t">
								<h3 className="text-base font-semibold">
									Incidents in Value Chain
								</h3>

								<form.AppField
									name="hasValueChainIncidents"
									listeners={{
										onChange: ({ value, fieldApi }) => {
											if (!value) {
												fieldApi.form.setFieldValue(
													'valueChainIncidentsDescription',
													'',
												)
											}
										},
									}}
								>
									{(field) => (
										<field.SwitchField
											label=""
											description="Is the undertaking aware of any confirmed incidents involving workers in the value chain, affected communities, consumers and end-users?"
										/>
									)}
								</form.AppField>
								<span className="text-sm">
									{hasValueChainIncidents ? 'Yes' : 'No'}
								</span>

								<form.Subscribe
									selector={(state) => state.values.hasValueChainIncidents}
								>
									{(hasIncidents) =>
										hasIncidents ? (
											<form.AppField name="valueChainIncidentsDescription">
												{(field) => (
													<field.TextareaField
														label="Specify incidents"
														placeholder="Describe the confirmed incidents involving workers in the value chain, affected communities, consumers and end-users..."
														rows={4}
													/>
												)}
											</form.AppField>
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
