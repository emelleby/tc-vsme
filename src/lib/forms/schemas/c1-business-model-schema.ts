import { z } from 'zod'

export const c1BusinessModelSchema = z.object({
	reportingYear: z.string().regex(/^\d{4}$/, 'Year must be 4 digits'),
	productsAndServices: z.string().optional(),
	markets: z.string().optional(),
	businessRelationships: z.string().optional(),
	sustainabilityStrategy: z.string().optional(),
})

export type C1BusinessModelFormValues = z.infer<typeof c1BusinessModelSchema>

