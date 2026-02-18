import { useStore as useYearStore } from '@tanstack/react-store'
import { Card, CardContent } from '@/components/ui/card'
import { FormButtons } from '@/hooks/tanstack-form'
import { useFormSubmission } from '@/hooks/use-form-submission'
import {
	type C4ClimateRiskFormValues,
	c4ClimateRiskSchema,
} from '@/lib/forms/schemas/c4-climate-risk-schema'
import { yearStore } from '@/lib/year-store'

export function C4ClimateRiskForm() {
	const reportingYear = useYearStore(yearStore, (state) => state.selectedYear)

	const { form, status, isSaving, isLoading, saveDraft, submit, reopen } =
		useFormSubmission<C4ClimateRiskFormValues>({
			table: 'formEnvironmental',
			reportingYear,
			section: 'climateRiskAnalysis',
			schema: c4ClimateRiskSchema,
			defaultValues: {
				reportingYear: reportingYear.toString(),
				climateRiskDescription: '',
			} as C4ClimateRiskFormValues,
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
								label="Reporting Year"
								placeholder="YYYY"
								hidden
							/>
						)}
					</form.AppField>

					<Card>
						<CardContent className="pt-6 space-y-6">
							<form.AppField name="climateRiskDescription">
								{(field) => (
									<field.TextareaField
										label="Description of climate risks"
										placeholder="Describe potential climate risks that may affect the business, including physical risks (extreme weather, temperature changes) and transition risks (new regulations, technological changes)..."
										rows={8}
										description="Describe how climate change may affect the business (physical and transition risks)."
									/>
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
