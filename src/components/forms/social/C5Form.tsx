import { useStore as useYearStore } from '@tanstack/react-store'
import { FormButtons } from '@/hooks/tanstack-form'
import { useFormSubmission } from '@/hooks/use-form-submission'
import {
	type C5AdditionalWorkforceValues,
	c5AdditionalWorkforceSchema,
} from '@/lib/forms/schemas/c5-additional-workforce-schema'
import { yearStore } from '@/lib/year-store'

export function C5AdditionalWorkforceForm() {
	const reportingYear = useYearStore(yearStore, (state) => state.selectedYear)

	const { form, status, isSaving, isLoading, saveDraft, submit, reopen } =
		useFormSubmission<C5AdditionalWorkforceValues>({
			table: 'formSocial',
			reportingYear,
			section: 'additionalWorkforce',
			schema: c5AdditionalWorkforceSchema,
			defaultValues: {
				reportingYear: reportingYear.toString(),
				selfEmployedWorkers: 0,
				contractWorkers: 0,
			} as C5AdditionalWorkforceValues,
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

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<form.AppField name="selfEmployedWorkers">
							{(field) => (
								<field.NumberField
									label="Self-employed Workers"
									description="Number of self-employed individuals working for the organization"
								/>
							)}
						</form.AppField>

						<form.AppField name="contractWorkers">
							{(field) => (
								<field.NumberField
									label="Contract Workers"
									description="Number of workers on contract or temporary arrangements"
								/>
							)}
						</form.AppField>
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
