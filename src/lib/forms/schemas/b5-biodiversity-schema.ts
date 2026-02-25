import { z } from 'zod'

export const b5BiodiversitySchema = z
	.object({
		reportingYear: z.string().regex(/^\d{4}$/, 'Year must be 4 digits'),
		hasSensitiveBiodiversityAreas: z.boolean(),
		totalAreaHectares: z.number().min(0, 'Må være 0 eller mer').optional(),
		protectedAreaHectares: z.number().min(0, 'Må være 0 eller mer').optional(),
		nonProtectedAreaHectares: z
			.number()
			.min(0, 'Må være 0 eller mer')
			.optional(),
		protectedSpeciesCount: z.string().optional(),
		redListedSpeciesCount: z.string().optional(),
	})
	.superRefine((values, ctx) => {
		if (!values.hasSensitiveBiodiversityAreas) {
			return
		}

		const requiredAreaFields = [
			{
				path: 'totalAreaHectares',
				message: 'Totalt areal er påkrevd',
			},
			{
				path: 'protectedAreaHectares',
				message: 'Forseglet areal er påkrevd',
			},
			{
				path: 'nonProtectedAreaHectares',
				message: 'Ikke-forseglet areal er påkrevd',
			},
		] as const

		for (const field of requiredAreaFields) {
			if (values[field.path] === undefined) {
				ctx.addIssue({
					code: 'custom',
					path: [field.path],
					message: field.message,
				})
			}
		}
	})

export type B5BiodiversityFormValues = z.infer<typeof b5BiodiversitySchema>
