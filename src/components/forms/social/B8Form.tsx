import { useStore as useYearStore } from '@tanstack/react-store'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FormButtons } from '@/hooks/tanstack-form'
import { useFormSubmission } from '@/hooks/use-form-submission'
import {
	type B8WorkforceFormValues,
	b8WorkforceSchema,
} from '@/lib/forms/schemas/b8-workforce-schema'
import { yearStore } from '@/lib/year-store'

export function B8WorkforceForm() {
	const reportingYear = useYearStore(yearStore, (state) => state.selectedYear)

	const { form, status, isSaving, isLoading, saveDraft, submit, reopen } =
		useFormSubmission<B8WorkforceFormValues>({
			table: 'formSocial',
			reportingYear,
			section: 'workforce',
			schema: b8WorkforceSchema,
			defaultValues: {
				reportingYear: reportingYear.toString(),
				heltidsansatte: 0,
				deltidsansatte: 0,
				midlertidigAnsatte: 0,
				menn: 0,
				kvinner: 0,
				annet: 0,
				ansattePerLand: [],
				eventuellUtfyllendeInfo: '',
			} as B8WorkforceFormValues,
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

					{/* Ansettelsestype */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<form.AppField name="heltidsansatte">
							{(field) => (
								<field.NumberField
									label="Heltidsansatte"
									description="Antall ansatte som jobber standard heltid"
								/>
							)}
						</form.AppField>

						<form.AppField name="deltidsansatte">
							{(field) => (
								<field.NumberField
									label="Deltidsansatte"
									description="Antall ansatte som jobber mindre enn heltid"
								/>
							)}
						</form.AppField>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<form.AppField name="midlertidigAnsatte">
							{(field) => (
								<field.NumberField
									label="Midlertidig ansatte"
									description="Antall ansatte med tidsbegrensede kontrakter"
								/>
							)}
						</form.AppField>
					</div>

					{/* Kjønnsfordeling */}
					<div>
						<h3 className="text-base font-semibold mb-3">Kjønnsfordeling</h3>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<form.AppField name="menn">
								{(field) => <field.NumberField label="Menn" />}
							</form.AppField>

							<form.AppField name="kvinner">
								{(field) => <field.NumberField label="Kvinner" />}
							</form.AppField>

							<form.AppField name="annet">
								{(field) => <field.NumberField label="Annet" />}
							</form.AppField>
						</div>
					</div>

					{/* Ansatte per land */}
					<div>
						<h3 className="text-base font-semibold mb-3">
							Ansatte per land, dersom foretaket driver virksomhet i mer enn ett
							land
						</h3>
						<form.AppField name="ansattePerLand">
							{(field) => (
								<div className="space-y-3">
									{field.state.value?.map((item, i) => (
										<Card key={item.id} className="border">
											<CardContent className="pt-4 pb-3">
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													<form.AppField name={`ansattePerLand[${i}].land`}>
														{(f) => <f.CountryField label="Land" />}
													</form.AppField>

													<form.AppField
														name={`ansattePerLand[${i}].antallAnsatte`}
													>
														{(f) => <f.NumberField label="Antall ansatte" />}
													</form.AppField>
												</div>
												<div className="flex justify-end mt-3">
													<Button
														type="button"
														variant="outline"
														size="sm"
														className="text-destructive border-destructive/20 hover:bg-destructive/10"
														onClick={() => field.removeValue(i)}
														disabled={status === 'submitted'}
													>
														<Trash2 className="h-4 w-4 mr-1" />
														Fjern
													</Button>
												</div>
											</CardContent>
										</Card>
									))}

									<Button
										type="button"
										variant="outline"
										className="w-full"
										onClick={() =>
											field.pushValue({
												id: crypto.randomUUID(),
												land: '',
												antallAnsatte: 0,
											})
										}
										disabled={status === 'submitted'}
									>
										<Plus className="h-4 w-4 mr-2" />
										Legg til land
									</Button>
								</div>
							)}
						</form.AppField>
					</div>

					{/* Eventuell utfyllende info */}
					<form.AppField name="eventuellUtfyllendeInfo">
						{(field) => (
							<field.TextareaField
								label="Eventuell utfyllende info"
								placeholder="Beskriv eventuelle ekstraordinære forhold, endringer i organisering, eller annen relevant kontekst..."
								description="Oppgi eventuell tilleggsinformasjon eller forklaringer til arbeidsstyrkedata"
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
