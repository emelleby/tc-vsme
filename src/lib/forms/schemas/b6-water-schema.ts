import { z } from 'zod'

export const b6WaterSchema = z
	.object({
		reportingYear: z.string().regex(/^\d{4}$/, 'Year must be 4 digits'),
		waterConsumption: z.number().min(0, 'Må være 0 eller mer').optional(),
		waterStress: z
			.number()
			.min(0, 'Må være 0 eller mer')
			.max(100, 'Må være mellom 0 og 100')
			.optional(),
	})
	.superRefine((values, ctx) => {
		if (values.waterConsumption === undefined) {
			ctx.addIssue({
				code: 'custom',
				path: ['waterConsumption'],
				message: 'Feltet er påkrevd',
			})
		}
		if (values.waterStress === undefined) {
			ctx.addIssue({
				code: 'custom',
				path: ['waterStress'],
				message: 'Feltet er påkrevd',
			})
		}
	})

export type B6WaterFormValues = z.infer<typeof b6WaterSchema>
