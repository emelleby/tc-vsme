import { z } from 'zod'

export const SCOPE_3_CATEGORIES = [
	{ number: 1, name: 'Purchased Goods and Services' },
	{ number: 2, name: 'Capital Goods' },
	{ number: 3, name: 'Fuel- and Energy-Related Activities' },
	{ number: 4, name: 'Upstream Transportation and Distribution' },
	{ number: 5, name: 'Waste Generated in Operations' },
	{ number: 6, name: 'Business Travel' },
	{ number: 7, name: 'Employee Commuting' },
	{ number: 8, name: 'Upstream Leased Assets' },
	{ number: 9, name: 'Downstream Transportation and Distribution' },
	{ number: 10, name: 'Processing of Sold Products' },
	{ number: 11, name: 'Use of Sold Products' },
	{ number: 12, name: 'End-of-Life Treatment of Sold Products' },
	{ number: 13, name: 'Downstream Leased Assets' },
	{ number: 14, name: 'Franchises' },
	{ number: 15, name: 'Investments' },
] as const

export const c2Scope3EmissionsSchema = z.object({
	reportingYear: z.string().regex(/^\d{4}$/, 'Year must be 4 digits'),
	totalScope3Emissions: z
		.number({ message: 'Dette feltet er påkrevd' })
		.min(0, 'Må være 0 eller mer'),
	category1: z
		.number({ message: 'Dette feltet er påkrevd' })
		.min(0, 'Må være 0 eller mer'),
	category2: z
		.number({ message: 'Dette feltet er påkrevd' })
		.min(0, 'Må være 0 eller mer'),
	category3: z
		.number({ message: 'Dette feltet er påkrevd' })
		.min(0, 'Må være 0 eller mer'),
	category4: z
		.number({ message: 'Dette feltet er påkrevd' })
		.min(0, 'Må være 0 eller mer'),
	category5: z
		.number({ message: 'Dette feltet er påkrevd' })
		.min(0, 'Må være 0 eller mer'),
	category6: z
		.number({ message: 'Dette feltet er påkrevd' })
		.min(0, 'Må være 0 eller mer'),
	category7: z
		.number({ message: 'Dette feltet er påkrevd' })
		.min(0, 'Må være 0 eller mer'),
	category8: z
		.number({ message: 'Dette feltet er påkrevd' })
		.min(0, 'Må være 0 eller mer'),
	category9: z
		.number({ message: 'Dette feltet er påkrevd' })
		.min(0, 'Må være 0 eller mer'),
	category10: z
		.number({ message: 'Dette feltet er påkrevd' })
		.min(0, 'Må være 0 eller mer'),
	category11: z
		.number({ message: 'Dette feltet er påkrevd' })
		.min(0, 'Må være 0 eller mer'),
	category12: z
		.number({ message: 'Dette feltet er påkrevd' })
		.min(0, 'Må være 0 eller mer'),
	category13: z
		.number({ message: 'Dette feltet er påkrevd' })
		.min(0, 'Må være 0 eller mer'),
	category14: z
		.number({ message: 'Dette feltet er påkrevd' })
		.min(0, 'Må være 0 eller mer'),
	category15: z
		.number({ message: 'Dette feltet er påkrevd' })
		.min(0, 'Må være 0 eller mer'),
})

export type C2Scope3EmissionsFormValues = z.infer<typeof c2Scope3EmissionsSchema>
