import { z } from 'zod'

export const c1BusinessModelSchema = z.object({
	reportingYear: z.string().regex(/^\d{4}$/, 'Year must be 4 digits'),
	businessModel: z.string().optional(),
})

export type C1BusinessModelFormValues = z.infer<typeof c1BusinessModelSchema>

