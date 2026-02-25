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

export const scope3TargetsFormSchema = z.object({
	targetReduction: z
		.number('Target reduction is required')
		.min(0, 'Target reduction must be at least 0%')
		.max(100, 'Target reduction cannot exceed 100%'),
	targetAbsolute: z.number().min(0, 'Target emissions must be at least 0'),
	longTermTargetReduction: z.number().min(0).max(100).optional(),
	longTermTargetAbsolute: z.number().min(0).optional(),
	// 15 target-year categories
	targetCategory1: z.number().optional(),
	targetCategory2: z.number().optional(),
	targetCategory3: z.number().optional(),
	targetCategory4: z.number().optional(),
	targetCategory5: z.number().optional(),
	targetCategory6: z.number().optional(),
	targetCategory7: z.number().optional(),
	targetCategory8: z.number().optional(),
	targetCategory9: z.number().optional(),
	targetCategory10: z.number().optional(),
	targetCategory11: z.number().optional(),
	targetCategory12: z.number().optional(),
	targetCategory13: z.number().optional(),
	targetCategory14: z.number().optional(),
	targetCategory15: z.number().optional(),
	// 15 long-term categories
	ltCategory1: z.number().optional(),
	ltCategory2: z.number().optional(),
	ltCategory3: z.number().optional(),
	ltCategory4: z.number().optional(),
	ltCategory5: z.number().optional(),
	ltCategory6: z.number().optional(),
	ltCategory7: z.number().optional(),
	ltCategory8: z.number().optional(),
	ltCategory9: z.number().optional(),
	ltCategory10: z.number().optional(),
	ltCategory11: z.number().optional(),
	ltCategory12: z.number().optional(),
	ltCategory13: z.number().optional(),
	ltCategory14: z.number().optional(),
	ltCategory15: z.number().optional(),
})

export type Scope3TargetsFormValues = z.infer<typeof scope3TargetsFormSchema>

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
	scope3Categories?: {
		category1?: number
		category2?: number
		category3?: number
		category4?: number
		category5?: number
		category6?: number
		category7?: number
		category8?: number
		category9?: number
		category10?: number
		category11?: number
		category12?: number
		category13?: number
		category14?: number
		category15?: number
	}
}
