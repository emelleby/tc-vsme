import { useStore as useYearStore } from '@tanstack/react-store'
import { FormButtons } from '@/hooks/tanstack-form'
import { useFormSubmission } from '@/hooks/use-form-submission'
import {
	type B9HealthSafetyFormValues,
	b9HealthSafetySchema,
} from '@/lib/forms/schemas/b9-health-safety-schema'
import { yearStore } from '@/lib/year-store'

export function B9HealthSafetyForm() {
	const reportingYear = useYearStore(yearStore, (state) => state.selectedYear)

	const { form, status, isSaving, isLoading, saveDraft, submit, reopen } =
		useFormSubmission<B9HealthSafetyFormValues>({
			table: 'formSocial',
			reportingYear,
			section: 'healthSafety',
			schema: b9HealthSafetySchema,
			defaultValues: {
				reportingYear: reportingYear.toString(),
				eventuellUtfyllendeInfo: '',
			} as B9HealthSafetyFormValues,
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

					{/* Arbeidsulykker + Sykefravær */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<form.AppField name="arbeidsulykker">
							{(field) => (
								<field.NumberField
									label="Arbeidsulykker"
									description="Antall rapporterte arbeidsulykker i perioden"
								/>
							)}
						</form.AppField>

						<form.AppField name="sykefravarProsent">
							{(field) => (
								<field.NumberField
									label="Sykefravær"
									description="Sykefravær i prosent"
									unit="%"
									step="0.1"
									min="0"
									max="100"
								/>
							)}
						</form.AppField>
					</div>

					{/* HMS-opplæring + Omkomne */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<form.AppField name="hmsOpplaering">
							{(field) => (
								<field.NumberField
									label="HMS-opplæring"
									description="Totalt antall timer med HMS-opplæring"
								/>
							)}
						</form.AppField>

						<form.AppField name="omkomne">
							{(field) => (
								<field.NumberField
									label="Omkomne"
									description="Antall omkomne som følge av arbeidsskader eller arbeidsrelatert helse"
								/>
							)}
						</form.AppField>
					</div>

					{/* Eventuell utfyllende info */}
					<form.AppField name="eventuellUtfyllendeInfo">
						{(field) => (
							<field.TextareaField
								label="Eventuell utfyllende info"
								placeholder="Beskriv eventuelle ekstraordinære hendelser, forbedringstiltak, eller annen relevant kontekst..."
								description="Oppgi eventuell tilleggsinformasjon eller forklaringer til helse- og sikkerhetsdata"
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

