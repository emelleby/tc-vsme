import { z } from 'zod'

export const b10CompensationSchema = z.object({
	reportingYear: z.string().regex(/^\d{4}$/, 'Year must be 4 digits'),
	tariffavtaledekning: z
		.number({ message: 'Dette feltet er påkrevd' })
		.min(0, 'Må være 0 eller mer')
		.max(100, 'Kan ikke overstige 100 %'),
	gjennomsnittligOpplaering: z
		.number({ message: 'Dette feltet er påkrevd' })
		.min(0, 'Må være 0 eller mer'),
	minstelonnsansvar: z.boolean(),
})

export type B10CompensationFormValues = z.infer<typeof b10CompensationSchema>
