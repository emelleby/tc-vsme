import { useStore as useYearStore } from '@tanstack/react-store'
import { FormButtons } from '@/hooks/tanstack-form'
import { useFormSubmission } from '@/hooks/use-form-submission'
import {
	type B11WorkLifeBalanceFormValues,
	b11WorkLifeBalanceSchema,
} from '@/lib/forms/schemas/b11-work-life-balance-schema'
import { yearStore } from '@/lib/year-store'

export function B11WorkLifeBalanceForm() {
	const reportingYear = useYearStore(yearStore, (state) => state.selectedYear)

	const { form, status, isSaving, isLoading, saveDraft, submit, reopen } =
		useFormSubmission<B11WorkLifeBalanceFormValues>({
			table: 'formSocial',
			reportingYear,
			section: 'workLifeBalance',
			schema: b11WorkLifeBalanceSchema,
			defaultValues: {
				reportingYear: reportingYear.toString(),
				femaleParentalLeave: 0,
				maleParentalLeave: 0,
				parentalLeavePolicyDescription: '',
			} as B11WorkLifeBalanceFormValues,
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
						<form.AppField name="femaleParentalLeave">
							{(field) => (
								<field.NumberField
									label="Female Parental Leave"
									description="Antall kvinner som tok foreldrepermisjon i rapporteringsperioden"
								/>
							)}
						</form.AppField>

						<form.AppField name="maleParentalLeave">
							{(field) => (
								<field.NumberField
									label="Male Parental Leave"
									description="Antall menn som tok foreldrepermisjon i rapporteringsperioden"
								/>
							)}
						</form.AppField>
					</div>

					<form.AppField name="parentalLeavePolicyDescription">
						{(field) => (
							<field.TextareaField
								label="Parental Leave Policy Description"
								placeholder="Describe the company's parental leave agreements, and other relevant information about leave, pregnancy, or similar matters."
								description="Describe the company's parental leave agreements and other relevant information"
								rows={6}
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
