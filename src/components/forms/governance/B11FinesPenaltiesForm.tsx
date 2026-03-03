import { useStore } from '@tanstack/react-form'
import { useStore as useYearStore } from '@tanstack/react-store'
import { FormButtons } from '@/hooks/tanstack-form'
import { useFormSubmission } from '@/hooks/use-form-submission'
import {
	type B11FinesPenaltiesValues,
	b11FinesPenaltiesSchema,
} from '@/lib/forms/schemas/b11-fines-penalties-schema'
import { yearStore } from '@/lib/year-store'

export function B11FinesPenaltiesForm() {
	const reportingYear = useYearStore(yearStore, (state) => state.selectedYear)

	const { form, status, isSaving, isLoading, saveDraft, submit, reopen } =
		useFormSubmission<B11FinesPenaltiesValues>({
			table: 'formGovernance',
			reportingYear,
			section: 'finesPenalties',
			schema: b11FinesPenaltiesSchema,
			defaultValues: {
				reportingYear: reportingYear.toString(),
				hasCorruptionFines: false,
				corruptionFinesDescription: '',
			} as B11FinesPenaltiesValues,
		})

	// Subscribe to branch field for reactive updates
	const hasCorruptionFines = useStore(
		form.store,
		(state) => state.values.hasCorruptionFines,
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

					<div className="flex flex-col items-start gap-3">
						<h3 className="text-base font-semibold">
							B11 Bøter og straffer for korrupsjon
						</h3>

						<form.AppField
							name="hasCorruptionFines"
							listeners={{
								onChange: ({ value, fieldApi }) => {
									if (!value) {
										fieldApi.form.setFieldValue('corruptionFinesDescription', '')
									}
								},
							}}
						>
							{(field) => (
								<field.SwitchField
									label=""
									description="Has fines or penalties during the period related to violations of anti-corruption or anti-bribery laws?"
								/>
							)}
						</form.AppField>
						<span className="text-sm">{hasCorruptionFines ? 'Ja' : 'Nei'}</span>

						<form.Subscribe selector={(state) => state.values.hasCorruptionFines}>
							{(hasFines) =>
								hasFines ? (
									<form.AppField name="corruptionFinesDescription">
										{(field) => (
											<field.TextareaField
												label="Description"
												placeholder="Provide more information..."
												rows={4}
											/>
										)}
									</form.AppField>
								) : null
							}
						</form.Subscribe>
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
