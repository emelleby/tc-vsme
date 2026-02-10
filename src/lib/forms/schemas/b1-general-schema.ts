import { z } from 'zod'

export const b1GeneralSchema = z.object({
	reportingYear: z.string().regex(/^\d{4}$/, 'Year must be 4 digits'),
	organizationName: z.string().min(1, 'Organization name is required'),
	organizationNumber: z.string().min(1, 'Organization number is required'),
	naceCode: z.string().min(1, 'NACE code is required'),
	revenue: z.any().pipe(z.coerce.number().min(0)),
	balanceSheetTotal: z.any().pipe(z.coerce.number().min(0)).optional(),
	employees: z.any().pipe(z.coerce.number().min(0)),
	country: z.string().min(1, 'Country is required'),
	reportType: z.boolean(),
	subsidiaries: z
		.array(
			z.object({
				id: z.string(),
				name: z.string().min(1, 'Navn er påkrevd'),
				address: z.string().min(1, 'Adresse er påkrevd'),
			}),
		)
		.optional(),
	contactPersonName: z.string().min(1, 'Contact name is required'),
	contactPersonEmail: z.email('Invalid email address').optional(),
})

export type B1GeneralFormValues = z.infer<typeof b1GeneralSchema>
