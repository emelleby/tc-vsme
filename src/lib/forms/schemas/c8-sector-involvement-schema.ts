import { z } from 'zod'

export const c8SectorInvolvementSchema = z
	.object({
		reportingYear: z.string().regex(/^\d{4}$/, 'År må være 4 siffer'),
		controversialWeapons: z.boolean().default(false),
		controversialWeaponsRevenue: z.number().min(0, 'Må være 0 eller mer').optional(),
		fossilFuels: z.boolean().default(false),
		fossilFuelRevenue: z.number().min(0, 'Må være 0 eller mer').optional(),
		fossilFuelsBreakdown: z.string().optional(),
		agriculturalChemicals: z.boolean().default(false),
		agriculturalChemicalsRevenue: z.number().min(0, 'Må være 0 eller mer').optional(),
		euBenchmarksExclusion: z.boolean().default(false),
	})
	.superRefine((values, ctx) => {
		if (values.controversialWeapons && values.controversialWeaponsRevenue === undefined) {
			ctx.addIssue({
				code: 'custom',
				path: ['controversialWeaponsRevenue'],
				message: 'Feltet er påkrevd',
			})
		}
		if (values.fossilFuels) {
			if (values.fossilFuelRevenue === undefined) {
				ctx.addIssue({
					code: 'custom',
					path: ['fossilFuelRevenue'],
					message: 'Feltet er påkrevd',
				})
			}
			if (!values.fossilFuelsBreakdown) {
				ctx.addIssue({
					code: 'custom',
					path: ['fossilFuelsBreakdown'],
					message: 'Feltet er påkrevd',
				})
			}
		}
		if (values.agriculturalChemicals && values.agriculturalChemicalsRevenue === undefined) {
			ctx.addIssue({
				code: 'custom',
				path: ['agriculturalChemicalsRevenue'],
				message: 'Feltet er påkrevd',
			})
		}
	})

export type C8SectorInvolvementValues = z.infer<typeof c8SectorInvolvementSchema>
