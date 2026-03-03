import { z } from 'zod'

export const b11FinesPenaltiesSchema = z
	.object({
		reportingYear: z.string().regex(/^\d{4}$/, 'År må være 4 siffer'),
		hasCorruptionFines: z.boolean().default(false),
		corruptionFinesDescription: z.string().optional(),
	})
	.superRefine((values, ctx) => {
		if (values.hasCorruptionFines && !values.corruptionFinesDescription) {
			ctx.addIssue({
				code: 'custom',
				path: ['corruptionFinesDescription'],
				message: 'Beskrivelse er påkrevd når det er rapportert bøter eller straffer',
			})
		}
	})

export type B11FinesPenaltiesValues = z.infer<typeof b11FinesPenaltiesSchema>
