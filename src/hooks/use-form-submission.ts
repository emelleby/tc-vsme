import { useMutation, useQuery } from 'convex/react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { api } from '../../convex/_generated/api'
import type { FormSection, FormTable } from '../../convex/forms/_utils'
import { useAppForm } from './tanstack-form'
import { focusFirstError } from './use-form'
import { useOrgGuard } from './use-org-guard'

interface UseFormSubmissionProps<TData> {
	table: FormTable
	reportingYear: number
	section: FormSection // NEW
	defaultValues: TData
	schema: import('zod').ZodType<TData>
}

export function useFormSubmission<TData>({
	table,
	reportingYear,
	section, // NEW
	defaultValues,
	schema,
}: UseFormSubmissionProps<TData>) {
	// Guard against race conditions during org switching
	const { skipQuery } = useOrgGuard()

	// Fetch existing data
	const existingData = useQuery(
		api.forms.get.getForm,
		skipQuery || {
			table,
			reportingYear,
			section, // NEW
		},
	)

	const saveForm = useMutation(api.forms.save.saveForm)
	const [isSaving, setIsSaving] = useState(false)

	const submitFormMutation = useMutation(api.forms.submit.submitForm)
	const reopenFormMutation = useMutation(api.forms.reopen.reopenForm)
	const rollbackMutation = useMutation(api.forms.rollback.rollbackToVersion)

	// Initialize form
	const form = useAppForm({
		defaultValues: (existingData?.draftData ||
			existingData?.data ||
			defaultValues) as TData,
		validators: {
			onSubmit: schema,
		},
		onSubmitInvalid: ({ formApi }) => {
			focusFirstError(formApi)
		},
		onSubmit: async ({ value }) => {
			await handleFinalSubmit(value)
		},
	})

	const handleSaveDraft = async (data?: TData) => {
		try {
			setIsSaving(true)
			await saveForm({
				table,
				reportingYear,
				section, // NEW
				data: data || form.state.values,
			})
			toast.success('Draft saved successfully')
		} catch (error) {
			toast.error('Failed to save draft')
			console.error(error)
		} finally {
			setIsSaving(false)
		}
	}

	const handleFinalSubmit = async (values: TData) => {
		try {
			setIsSaving(true)
			// Save first
			await saveForm({
				table,
				reportingYear,
				section, // NEW
				data: values,
			})
			// Then submit
			await submitFormMutation({
				table,
				reportingYear,
				section, // NEW
			})
			toast.success('Form submitted successfully')
		} catch (error) {
			toast.error('Failed to submit form')
			console.error(error)
		} finally {
			setIsSaving(false)
		}
	}

	const handleReopen = async () => {
		try {
			setIsSaving(true)
			await reopenFormMutation({
				table,
				reportingYear,
				section, // NEW
			})
			toast.success('Form reopened')
		} catch (error) {
			toast.error('Failed to reopen form')
			console.error(error)
		} finally {
			setIsSaving(false)
		}
	}

	const handleRollback = async (targetVersion: number) => {
		try {
			setIsSaving(true)
			await rollbackMutation({
				table,
				reportingYear,
				section, // NEW
				targetVersion,
			})
			toast.success(`Rolled back to version ${targetVersion}`)
		} catch (error) {
			toast.error('Failed to rollback')
			console.error(error)
		} finally {
			setIsSaving(false)
		}
	}

	// Update form values when data is loaded
	useEffect(() => {
		if (existingData?.draftData || existingData?.data) {
			form.reset((existingData.draftData || existingData.data) as TData)
		}
	}, [existingData?.draftData, existingData?.data, form])

	const isLoading = existingData === undefined
	const status = existingData?.status || 'draft'

	return {
		form,
		status,
		isSaving,
		isLoading,
		existingData,
		saveDraft: () => handleSaveDraft(),
		submit: () => form.handleSubmit(),
		reopen: handleReopen,
		rollback: handleRollback,
	}
}
