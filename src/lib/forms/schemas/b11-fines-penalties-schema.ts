import { z } from 'zod'

export const b11FinesPenaltiesSchema = z
	.object({
		reportingYear: z.string().regex(/^\d{4}$/, 'År må være 4 siffer'),
		hasCorruptionFines: z.boolean().default(false),
		corruptionFinesDescription: z.string().optional(),
		numberOfConvictions: z.number().optional(),
		totalFines: z.number().optional(),
		currency: z.enum(['NOK', 'SEK', 'DKK', 'EUR', 'USD', 'GBP']).optional(),
	})
	.superRefine((values, ctx) => {
		if (values.hasCorruptionFines) {
			if (values.numberOfConvictions === undefined) {
				ctx.addIssue({
					code: 'custom',
					path: ['numberOfConvictions'],
					message: 'Antall domfellelser er påkrevd',
				})
			}
			if (values.totalFines === undefined) {
				ctx.addIssue({
					code: 'custom',
					path: ['totalFines'],
					message: 'Totalt bøtebeløp er påkrevd',
				})
			}
			if (!values.currency) {
				ctx.addIssue({
					code: 'custom',
					path: ['currency'],
					message: 'Valuta er påkrevd',
				})
			}
		}
	})

export type B11FinesPenaltiesValues = z.infer<typeof b11FinesPenaltiesSchema>
