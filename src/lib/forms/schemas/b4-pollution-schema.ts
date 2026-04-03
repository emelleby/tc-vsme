import { z } from 'zod'

export const EMISSION_TYPES = ['Air', 'Water', 'Soil'] as const
export const POLLUTANT_UNITS = ['kilograms (kg)', 'metric tonnes (t)'] as const

export const pollutionEntrySchema = z.object({
	id: z.string(),
	pollutionType: z.string().min(1, 'Pollution type is required'),
	emissionType: z.enum(EMISSION_TYPES),
	amount: z
		.number({ message: 'Amount is required' })
		.min(0, 'Amount must be at least 0'),
	unit: z.enum(POLLUTANT_UNITS),
})

export const pollutionSchema = z
	.object({
		reportingYear: z.string().regex(/^\d{4}$/, 'Year must be 4 digits'),
		reportingPollution: z.boolean(),
		publiclyAvailableDisclosure: z.boolean().optional(),
		urlOrLinkToPubliclyAvailableDisclosure: z.string().optional(),
		pollutants: z.array(pollutionEntrySchema),
	})
	.refine(
		(data) =>
			!data.publiclyAvailableDisclosure ||
			(data.urlOrLinkToPubliclyAvailableDisclosure &&
				/\.+./.test(data.urlOrLinkToPubliclyAvailableDisclosure)),
		{
			message: 'A valid URL is required when disclosure is publicly available',
			path: ['urlOrLinkToPubliclyAvailableDisclosure'],
		},
	)
	.refine(
		(data) =>
			!data.reportingPollution ||
			data.publiclyAvailableDisclosure ||
			data.pollutants.length > 0,
		{
			message: 'At least one pollutant is required',
			path: ['pollutants'],
		},
	)

export type EmissionType = (typeof EMISSION_TYPES)[number]
export type PollutionEntry = z.infer<typeof pollutionEntrySchema>
export type PollutionFormValues = z.infer<typeof pollutionSchema>
