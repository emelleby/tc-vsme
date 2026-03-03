import { useStore as useYearStore } from '@tanstack/react-store'
import { FormButtons } from '@/hooks/tanstack-form'
import { useFormSubmission } from '@/hooks/use-form-submission'
import {
	type C9BoardCompositionValues,
	c9BoardCompositionSchema,
} from '@/lib/forms/schemas/c9-board-composition-schema'
import { yearStore } from '@/lib/year-store'

export function C9BoardCompositionForm() {
	const reportingYear = useYearStore(yearStore, (state) => state.selectedYear)

	const { form, status, isSaving, isLoading, saveDraft, submit, reopen } =
		useFormSubmission<C9BoardCompositionValues>({
			table: 'formGovernance',
			reportingYear,
			section: 'boardComposition',
			schema: c9BoardCompositionSchema,
			defaultValues: {
				reportingYear: reportingYear.toString(),
				totalMembers: 0,
				femaleMembers: 0,
				maleMembers: 0,
				otherMembers: 0,
			} as C9BoardCompositionValues,
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

					<div className="text-sm font-medium">C9  Styrets kjønnsbalanse</div>

					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<form.AppField name="totalMembers">
							{(field) => (
								<field.NumberField 
									label="Total Members" 
									description="Total number of board members" 
								/>
							)}
						</form.AppField>

						<form.AppField name="femaleMembers">
							{(field) => (
								<field.NumberField 
									label="Female Members" 
									description="Number of female board members" 
								/>
							)}
						</form.AppField>

						<form.AppField name="maleMembers">
							{(field) => (
								<field.NumberField 
									label="Male Members" 
									description="Number of male board members" 
								/>
							)}
						</form.AppField>

						<form.AppField name="otherMembers">
							{(field) => (
								<field.NumberField 
									label="Other Members" 
									description="Number of board members with other gender identities" 
								/>
							)}
						</form.AppField>
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
