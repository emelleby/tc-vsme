import { z } from 'zod'

export const c7SeriousHumanRightsSchema = z.object({
	reportingYear: z.string().regex(/^\d{4}$/, 'År må være 4 siffer'),
	childLabor: z.boolean().default(false),
	childLaborMeasures: z.string().optional(),
	forcedLabor: z.boolean().default(false),
	forcedLaborMeasures: z.string().optional(),
	humanTrafficking: z.boolean().default(false),
	humanTraffickingMeasures: z.string().optional(),
	discrimination: z.boolean().default(false),
	discriminationMeasures: z.string().optional(),
	other: z.boolean().default(false),
	otherMeasures: z.string().optional(),
})

export type C7SeriousHumanRightsValues = z.infer<
	typeof c7SeriousHumanRightsSchema
>
