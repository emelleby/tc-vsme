import { describe, expect, it } from 'vitest'
import { c4ClimateRiskSchema } from '../c4-climate-risk-schema'

describe('c4ClimateRiskSchema', () => {
	it('accepts a valid description', () => {
		const result = c4ClimateRiskSchema.safeParse({
			reportingYear: '2025',
			climateRiskDescription: 'Extreme weather events could disrupt logistics.',
		})

		expect(result.success).toBe(true)
	})

	it('rejects empty descriptions', () => {
		const result = c4ClimateRiskSchema.safeParse({
			reportingYear: '2025',
			climateRiskDescription: '   ',
		})

		expect(result.success).toBe(false)
	})

	it('rejects invalid reporting years', () => {
		const result = c4ClimateRiskSchema.safeParse({
			reportingYear: '25',
			climateRiskDescription: 'Regulatory changes may raise compliance costs.',
		})

		expect(result.success).toBe(false)
	})
})
