import { createFormHook } from '@tanstack/react-form'

// import {
// 	Select,
// 	SubscribeButton,
// 	TextArea,
// 	TextField,
// } from '../components/demo.FormComponents'

import {
	CountryField,
	SelectField,
	SubmitButton,
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
	},
	formComponents: {
		SubmitButton: SubmitButton,
	},
	fieldContext,
	formContext,
})
