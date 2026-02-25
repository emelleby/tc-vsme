import { useStore as useYearStore } from '@tanstack/react-store'
import { Card, CardContent } from '@/components/ui/card'
import { FormButtons } from '@/hooks/tanstack-form'
import { useFormSubmission } from '@/hooks/use-form-submission'
import {
	type B5BiodiversityFormValues,
	b5BiodiversitySchema,
} from '@/lib/forms/schemas/b5-biodiversity-schema'
import { yearStore } from '@/lib/year-store'

export function B5BiodiversityForm() {
	const reportingYear = useYearStore(yearStore, (state) => state.selectedYear)

	const { form, status, isSaving, isLoading, saveDraft, submit, reopen } =
		useFormSubmission<B5BiodiversityFormValues>({
			table: 'formEnvironmental',
			reportingYear,
			section: 'biodiversity',
			schema: b5BiodiversitySchema,
			defaultValues: {
				reportingYear: reportingYear.toString(),
				hasSensitiveBiodiversityAreas: false,
				totalAreaHectares: undefined,
				protectedAreaHectares: undefined,
				nonProtectedAreaHectares: undefined,
				protectedSpeciesCount: '',
				redListedSpeciesCount: '',
			} as B5BiodiversityFormValues,
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
							<form.AppField
								name="hasSensitiveBiodiversityAreas"
								listeners={{
									onChange: ({ value, fieldApi }) => {
										if (!value) {
											fieldApi.form.setFieldValue(
												'totalAreaHectares',
												undefined,
											)
											fieldApi.form.setFieldValue(
												'protectedAreaHectares',
												undefined,
											)
											fieldApi.form.setFieldValue(
												'nonProtectedAreaHectares',
												undefined,
											)
										}
									},
								}}
							>
								{(field) => (
									<field.SwitchField label="Har virksomheten aktiviteter i eller nær områder med sensitivt biologisk mangfold?" />
								)}
							</form.AppField>

							<form.Subscribe
								selector={(state) => state.values.hasSensitiveBiodiversityAreas}
							>
								{(hasSensitiveBiodiversityAreas) =>
									hasSensitiveBiodiversityAreas ? (
										<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
											<form.AppField name="totalAreaHectares">
												{(field) => (
													<field.NumberField
														label="Totalt areal"
														unit="hektar"
													/>
												)}
											</form.AppField>

											<form.AppField name="protectedAreaHectares">
												{(field) => (
													<field.NumberField
														label="Forseglet areal"
														unit="hektar"
													/>
												)}
											</form.AppField>

											<form.AppField name="nonProtectedAreaHectares">
												{(field) => (
													<field.NumberField
														label="Ikke-forseglet areal"
														unit="hektar"
													/>
												)}
											</form.AppField>
										</div>
									) : null
								}
							</form.Subscribe>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<form.AppField name="protectedSpeciesCount">
									{(field) => (
										<field.TextField
											label="Beskyttede arter"
											description="Antall beskyttede arter i driftsområder"
										/>
									)}
								</form.AppField>

								<form.AppField name="redListedSpeciesCount">
									{(field) => (
										<field.TextField
											label="Rødlistarter"
											description="Antall rødlistarter påvirket av drift"
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
