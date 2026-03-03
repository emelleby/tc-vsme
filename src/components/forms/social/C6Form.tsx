import { useStore as useYearStore } from '@tanstack/react-store'
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
				childLaborPolicy: false,
				forcedLaborPolicy: false,
				humanTraffickingPolicy: false,
				discriminationPolicy: false,
				otherPolicies: '',
			} as C6HumanRightsPoliciesValues,
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
						<form.AppField name="childLaborPolicy">
							{(field) => (
								<field.CheckboxField label="Child Labor Policy" />
							)}
						</form.AppField>

						<form.AppField name="forcedLaborPolicy">
							{(field) => (
								<field.CheckboxField label="Forced Labor Policy" />
							)}
						</form.AppField>

						<form.AppField name="humanTraffickingPolicy">
							{(field) => (
								<field.CheckboxField label="Human Trafficking Policy" />
							)}
						</form.AppField>

						<form.AppField name="discriminationPolicy">
							{(field) => (
								<field.CheckboxField label="Discrimination Policy" />
							)}
						</form.AppField>
					</div>

					<form.AppField name="otherPolicies">
						{(field) => (
							<field.TextareaField
								label="Other Policies"
								rows={2}
							/>
						)}
					</form.AppField>
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
