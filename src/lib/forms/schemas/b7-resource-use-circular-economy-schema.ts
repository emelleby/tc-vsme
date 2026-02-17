import { z } from 'zod'

export const RECYCLED_MATERIAL_UNITS = ['tonn', 'kg', 'm³'] as const

const recycledMaterialSchema = z.object({
	id: z.string(),
	materialType: z
		.string({ message: 'Dette feltet er påkrevd' })
		.min(1, 'Dette feltet er påkrevd'),
	amount: z
		.number({ message: 'Dette feltet er påkrevd' })
		.min(0, 'Må være 0 eller mer'),
	unit: z.enum(RECYCLED_MATERIAL_UNITS),
})

export const b7ResourceUseCircularEconomySchema = z.object({
	reportingYear: z.string().regex(/^\d{4}$/, 'Year must be 4 digits'),
	totalWaste: z
		.number({ message: 'Dette feltet er påkrevd' })
		.min(0, 'Må være 0 eller mer'),
	recyclingRate: z
		.number({ message: 'Dette feltet er påkrevd' })
		.min(0, 'Må være 0 eller mer')
		.max(100, 'Må være mellom 0 og 100'),
	energyRecovery: z
		.number({ message: 'Dette feltet er påkrevd' })
		.min(0, 'Må være 0 eller mer')
		.max(100, 'Må være mellom 0 og 100'),
	landfill: z
		.number({ message: 'Dette feltet er påkrevd' })
		.min(0, 'Må være 0 eller mer')
		.max(100, 'Må være mellom 0 og 100'),
	hazardousWaste: z
		.number({ message: 'Dette feltet er påkrevd' })
		.min(0, 'Må være 0 eller mer'),
	recycledMaterials: z.array(recycledMaterialSchema),
})

export type B7ResourceUseCircularEconomyFormValues = z.infer<
	typeof b7ResourceUseCircularEconomySchema
>
export type RecycledMaterialEntry = z.infer<typeof recycledMaterialSchema>
