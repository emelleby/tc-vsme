import { useStore } from '@tanstack/react-form'
import { useStore as useYearStore } from '@tanstack/react-store'
import { useQuery } from 'convex/react'
import { Card, CardContent } from '@/components/ui/card'
import { FormButtons } from '@/hooks/tanstack-form'
import { useFormSubmission } from '@/hooks/use-form-submission'
import { useOrgGuard } from '@/hooks/use-org-guard'
import {
	type B10CompensationFormValues,
	b10CompensationSchema,
} from '@/lib/forms/schemas/b10-compensation-schema'
import { yearStore } from '@/lib/year-store'
import { api } from '../../../../convex/_generated/api'

export function B10CompensationForm() {
	const reportingYear = useYearStore(yearStore, (state) => state.selectedYear)
	const { organization, skipQuery } = useOrgGuard()

	// Fetch general form to get total employees
	const generalForm = useQuery(
		api.forms.get.getForm,
		skipQuery
			? 'skip'
			: {
					table: 'formGeneral',
					reportingYear,
					section: 'companyInfo',
				},
	)

	const totalEmployees = generalForm?.data?.employees ?? 0

	const { form, status, isSaving, isLoading, saveDraft, submit, reopen } =
		useFormSubmission<B10CompensationFormValues>({
			table: 'formSocial',
			reportingYear,
			section: 'compensationCollective',
			schema: b10CompensationSchema,
			defaultValues: {
				reportingYear: reportingYear.toString(),
				minstelonnsansvar: false,
			} as B10CompensationFormValues,
		})

	// Subscribe to fields for reactive updates
	const minstelonnsansvar = useStore(
		form.store,
		(state) => state.values.minstelonnsansvar,
	)

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
							{/* Minstelønnsansvar */}
							<div className="flex flex-col items-start gap-3">
								<h3 className="text-base font-semibold">Minstelønnsansvar</h3>
								<form.AppField name="minstelonnsansvar">
									{(field) => (
										<field.SwitchField
											label=""
											description="Mottar de ansatte lønn som er lik eller over minstelønnen i landet det opereres i?"
										/>
									)}
								</form.AppField>
								<span className="text-sm">
									{minstelonnsansvar ? 'Ja' : 'Nei'}
								</span>
							</div>

							{/* Tariffavtaledekning + Gjennomsnittlig opplæring */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<form.AppField name="hourlyPayMale">
									{(field) => (
										<field.NumberField
											label="Gjennomsnittlig timeslønn for menn"
											description=""
											step="0.1"
											min="0"
											unit="EUR"
										/>
									)}
								</form.AppField>
								<form.AppField name="hourlyPayFemale">
									{(field) => (
										<field.NumberField
											label="Gjennomsnittlig timeslønn for kvinner"
											description=""
											unit="EUR"
											step="0.1"
											min="0"
										/>
									)}
								</form.AppField>
								{/* Tariffavtaledekning + Gjennomsnittlig opplæring */}
								<form.AppField
									name="collectiveBargainingAgreement"
									listeners={{
										onChange: ({ value, fieldApi }) => {
											if (totalEmployees > 0 && value !== undefined) {
												const share = (value / totalEmployees) * 100
												fieldApi.form.setFieldValue(
													'collectiveBargainingShare',
													Math.round(share * 10) / 10,
												)
											} else {
												fieldApi.form.setFieldValue(
													'collectiveBargainingShare',
													0,
												)
											}
										},
									}}
								>
									{(field) => (
										<field.NumberField
											label="Kollektive forhandlinger"
											description="Antall medarbeidere dekket av kollektive forhandlinger/tariffavtaler."
											step="1"
											min="0"
										/>
									)}
								</form.AppField>
								<form.AppField name="collectiveBargainingShare">
									{(field) => (
										<field.NumberField
											label="Kollektiv dekning (%)"
											description={`Prosentandel ansatte dekket av tariffavtaler (av totalt ${totalEmployees})`}
											unit="%"
											step="0.1"
											min="0"
											max="100"
											disabled
										/>
									)}
								</form.AppField>
							</div>
						</fieldset>
					</CardContent>
				</Card>

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
