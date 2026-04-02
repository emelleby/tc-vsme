import { describe, expect, it } from 'vitest'
import { c8SectorInvolvementSchema } from '../c8-sector-involvement-schema'

describe('c8SectorInvolvementSchema', () => {
	it('accepts valid input with no involving sectors', () => {
		const result = c8SectorInvolvementSchema.safeParse({
			reportingYear: '2025',
			controversialWeapons: false,
			fossilFuels: false,
			agriculturalChemicals: false,
			euBenchmarksExclusion: false,
		})
		expect(result.success).toBe(true)
	})

	it('requires revenue when controversial weapons is checked', () => {
		const result = c8SectorInvolvementSchema.safeParse({
			reportingYear: '2025',
			controversialWeapons: true,
		})
		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error.issues[0].path).toContain('controversialWeaponsRevenue')
		}
	})

	it('requires revenue and breakdown when fossil fuels is checked', () => {
		const result = c8SectorInvolvementSchema.safeParse({
			reportingYear: '2025',
			fossilFuels: true,
			fossilFuelRevenue: 1000000,
		})
		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error.issues[0].path).toContain('fossilFuelsBreakdown')
		}
	})

	it('accepts valid input for fossil fuels', () => {
		const result = c8SectorInvolvementSchema.safeParse({
			reportingYear: '2025',
			fossilFuels: true,
			fossilFuelRevenue: 1000000,
			fossilFuelsBreakdown: 'Coal mining operations.',
		})
		expect(result.success).toBe(true)
	})

	it('requires revenue when agricultural chemicals is checked', () => {
		const result = c8SectorInvolvementSchema.safeParse({
			reportingYear: '2025',
			agriculturalChemicals: true,
		})
		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error.issues[0].path).toContain('agriculturalChemicalsRevenue')
		}
	})
})
