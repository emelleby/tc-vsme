import { z } from 'zod'

export const EMISSION_TYPES = ['Air', 'Water', 'Soil'] as const

export const pollutionEntrySchema = z.object({
	id: z.string(),
	pollutionType: z.string().min(1, 'Pollution type is required'),
	emissionType: z.enum(EMISSION_TYPES),
	amount: z
		.number({ message: 'Amount is required' })
		.min(0, 'Amount must be at least 0'),
	unit: z.string().min(1, 'Unit is required'),
})

export const pollutionSchema = z.object({
	reportingYear: z.string().regex(/^\d{4}$/, 'Year must be 4 digits'),
	pollutants: z.array(pollutionEntrySchema),
})

export type EmissionType = (typeof EMISSION_TYPES)[number]
export type PollutionEntry = z.infer<typeof pollutionEntrySchema>
export type PollutionFormValues = z.infer<typeof pollutionSchema>
