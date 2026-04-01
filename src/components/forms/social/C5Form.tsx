import { useStore as useYearStore } from '@tanstack/react-store'
import { useQuery } from 'convex/react'
import { Info } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { FormButtons } from '@/hooks/tanstack-form'
import { useFormSubmission } from '@/hooks/use-form-submission'
import { useOrgGuard } from '@/hooks/use-org-guard'
import {
	type C5AdditionalWorkforceValues,
	c5AdditionalWorkforceSchema,
} from '@/lib/forms/schemas/c5-additional-workforce-schema'
import { yearStore } from '@/lib/year-store'
import { api } from '../../../../convex/_generated/api'

export function C5AdditionalWorkforceForm() {
	const reportingYear = useYearStore(yearStore, (state) => state.selectedYear)
	const { skipQuery } = useOrgGuard()

	// Fetch general form to get total employees (same pattern as B10)
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
	const isLargeUndertaking = totalEmployees >= 50

	const { form, status, isSaving, isLoading, saveDraft, submit, reopen } =
		useFormSubmission<C5AdditionalWorkforceValues>({
			table: 'formSocial',
			reportingYear,
			section: 'additionalWorkforce',
			schema: c5AdditionalWorkforceSchema,
			defaultValues: {
				reportingYear: reportingYear.toString(),
			} as C5AdditionalWorkforceValues,
			transformBeforeSave: (values) => {
				const result: Record<string, unknown> = { ...values }
				// Compute ratio only when both values are provided
				if (
					values.maleManagers != null &&
					values.femaleManagers != null &&
					values.femaleManagers > 0
				) {
					result.managementGenderRatio =
						values.maleManagers / values.femaleManagers
				} else {
					delete result.maleManagers
					delete result.femaleManagers
					delete result.managementGenderRatio
				}
				// Strip undefined/null optional fields to avoid sending 0 for blank fields
				// for (const key of ['selfEmployedWorkers', 'contractWorkers'] as const) {
				// 	if (result[key] === undefined || result[key] === null) {
				// 		delete result[key]
				// 	}
				// }
				return result as C5AdditionalWorkforceValues
			},
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
				<Card>
					<CardContent>
						{!isLargeUndertaking && (
							<Alert variant="info" className="mb-6 border-l-4">
								<Info />
								<AlertTitle>
									About Additional (general) workforce characteristics
								</AlertTitle>
								<AlertDescription>
									If the undertaking employs 50 or more employees, it may
									disclose the female-to-male ratio at management level and the
									number of self-employed workers and contract workers.
								</AlertDescription>
							</Alert>
						)}
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

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<form.AppField name="maleManagers">
									{(field) => (
										<field.NumberField
											label="Male Managers"
											description="Number of male employees at management level"
										/>
									)}
								</form.AppField>

								<form.AppField name="femaleManagers">
									{(field) => (
										<field.NumberField
											label="Female Managers"
											description="Number of female employees at management level"
										/>
									)}
								</form.AppField>
								<form.AppField name="selfEmployedWorkers">
									{(field) => (
										<field.NumberField
											label="Self-employed Workers"
											description="Number of self-employed individuals working for the organization"
										/>
									)}
								</form.AppField>

								<form.AppField name="contractWorkers">
									{(field) => (
										<field.NumberField
											label="Contract Workers"
											description="Number of workers on contract or temporary arrangements"
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
