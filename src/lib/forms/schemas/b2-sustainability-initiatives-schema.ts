import { z } from 'zod'

// Predefined initiative titles
export const PREDEFINED_TITLES = [
	'Workforce Development',
	'Biodiversity',
	'Climate Change',
	'Business Ethics',
	'Circular Economy',
	'Community Impact',
	'Marine Resources',
	'Stakeholder Engagement',
] as const

export const initiativeStatusSchema = z.enum([
	'not_started',
	'in_progress',
	'completed',
])

export const initiativeSchema = z.object({
	id: z.string(),
	title: z.string().min(1, 'Title is required'),
	description: z.string().min(1, 'Description is required'),
	goals: z.string().min(1, 'Goals are required'),
	responsiblePerson: z.string().min(1, 'Responsible person is required'),
	status: initiativeStatusSchema,
})

export const sustainabilityInitiativesSchema = z.object({
	reportingYear: z.string().regex(/^\d{4}$/, 'Year must be 4 digits'),
	// Allow empty array - company may not have any initiatives to report
	initiatives: z.array(initiativeSchema),
})

export type InitiativeStatus = z.infer<typeof initiativeStatusSchema>
export type Initiative = z.infer<typeof initiativeSchema>
export type SustainabilityInitiativesFormValues = z.infer<
	typeof sustainabilityInitiativesSchema
>

