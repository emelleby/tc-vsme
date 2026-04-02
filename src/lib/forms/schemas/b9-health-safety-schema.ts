import { z } from 'zod'

export const b9HealthSafetySchema = z.object({
	reportingYear: z.string().regex(/^\d{4}$/, 'Year must be 4 digits'),
	arbeidsulykker: z
		.number({ message: 'Dette feltet er påkrevd' })
		.int('Må være et heltall')
		.min(0, 'Må være 0 eller mer'),
	sykefravarProsent: z
		.number({ message: 'Dette feltet er påkrevd' })
		.min(0, 'Må være 0 eller mer')
		.max(100, 'Kan ikke overstige 100 %'),
	hmsOpplaering: z
		.number({ message: 'Dette feltet er påkrevd' })
		.int('Må være et heltall')
		.min(0, 'Må være 0 eller mer'),
	omkomne: z
		.number({ message: 'Dette feltet er påkrevd' })
		.int('Må være et heltall')
		.min(0, 'Må være 0 eller mer'),
	eventuellUtfyllendeInfo: z.string().optional(),
})

export type B9HealthSafetyFormValues = z.infer<typeof b9HealthSafetySchema>
