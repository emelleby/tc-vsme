import { useStore as useYearStore } from '@tanstack/react-store'
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
		label: 'Child Labor',
		description: 'Confirmed incidents of child labor in own workforce',
		measuresLabel: 'Measures taken – Child Labor',
	},
	{
		boolField: 'forcedLabor' as const,
		measuresField: 'forcedLaborMeasures' as const,
		label: 'Forced Labor',
		description: 'Confirmed incidents of forced labor in own workforce',
		measuresLabel: 'Measures taken – Forced Labor',
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
			} as C7SeriousHumanRightsValues,
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
