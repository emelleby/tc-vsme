import { createFormHookContexts } from '@tanstack/react-form'

// Create the form hook contexts - these are used by both tanstack-form.tsx and form-fields.tsx
const {
	fieldContext,
	formContext,
	useFieldContext: _useFieldContext,
	useFormContext,
} = createFormHookContexts()

// Wrapper for useFieldContext that provides better typing
const useFieldContext = () => {
	const field = _useFieldContext()
	return field
}

export { fieldContext, formContext, useFieldContext, useFormContext }

