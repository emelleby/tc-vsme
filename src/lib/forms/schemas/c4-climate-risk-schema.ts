import { z } from 'zod'

export const c4ClimateRiskSchema = z.object({
	reportingYear: z.string().regex(/^\d{4}$/, 'Year must be 4 digits'),
	climateRiskDescription: z
		.string()
		.trim()
		.min(1, 'Climate risk description is required'),
})

export type C4ClimateRiskFormValues = z.infer<typeof c4ClimateRiskSchema>
