import { z } from 'zod'

export const c9BoardCompositionSchema = z.object({
	reportingYear: z.string().regex(/^\d{4}$/, 'År må være 4 siffer'),
	totalMembers: z
		.number({ message: 'Dette feltet er påkrevd' })
		.min(0, 'Må være 0 eller mer'),
	femaleMembers: z
		.number({ message: 'Dette feltet er påkrevd' })
		.min(0, 'Må være 0 eller mer'),
	maleMembers: z
		.number({ message: 'Dette feltet er påkrevd' })
		.min(0, 'Må være 0 eller mer'),
	otherMembers: z
		.number({ message: 'Dette feltet er påkrevd' })
		.min(0, 'Må være 0 eller mer'),
})

export type C9BoardCompositionValues = z.infer<typeof c9BoardCompositionSchema>
