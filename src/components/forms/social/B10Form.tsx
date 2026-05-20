import { useStore } from '@tanstack/react-form'
import { useStore as useYearStore } from '@tanstack/react-store'
import { useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { FormButtons } from '@/hooks/tanstack-form'
import { useFormSubmission } from '@/hooks/use-form-submission'
import {
	type B10CompensationFormValues,
	b10CompensationSchema,
} from '@/lib/forms/schemas/b10-compensation-schema'
import { yearStore } from '@/lib/year-store'

interface B10CompensationFormProps {
	totalEmployees: number
}

export function B10CompensationForm({
	totalEmployees,
}: B10CompensationFormProps) {
	const reportingYear = useYearStore(yearStore, (state) => state.selectedYear)

	const { form, status, isSaving, isLoading, saveDraft, submit, reopen } =
		useFormSubmission<B10CompensationFormValues>({
			table: 'formSocial',
			reportingYear,
			section: 'compensationCollective',
			schema: b10CompensationSchema,
			transformBeforeSave: (values) => {
				const malePay = values.hourlyPayMale
				const femalePay = values.hourlyPayFemale
				let genderPayGap = 0

				if (malePay > 0 && femalePay > 0) {
					genderPayGap = (malePay - femalePay) / malePay
				}

				const agreement = values.collectiveBargainingAgreement
				let collectiveBargainingShare = 0
				if (totalEmployees > 0 && agreement !== undefined) {
					collectiveBargainingShare = agreement / totalEmployees
				}

				return {
					...values,
					genderPayGap,
					collectiveBargainingShare,
				}
			},
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

	const collectiveBargainingAgreement = useStore(
		form.store,
		(state) => state.values.collectiveBargainingAgreement,
	)

	// Since we calculate it as a percentage for display but save as 0-1 ratio
	const displayValue =
		totalEmployees > 0 && collectiveBargainingAgreement !== undefined
			? Math.round(
					(collectiveBargainingAgreement / totalEmployees) * 100 * 10,
				) / 10
			: 0

	const collectiveBargainingShare = useStore(
		form.store,
		(state) => state.values.collectiveBargainingShare,
	)

	// Sync the calculated display percentage back to the form state for purely visual
	// feedback. transformBeforeSave correct it back to a 0-1 ratio when saving.
	// We monitor the form's state to prevent Convex syncs (which push the 0-1 ratio)
	// from overriding the UI's 0-100 percentage layout.
	useEffect(() => {
		if (collectiveBargainingShare !== displayValue) {
			form.setFieldValue('collectiveBargainingShare', displayValue)
		}
	}, [displayValue, collectiveBargainingShare, form])

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

							{/* Hourly Pay */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<form.AppField name="hourlyPayMale">
									{(field) => (
										<field.NumberField
											label="Gjennomsnittlig timeslønn for menn"
											description="Kan utelates for selskaper under 150 ansatte"
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
											description="Kan utelates for selskaper under 150 ansatte"
											unit="EUR"
											step="0.1"
											min="0"
										/>
									)}
								</form.AppField>

								{/* Training Hours */}
								<form.AppField name="trainingHoursMale">
									{(field) => (
										<field.NumberField
											label="Opplæring for menn"
											description="Gjennomsnittlig årlig opplæring for menn"
											step="0.1"
											min="0"
											unit="Timer"
										/>
									)}
								</form.AppField>
								<form.AppField name="trainingHoursFemale">
									{(field) => (
										<field.NumberField
											label="Opplæring for kvinner"
											description="Gjennomsnittlig årlig opplæring for kvinner"
											unit="Timer"
											step="0.1"
											min="0"
										/>
									)}
								</form.AppField>
								{/* Tariffavtaledekning */}
								<form.AppField name="collectiveBargainingAgreement">
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
