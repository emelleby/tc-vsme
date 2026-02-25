import { useStore as useYearStore } from '@tanstack/react-store'
import { useQuery } from 'convex/react'
import React from 'react'
import { FormButtons } from '@/hooks/tanstack-form'
import { useFormSubmission } from '@/hooks/use-form-submission'
import { useOrgGuard } from '@/hooks/use-org-guard'
import {
	type C1BusinessModelFormValues,
	c1BusinessModelSchema,
} from '@/lib/forms/schemas/c1-business-model-schema'
import { yearStore } from '@/lib/year-store'
import { api } from '../../../convex/_generated/api'

export function C1BusinessModelForm() {
	const reportingYear = useYearStore(yearStore, (state) => state.selectedYear)

	// Guard against race conditions during org switching
	const { organization, skipQuery } = useOrgGuard()
	const orgData = useQuery(
		api.organizations.getByClerkOrgId,
		skipQuery || { clerkOrgId: organization?.id ?? '' },
	)

	const {
		form,
		status,
		isSaving,
		isLoading,
		existingData,
		saveDraft,
		submit,
		reopen,
	} = useFormSubmission<C1BusinessModelFormValues>({
		table: 'formGeneral',
		reportingYear,
		section: 'businessModel',
		schema: c1BusinessModelSchema,
		defaultValues: {
			reportingYear: reportingYear.toString(),
			businessModel: orgData?.businessModel || '',
		} as C1BusinessModelFormValues,
	})

	// Update form when orgData loads and there's no existing form data
	React.useEffect(() => {
		if (orgData && !existingData?.draftData && !existingData?.data) {
			form.setFieldValue('businessModel', orgData.businessModel || '')
		}
	}, [orgData, existingData, form])

	if (isLoading || !orgData) {
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
					{/* Hidden reporting year field */}
					<form.AppField name="reportingYear">
						{(field) => (
							<field.TextField
								label="Reporting Year"
								placeholder="YYYY"
								hidden
							/>
						)}
					</form.AppField>

					{/* Business Model Textarea */}
					<form.AppField name="businessModel">
						{(field) => (
							<field.TextareaField
								label="Business Model"
								placeholder="Describe your organization's business model..."
								rows={8}
								description="Provide a description of your organization's business model, including key activities, value propositions, and revenue streams."
							/>
						)}
					</form.AppField>
				</fieldset>

				<FormButtons
					status={status}
					isSaving={isSaving}
					onSaveDraft={saveDraft}
					onSubmit={submit}
					onReopen={reopen}
				/>
			</form>
		</form.AppForm>
	)
}
