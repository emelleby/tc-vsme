import { useStore as useYearStore } from '@tanstack/react-store'
import { Card, CardContent } from '@/components/ui/card'
import { FormButtons } from '@/hooks/tanstack-form'
import { useFormSubmission } from '@/hooks/use-form-submission'
import {
	type B6WaterFormValues,
	b6WaterSchema,
} from '@/lib/forms/schemas/b6-water-schema'
import { yearStore } from '@/lib/year-store'

export function B6WaterManagementForm() {
	const reportingYear = useYearStore(yearStore, (state) => state.selectedYear)

	const { form, status, isSaving, isLoading, saveDraft, submit, reopen } =
		useFormSubmission<B6WaterFormValues>({
			table: 'formEnvironmental',
			reportingYear,
			section: 'waterManagement',
			schema: b6WaterSchema,
			defaultValues: {
				reportingYear: reportingYear.toString(),
				waterConsumption: undefined,
				waterStress: undefined,
			} as B6WaterFormValues,
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
						<CardContent className="pt-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<form.AppField name="waterConsumption">
									{(field) => (
										<field.NumberField
											label="Water Consumption"
											unit="m³"
											description="Total water consumption in cubic meters"
										/>
									)}
								</form.AppField>

								<form.AppField name="waterStress">
									{(field) => (
										<field.NumberField
											label="Water Stress"
											unit="%"
											description="Percentage of operations in water-stressed areas"
										/>
									)}
								</form.AppField>
							</div>
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
