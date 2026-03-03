import { z } from 'zod'

export const c6HumanRightsPoliciesSchema = z.object({
  reportingYear: z.string().regex(/^\d{4}$/, 'År må være 4 siffer'),
  childLaborPolicy: z.boolean().default(false),
  forcedLaborPolicy: z.boolean().default(false),
  humanTraffickingPolicy: z.boolean().default(false),
  discriminationPolicy: z.boolean().default(false),
  otherPolicies: z.string().optional(),
})

export type C6HumanRightsPoliciesValues = z.infer<typeof c6HumanRightsPoliciesSchema>
