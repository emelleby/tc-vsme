import { z } from 'zod'

export const b3EnergyEmissionsSchema = z.object({
	reportingYear: z.string().regex(/^\d{4}$/, 'Year must be 4 digits'),
	renewableElectricity: z.coerce.number().min(0, 'Må være 0 eller mer'),
	nonRenewableElectricity: z.coerce.number().min(0, 'Må være 0 eller mer'),
	emissionsIntensity: z.coerce.number().min(0, 'Må være 0 eller mer'),
	scope1Emissions: z.coerce.number().min(0, 'Må være 0 eller mer'),
	scope2EmissionsLocationBased: z.coerce.number().min(0, 'Må være 0 eller mer'),
	scope2EmissionsMarketBased: z.coerce.number().min(0, 'Må være 0 eller mer'),
})

export type B3EnergyEmissionsFormValues = z.infer<
	typeof b3EnergyEmissionsSchema
>
