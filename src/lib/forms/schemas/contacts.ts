import { z } from 'zod'

export const contactSchema = z.object({
	firstName: z.string().min(1, 'First name is required'),
	lastName: z.string().min(1, 'Last name is required'),
	email: z.email('Invalid email address'),
	address: z.object({
		street: z.string().min(1, 'Street address is required'),
		city: z.string().min(1, 'City is required'),
		state: z.string().min(1, 'State is required'),
		zipCode: z.string().min(4, 'Invalid zip code format'),
		country: z.string().min(1, 'Country is required')
	}),
	phone: z
		.string()
		.min(8, 'Invalid phone number format')
		.max(15, 'Invalid phone number format'),
	picture: z.string().optional()
})

export type Contact = z.infer<typeof contactSchema>
