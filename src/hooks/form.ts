import { createFormHook } from '@tanstack/react-form'

import {
	ComboboxField,
	CountryField,
	SelectField,
	SubmitButton,
	SwitchField,
	TextareaField,
	TextField,
} from '@/components/form-fields'

import { fieldContext, formContext } from './form-context'

export const { useAppForm, withForm, withFieldGroup } = createFormHook({
	fieldComponents: {
		TextField: TextField,
		SelectField: SelectField,
		TextareaField: TextareaField,
		CountryField: CountryField,
		SwitchField: SwitchField,
		ComboboxField: ComboboxField,
	},
	formComponents: {
		SubmitButton: SubmitButton,
	},
	fieldContext,
	formContext,
})
