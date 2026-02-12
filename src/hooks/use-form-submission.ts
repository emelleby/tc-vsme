import { useMutation, useQuery } from 'convex/react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { api } from '../../convex/_generated/api'
import type { FormTable } from '../../convex/forms/_utils'
import { useAppForm } from './tanstack-form'
import { focusFirstError } from './use-form'

interface UseFormSubmissionProps<TData> {
	table: FormTable
	reportingYear: number
	defaultValues: TData
	schema: any
}

export function useFormSubmission<TData>({
	table,
	reportingYear,
	defaultValues,
	schema,
}: UseFormSubmissionProps<TData>) {
	// Fetch existing data
	const existingData = useQuery(api.forms.get.getForm, {
		table,
		reportingYear,
	})

	const saveForm = useMutation(api.forms.save.saveForm)
	const [isSaving, setIsSaving] = useState(false)

	const submitFormMutation = useMutation(api.forms.submit.submitForm)
	const reopenFormMutation = useMutation(api.forms.reopen.reopenForm)

	// Initialize form
	const form = useAppForm({
		defaultValues: (existingData?.data || defaultValues) as TData,
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
				data: values,
			})
			// Then submit
			await submitFormMutation({
				table,
				reportingYear,
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
			})
			toast.success('Form reopened')
		} catch (error) {
			toast.error('Failed to reopen form')
			console.error(error)
		} finally {
			setIsSaving(false)
		}
	}

	// Update form values when data is loaded
	useEffect(() => {
		if (existingData?.data) {
			form.reset({ values: existingData.data as TData })
		}
	}, [existingData?.data, form])

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
	}
}
