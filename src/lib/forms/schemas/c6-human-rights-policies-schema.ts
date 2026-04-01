import { z } from 'zod'

export const c6HumanRightsPoliciesSchema = z
	.object({
		reportingYear: z.string().regex(/^\d{4}$/, 'År må være 4 siffer'),
		/** (a) Does the undertaking have a code of conduct or human rights policy? */
		hasCodeOfConduct: z.boolean().default(false),
		/** (b.i) Covers child labour? */
		childLaborPolicy: z.boolean().default(false),
		/** (b.ii) Covers forced labour? */
		forcedLaborPolicy: z.boolean().default(false),
		/** (b.iii) Covers human trafficking? */
		humanTraffickingPolicy: z.boolean().default(false),
		/** (b.iv) Covers discrimination? */
		discriminationPolicy: z.boolean().default(false),
		/** (b.v) Covers accident prevention? */
		accidentPreventionPolicy: z.boolean().default(false),
		/** (b.vi) Covers other? */
		hasOtherPolicies: z.boolean().default(false),
		/** (b.vi) Specify other policies */
		otherPolicies: z.string().optional(),
		/** (c) Does the undertaking have a complaints-handling mechanism? */
		hasComplaintsHandlingMechanism: z.boolean().default(false),
	})
	.superRefine((values, ctx) => {
		if (values.hasCodeOfConduct) {
			const hasAtLeastOnePolicy =
				values.childLaborPolicy ||
				values.forcedLaborPolicy ||
				values.humanTraffickingPolicy ||
				values.discriminationPolicy ||
				values.accidentPreventionPolicy ||
				values.hasOtherPolicies

			if (!hasAtLeastOnePolicy) {
				ctx.addIssue({
					code: 'custom',
					path: ['childLaborPolicy'],
					message:
						'At least one policy area must be selected when a code of conduct exists',
				})
			}

			// If "other" is checked, the description is required
			if (values.hasOtherPolicies && !values.otherPolicies?.trim()) {
				ctx.addIssue({
					code: 'custom',
					path: ['otherPolicies'],
					message: 'Please specify the other policies covered',
				})
			}
		}
	})

export type C6HumanRightsPoliciesValues = z.infer<
	typeof c6HumanRightsPoliciesSchema
>
