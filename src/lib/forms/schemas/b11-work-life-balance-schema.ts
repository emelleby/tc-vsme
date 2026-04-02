import { z } from 'zod'

export const b11WorkLifeBalanceSchema = z.object({
	reportingYear: z.string().regex(/^\d{4}$/, 'Year must be 4 digits'),
	femaleParentalLeave: z
		.number({ message: 'Dette feltet er påkrevd' })
		.min(0, 'Må være 0 eller mer'),
	maleParentalLeave: z
		.number({ message: 'Dette feltet er påkrevd' })
		.min(0, 'Må være 0 eller mer'),
	parentalLeavePolicyDescription: z
		.string({ message: 'Dette feltet er påkrevd' })
		.min(1, 'Beskrivelse er påkrevd'),
})

export type B11WorkLifeBalanceFormValues = z.infer<
	typeof b11WorkLifeBalanceSchema
>
