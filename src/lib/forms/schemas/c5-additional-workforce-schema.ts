import { z } from 'zod'

export const c5AdditionalWorkforceSchema = z.object({
	reportingYear: z.string().regex(/^\d{4}$/, 'År må være 4 siffer'),
	maleManagers: z
		.number()
		.int('Må være et heltall')
		.min(0, 'Må være 0 eller mer')
		.optional(),
	femaleManagers: z
		.number()
		.int('Må være et heltall')
		.min(0, 'Må være 0 eller mer')
		.optional(),
	selfEmployedWorkers: z
		.number()
		.int('Må være et heltall')
		.min(0, 'Må være 0 eller mer')
		.optional(),
	contractWorkers: z
		.number()
		.int('Må være et heltall')
		.min(0, 'Må være 0 eller mer')
		.optional(),
	/** Computed: maleManagers / femaleManagers. undefined when not applicable. */
	managementGenderRatio: z.number().optional(),
})

export type C5AdditionalWorkforceValues = z.infer<
	typeof c5AdditionalWorkforceSchema
>
