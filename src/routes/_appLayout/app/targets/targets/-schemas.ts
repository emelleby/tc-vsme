import { z } from 'zod'

// Schema for the targets form - required fields for submission
export const targetsFormSchema = z.object({
	baseYear: z
		.number('Base year is required')
		.min(2015, 'Base year must be at least 2015')
		.max(2024, 'Base year must be at most 2024'),
	baseYearEmissions: z
		.number('Base year emissions is required')
		.min(0, 'Base year emissions must be at least 0'),
	targetYear: z
		.number('Target year is required')
		.min(2025, 'Target year must be at least 2025'),
	targetReduction: z
		.number('Target reduction is required')
		.min(0, 'Target reduction must be at least 0%')
		.max(100, 'Target reduction cannot exceed 100%'),
	longTermTargetYear: z.number().optional(),
	longTermTargetReduction: z.number().min(0).max(100).optional(),
})

export type TargetsFormValues = z.infer<typeof targetsFormSchema>

export const scope1TargetsFormSchema = z.object({
	targetReduction: z
		.number('Target reduction is required')
		.min(0, 'Target reduction must be at least 0%')
		.max(100, 'Target reduction cannot exceed 100%'),
	targetAbsolute: z.number().min(0, 'Target emissions must be at least 0'),
	longTermTargetReduction: z.number().min(0).max(100).optional(),
	longTermTargetAbsolute: z.number().min(0).optional(),
})

export type Scope1TargetsFormValues = z.infer<typeof scope1TargetsFormSchema>

export const scope2TargetsFormSchema = z.object({
	targetReduction: z
		.number('Target reduction is required')
		.min(0, 'Target reduction must be at least 0%')
		.max(100, 'Target reduction cannot exceed 100%'),
	targetAbsolute: z.number().min(0, 'Target emissions must be at least 0'),
	longTermTargetReduction: z.number().min(0).max(100).optional(),
	longTermTargetAbsolute: z.number().min(0).optional(),
})

export type Scope2TargetsFormValues = z.infer<typeof scope2TargetsFormSchema>

// Type for base year emissions data from Convex
export interface BaseYearEmissionsData {
	scope1Emissions: number | null
	scope2EmissionsMarketBased: number | null
	totalScope3Emissions: number | null
	category1: number | null
	category2: number | null
	category3: number | null
	category4: number | null
	category5: number | null
	category6: number | null
	category7: number | null
	category8: number | null
	category9: number | null
	category10: number | null
	category11: number | null
	category12: number | null
	category13: number | null
	category14: number | null
	category15: number | null
	energyEmissionsStatus: string | null
	scope3EmissionsStatus: string | null
}

// Type for emission row in table
export interface EmissionRow {
	year: number
	scope1: number
	scope2: number
	scope3: number
	total: number
	isBaseYear?: boolean
	isTargetYear?: boolean
	isLongTermTargetYear?: boolean
}

