import * as z from 'zod'
export const orderFormSchema = z.object({
	product: z.string().min(1, 'This field is required'),
	firstName: z.string().min(1, 'This field is required'),
	lastName: z.string().min(1, 'This field is required'),
	email: z.email(),
	street_address: z.string().min(1, 'This field is required'),
	city: z.string().min(1, 'This field is required'),
	zip: z.string().min(1, 'This field is required'),
	paymentMethod: z.string().min(1, 'This field is required'),
	terms: z.boolean().refine((v) => v === true, {
		message: 'You must agree to the terms and conditions',
	}),
})
