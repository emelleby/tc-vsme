import { useStore as useYearStore } from '@tanstack/react-store'
import { Card, CardContent } from '@/components/ui/card'
import { FormButtons } from '@/hooks/tanstack-form'
import { useFormSubmission } from '@/hooks/use-form-submission'
import {
	type C2Scope3EmissionsFormValues,
	c2Scope3EmissionsSchema,
	SCOPE_3_CATEGORIES,
} from '@/lib/forms/schemas/c2-scope3-emissions-schema'
import { yearStore } from '@/lib/year-store'

export function C2Scope3EmissionsForm() {
	const reportingYear = useYearStore(yearStore, (state) => state.selectedYear)

	const { form, status, isSaving, isLoading, saveDraft, submit, reopen } =
		useFormSubmission<C2Scope3EmissionsFormValues>({
			table: 'formEnvironmental',
			reportingYear,
			section: 'scope3Emissions',
			schema: c2Scope3EmissionsSchema,
			defaultValues: {
				reportingYear: reportingYear.toString(),
				totalScope3Emissions: 0,
				category1: 0,
				category2: 0,
				category3: 0,
				category4: 0,
				category5: 0,
				category6: 0,
				category7: 0,
				category8: 0,
				category9: 0,
				category10: 0,
				category11: 0,
				category12: 0,
				category13: 0,
				category14: 0,
				category15: 0,
			} as C2Scope3EmissionsFormValues,
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
							<form.AppField name="totalScope3Emissions">
								{(field) => (
									<field.NumberField
										label="Total Scope 3 Emissions"
										unit="tCO₂e"
										description="Total indirect emissions in value chain"
									/>
								)}
							</form.AppField>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="pt-6">
							<h3 className="text-base font-medium mb-6">Scope 3 Categories</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{SCOPE_3_CATEGORIES.map((cat) => (
									<form.AppField
										key={cat.number}
										name={`category${cat.number}`}
									>
										{(field) => (
											<field.NumberField
												label={`${cat.name} (cat. ${cat.number})`}
												unit="tCO₂e"
												description={`Emissions from ${cat.name.toLowerCase()}`}
											/>
										)}
									</form.AppField>
								))}
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
