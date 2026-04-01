import { z } from 'zod'

export const b10CompensationSchema = z.object({
	reportingYear: z.string().regex(/^\d{4}$/, 'Year must be 4 digits'),
	hourlyPayMale: z
		.number({ message: 'Dette feltet er påkrevd' })
		.min(0, 'Må være 0 eller mer'),
	hourlyPayFemale: z
		.number({ message: 'Dette feltet er påkrevd' })
		.min(0, 'Må være 0 eller mer'),
	collectiveBargainingAgreement: z
		.number({ message: 'Dette feltet er påkrevd' })
		.int('Må være et heltall')
		.min(0, 'Må være 0 eller mer'),
	trainingHoursMale: z
		.number({ message: 'Dette feltet er påkrevd' })
		.min(0, 'Må være 0 eller mer'),
	trainingHoursFemale: z
		.number({ message: 'Dette feltet er påkrevd' })
		.min(0, 'Må være 0 eller mer'),
	collectiveBargainingShare: z.number().optional(),
	genderPayGap: z.number().optional(),
	minstelonnsansvar: z.boolean(),
})

export type B10CompensationFormValues = z.infer<typeof b10CompensationSchema>
