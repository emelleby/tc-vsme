import { z } from 'zod'

export const c7SeriousHumanRightsSchema = z
	.object({
		reportingYear: z.string().regex(/^\d{4}$/, 'År må være 4 siffer'),
		/** (a.i) Confirmed incidents of child labour */
		childLabor: z.boolean().default(false),
		/** (b) Measures taken to address child labour */
		childLaborMeasures: z.string().optional(),
		/** (a.ii) Confirmed incidents of forced labour */
		forcedLabor: z.boolean().default(false),
		/** (b) Measures taken to address forced labour */
		forcedLaborMeasures: z.string().optional(),
		/** (a.iii) Confirmed incidents of human trafficking */
		humanTrafficking: z.boolean().default(false),
		/** (b) Measures taken to address human trafficking */
		humanTraffickingMeasures: z.string().optional(),
		/** (a.iv) Confirmed incidents of discrimination */
		discrimination: z.boolean().default(false),
		/** (b) Measures taken to address discrimination */
		discriminationMeasures: z.string().optional(),
		/** (a.v) Other confirmed incidents */
		other: z.boolean().default(false),
		/** (b) Measures taken to address other incidents */
		otherMeasures: z.string().optional(),
		/** (c) Aware of incidents in value chain / affected communities / consumers? */
		hasValueChainIncidents: z.boolean().default(false),
		/** (c) Description of value chain incidents */
		valueChainIncidentsDescription: z.string().optional(),
	})
	.superRefine((values, ctx) => {
		// (b) If an incident type is confirmed, the measures description is required
		if (values.childLabor && !values.childLaborMeasures?.trim()) {
			ctx.addIssue({
				code: 'custom',
				path: ['childLaborMeasures'],
				message:
					'Please describe the measures taken to address child labour incidents',
			})
		}
		if (values.forcedLabor && !values.forcedLaborMeasures?.trim()) {
			ctx.addIssue({
				code: 'custom',
				path: ['forcedLaborMeasures'],
				message:
					'Please describe the measures taken to address forced labour incidents',
			})
		}
		if (values.humanTrafficking && !values.humanTraffickingMeasures?.trim()) {
			ctx.addIssue({
				code: 'custom',
				path: ['humanTraffickingMeasures'],
				message:
					'Please describe the measures taken to address human trafficking incidents',
			})
		}
		if (values.discrimination && !values.discriminationMeasures?.trim()) {
			ctx.addIssue({
				code: 'custom',
				path: ['discriminationMeasures'],
				message:
					'Please describe the measures taken to address discrimination incidents',
			})
		}
		if (values.other && !values.otherMeasures?.trim()) {
			ctx.addIssue({
				code: 'custom',
				path: ['otherMeasures'],
				message:
					'Please describe the measures taken to address the other incidents',
			})
		}

		// (c) If aware of value chain incidents, description is required
		if (
			values.hasValueChainIncidents &&
			!values.valueChainIncidentsDescription?.trim()
		) {
			ctx.addIssue({
				code: 'custom',
				path: ['valueChainIncidentsDescription'],
				message:
					'Please describe the confirmed incidents involving the value chain, affected communities, consumers and end-users',
			})
		}
	})

export type C7SeriousHumanRightsValues = z.infer<
	typeof c7SeriousHumanRightsSchema
>
