import { useStore } from '@tanstack/react-form'
import { useStore as useYearStore } from '@tanstack/react-store'
import { FormButtons } from '@/hooks/tanstack-form'
import { useFormSubmission } from '@/hooks/use-form-submission'
import {
	type B10CompensationFormValues,
	b10CompensationSchema,
} from '@/lib/forms/schemas/b10-compensation-schema'
import { yearStore } from '@/lib/year-store'

export function B10CompensationForm() {
	const reportingYear = useYearStore(yearStore, (state) => state.selectedYear)

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

	// Subscribe to minstelonnsansvar field for reactive updates
	const minstelonnsansvar = useStore(
		form.store,
		(state) => state.values.minstelonnsansvar,
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

					{/* Tariffavtaledekning + Gjennomsnittlig opplæring */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<form.AppField name="tariffavtaledekning">
							{(field) => (
								<field.NumberField
									label="Tariffavtaledekning"
									description="Prosentandel ansatte dekket av tariffavtaler"
									unit="%"
									step="0.1"
									min="0"
									max="100"
								/>
							)}
						</form.AppField>

						<form.AppField name="gjennomsnittligOpplaering">
							{(field) => (
								<field.NumberField
									label="Gjennomsnittlig opplæring"
									description="Gjennomsnittlig antall opplæringstimer per ansatt per år"
									step="0.1"
									min="0"
								/>
							)}
						</form.AppField>
					</div>

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
						<span className="text-sm">{minstelonnsansvar ? 'Ja' : 'Nei'}</span>
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
