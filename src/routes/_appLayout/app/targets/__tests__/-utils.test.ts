import { describe, expect, it } from 'vitest'
import type { BaseYearEmissionsData, EmissionRow } from '../-schemas'
import {
	calculateCompoundReduction,
	calculateOverallReductions,
	calculateTotalEmissions,
	generateEmissionRows,
	updateScope1Projections,
	updateScope2Projections,
} from '../-utils'

describe('calculateTotalEmissions', () => {
	it('should return 0 when data is null', () => {
		expect(calculateTotalEmissions(null)).toBe(0)
	})

	it('should calculate total emissions correctly', () => {
		const data: BaseYearEmissionsData = {
			scope1Emissions: 100,
			scope2EmissionsMarketBased: 200,
			totalScope3Emissions: 300,
			category1: null,
			category2: null,
			category3: null,
			category4: null,
			category5: null,
			category6: null,
			category7: null,
			category8: null,
			category9: null,
			category10: null,
			category11: null,
			category12: null,
			category13: null,
			category14: null,
			category15: null,
			energyEmissionsStatus: null,
			scope3EmissionsStatus: null,
		}
		expect(calculateTotalEmissions(data)).toBe(600)
	})

	it('should treat null values as zero', () => {
		const data: BaseYearEmissionsData = {
			scope1Emissions: null,
			scope2EmissionsMarketBased: 200,
			totalScope3Emissions: null,
			category1: null,
			category2: null,
			category3: null,
			category4: null,
			category5: null,
			category6: null,
			category7: null,
			category8: null,
			category9: null,
			category10: null,
			category11: null,
			category12: null,
			category13: null,
			category14: null,
			category15: null,
			energyEmissionsStatus: null,
			scope3EmissionsStatus: null,
		}
		expect(calculateTotalEmissions(data)).toBe(200)
	})

	it('should handle all null emissions', () => {
		const data: BaseYearEmissionsData = {
			scope1Emissions: null,
			scope2EmissionsMarketBased: null,
			totalScope3Emissions: null,
			category1: null,
			category2: null,
			category3: null,
			category4: null,
			category5: null,
			category6: null,
			category7: null,
			category8: null,
			category9: null,
			category10: null,
			category11: null,
			category12: null,
			category13: null,
			category14: null,
			category15: null,
			energyEmissionsStatus: null,
			scope3EmissionsStatus: null,
		}
		expect(calculateTotalEmissions(data)).toBe(0)
	})
})

describe('calculateCompoundReduction', () => {
	it('should return 0 when startYear >= endYear', () => {
		expect(calculateCompoundReduction(1000, 2020, 2020, 50)).toBe(0)
		expect(calculateCompoundReduction(1000, 2025, 2020, 50)).toBe(0)
	})

	it('should return 0 when startValue is 0', () => {
		expect(calculateCompoundReduction(0, 2020, 2030, 50)).toBe(0)
	})

	it('should calculate correct reduction rate for 50% reduction over 10 years', () => {
		const rate = calculateCompoundReduction(1000, 2020, 2030, 50)
		// After 10 years with this rate, we should have 500
		const finalValue = 1000 * rate ** 10
		expect(finalValue).toBeCloseTo(500, 1)
	})

	it('should calculate correct reduction rate for 90% reduction over 30 years', () => {
		const rate = calculateCompoundReduction(1000, 2020, 2050, 90)
		// After 30 years with this rate, we should have 100
		const finalValue = 1000 * rate ** 30
		expect(finalValue).toBeCloseTo(100, 1)
	})

	it('should handle 100% reduction', () => {
		const rate = calculateCompoundReduction(1000, 2020, 2030, 100)
		expect(rate).toBe(0)
	})

	it('should handle 0% reduction (no change)', () => {
		const rate = calculateCompoundReduction(1000, 2020, 2030, 0)
		expect(rate).toBe(1)
	})
})

describe('generateEmissionRows', () => {
	const baseEmissions: BaseYearEmissionsData = {
		scope1Emissions: 100,
		scope2EmissionsMarketBased: 200,
		totalScope3Emissions: 300,
		category1: null,
		category2: null,
		category3: null,
		category4: null,
		category5: null,
		category6: null,
		category7: null,
		category8: null,
		category9: null,
		category10: null,
		category11: null,
		category12: null,
		category13: null,
		category14: null,
		category15: null,
		energyEmissionsStatus: null,
		scope3EmissionsStatus: null,
	}

	it('should generate rows from base year to target year', () => {
		const rows = generateEmissionRows(
			2020,
			2030,
			50,
			undefined,
			undefined,
			baseEmissions,
		)

		expect(rows).toHaveLength(11) // 2020 to 2030 inclusive
		expect(rows[0].year).toBe(2020)
		expect(rows[10].year).toBe(2030)
	})

	it('should mark base year and target year correctly', () => {
		const rows = generateEmissionRows(
			2020,
			2030,
			50,
			undefined,
			undefined,
			baseEmissions,
		)

		const baseRow = rows.find((r) => r.isBaseYear)
		const targetRow = rows.find((r) => r.isTargetYear)

		expect(baseRow?.year).toBe(2020)
		expect(targetRow?.year).toBe(2030)
	})

	it('should calculate correct emissions for base year', () => {
		const rows = generateEmissionRows(
			2020,
			2030,
			50,
			undefined,
			undefined,
			baseEmissions,
		)

		const baseRow = rows[0]
		expect(baseRow.scope1).toBe(100)
		expect(baseRow.scope2).toBe(200)
		expect(baseRow.scope3).toBe(300)
		expect(baseRow.total).toBe(600)
	})

	it('should reduce emissions by approximately 50% at target year', () => {
		const rows = generateEmissionRows(
			2020,
			2030,
			50,
			undefined,
			undefined,
			baseEmissions,
		)

		const targetRow = rows.find((r) => r.isTargetYear)
		expect(targetRow?.total).toBeCloseTo(300, 0) // 50% of 600
	})

	it('should generate rows to long-term target year when provided', () => {
		const rows = generateEmissionRows(2020, 2030, 50, 2050, 90, baseEmissions)

		expect(rows).toHaveLength(31) // 2020 to 2050 inclusive
		expect(rows[30].year).toBe(2050)
	})

	it('should mark long-term target year correctly', () => {
		const rows = generateEmissionRows(2020, 2030, 50, 2050, 90, baseEmissions)

		const longTermRow = rows.find((r) => r.isLongTermTargetYear)
		expect(longTermRow?.year).toBe(2050)
	})

	it('should reduce emissions by approximately 90% at long-term target year', () => {
		const rows = generateEmissionRows(2020, 2030, 50, 2050, 90, baseEmissions)

		const longTermRow = rows.find((r) => r.isLongTermTargetYear)
		expect(longTermRow?.total).toBeCloseTo(60, 0) // 10% of 600
	})

	it('should handle zero emissions', () => {
		const zeroEmissions: BaseYearEmissionsData = {
			...baseEmissions,
			scope1Emissions: 0,
			scope2EmissionsMarketBased: 0,
			totalScope3Emissions: 0,
		}

		const rows = generateEmissionRows(
			2020,
			2030,
			50,
			undefined,
			undefined,
			zeroEmissions,
		)

		expect(rows[0].total).toBe(0)
		expect(rows[10].total).toBe(0)
	})

	it('should round values to 2 decimal places', () => {
		const rows = generateEmissionRows(
			2020,
			2030,
			33.333,
			undefined,
			undefined,
			baseEmissions,
		)

		// Check that all values are rounded to 2 decimals
		for (const row of rows) {
			expect(
				row.scope1.toString().split('.')[1]?.length || 0,
			).toBeLessThanOrEqual(2)
			expect(
				row.scope2.toString().split('.')[1]?.length || 0,
			).toBeLessThanOrEqual(2)
			expect(
				row.scope3.toString().split('.')[1]?.length || 0,
			).toBeLessThanOrEqual(2)
			expect(
				row.total.toString().split('.')[1]?.length || 0,
			).toBeLessThanOrEqual(2)
		}
	})
})

describe('updateScope1Projections', () => {
	const baseProjections: EmissionRow[] = [
		{
			year: 2020,
			scope1: 100,
			scope2: 200,
			scope3: 300,
			total: 600,
			isBaseYear: true,
		},
		{ year: 2021, scope1: 90, scope2: 180, scope3: 270, total: 540 },
		{ year: 2022, scope1: 80, scope2: 160, scope3: 240, total: 480 },
		{ year: 2023, scope1: 70, scope2: 140, scope3: 210, total: 420 },
		{ year: 2024, scope1: 60, scope2: 120, scope3: 180, total: 360 },
		{
			year: 2025,
			scope1: 50,
			scope2: 100,
			scope3: 150,
			total: 300,
			isTargetYear: true,
		},
	]

	it('should update scope1 values while keeping scope2 and scope3 unchanged', () => {
		const updated = updateScope1Projections(baseProjections, 60, undefined)

		// Scope 2 and 3 should remain unchanged
		expect(updated[0].scope2).toBe(200)
		expect(updated[0].scope3).toBe(300)

		// Scope 1 should be updated
		expect(updated[0].scope1).toBe(100) // Base year unchanged
		expect(updated[5].scope1).toBeCloseTo(40, 0) // 60% reduction from 100
	})

	it('should recalculate total emissions', () => {
		const updated = updateScope1Projections(baseProjections, 60, undefined)

		// Total should be recalculated
		// Scope1: 40 (60% reduction from 100), Scope2: 100 (unchanged), Scope3: 150 (unchanged)
		expect(updated[5].total).toBeCloseTo(290, 0) // 40 + 100 + 150
	})

	it('should return original projections if base or target row is missing', () => {
		const invalidProjections: EmissionRow[] = [
			{ year: 2020, scope1: 100, scope2: 200, scope3: 300, total: 600 },
		]

		const updated = updateScope1Projections(invalidProjections, 50, undefined)
		expect(updated).toEqual(invalidProjections)
	})

	it('should handle long-term target reduction', () => {
		const projectionsWithLongTerm: EmissionRow[] = [
			...baseProjections,
			{ year: 2026, scope1: 40, scope2: 80, scope3: 120, total: 240 },
			{ year: 2027, scope1: 30, scope2: 60, scope3: 90, total: 180 },
			{ year: 2028, scope1: 20, scope2: 40, scope3: 60, total: 120 },
			{ year: 2029, scope1: 10, scope2: 20, scope3: 30, total: 60 },
			{
				year: 2030,
				scope1: 5,
				scope2: 10,
				scope3: 15,
				total: 30,
				isLongTermTargetYear: true,
			},
		]

		const updated = updateScope1Projections(projectionsWithLongTerm, 50, 90)

		// Long-term target should be approximately 10 (90% reduction from 100)
		const longTermRow = updated.find((r) => r.isLongTermTargetYear)
		expect(longTermRow?.scope1).toBeCloseTo(10, 0)
	})
})

describe('updateScope2Projections', () => {
	const baseProjections: EmissionRow[] = [
		{
			year: 2020,
			scope1: 100,
			scope2: 200,
			scope3: 300,
			total: 600,
			isBaseYear: true,
		},
		{ year: 2021, scope1: 90, scope2: 180, scope3: 270, total: 540 },
		{ year: 2022, scope1: 80, scope2: 160, scope3: 240, total: 480 },
		{ year: 2023, scope1: 70, scope2: 140, scope3: 210, total: 420 },
		{ year: 2024, scope1: 60, scope2: 120, scope3: 180, total: 360 },
		{
			year: 2025,
			scope1: 50,
			scope2: 100,
			scope3: 150,
			total: 300,
			isTargetYear: true,
		},
	]

	it('should update scope2 values while keeping scope1 and scope3 unchanged', () => {
		const updated = updateScope2Projections(baseProjections, 60, undefined)

		// Scope 1 and 3 should remain unchanged
		expect(updated[0].scope1).toBe(100)
		expect(updated[0].scope3).toBe(300)

		// Scope 2 should be updated
		expect(updated[0].scope2).toBe(200) // Base year unchanged
		expect(updated[5].scope2).toBeCloseTo(80, 0) // 60% reduction from 200
	})

	it('should recalculate total emissions', () => {
		const updated = updateScope2Projections(baseProjections, 60, undefined)

		// Total should be recalculated
		// Scope1: 50 (unchanged), Scope2: 80 (60% reduction from 200), Scope3: 150 (unchanged)
		expect(updated[5].total).toBeCloseTo(280, 0) // 50 + 80 + 150
	})

	it('should return original projections if base or target row is missing', () => {
		const invalidProjections: EmissionRow[] = [
			{ year: 2020, scope1: 100, scope2: 200, scope3: 300, total: 600 },
		]

		const updated = updateScope2Projections(invalidProjections, 50, undefined)
		expect(updated).toEqual(invalidProjections)
	})
})

describe('calculateOverallReductions', () => {
	it('should calculate target reduction percentage correctly', () => {
		const projections: EmissionRow[] = [
			{
				year: 2020,
				scope1: 100,
				scope2: 200,
				scope3: 300,
				total: 600,
				isBaseYear: true,
			},
			{
				year: 2025,
				scope1: 50,
				scope2: 100,
				scope3: 150,
				total: 300,
				isTargetYear: true,
			},
		]

		const result = calculateOverallReductions(projections)
		expect(result.targetReduction).toBe(50)
	})

	it('should calculate long-term reduction percentage correctly', () => {
		const projections: EmissionRow[] = [
			{
				year: 2020,
				scope1: 100,
				scope2: 200,
				scope3: 300,
				total: 600,
				isBaseYear: true,
			},
			{
				year: 2025,
				scope1: 50,
				scope2: 100,
				scope3: 150,
				total: 300,
				isTargetYear: true,
			},
			{
				year: 2030,
				scope1: 10,
				scope2: 20,
				scope3: 30,
				total: 60,
				isLongTermTargetYear: true,
			},
		]

		const result = calculateOverallReductions(projections)
		expect(result.targetReduction).toBe(50)
		expect(result.longTermTargetReduction).toBe(90)
	})

	it('should return 0 when base or target row is missing', () => {
		const projections: EmissionRow[] = [
			{ year: 2020, scope1: 100, scope2: 200, scope3: 300, total: 600 },
		]

		const result = calculateOverallReductions(projections)
		expect(result.targetReduction).toBe(0)
	})

	it('should handle zero base total', () => {
		const projections: EmissionRow[] = [
			{
				year: 2020,
				scope1: 0,
				scope2: 0,
				scope3: 0,
				total: 0,
				isBaseYear: true,
			},
			{
				year: 2025,
				scope1: 0,
				scope2: 0,
				scope3: 0,
				total: 0,
				isTargetYear: true,
			},
		]

		const result = calculateOverallReductions(projections)
		expect(result.targetReduction).toBe(0)
	})

	it('should round results to 2 decimal places', () => {
		const projections: EmissionRow[] = [
			{
				year: 2020,
				scope1: 100,
				scope2: 200,
				scope3: 300,
				total: 600,
				isBaseYear: true,
			},
			{
				year: 2025,
				scope1: 33.33,
				scope2: 66.67,
				scope3: 100,
				total: 200,
				isTargetYear: true,
			},
		]

		const result = calculateOverallReductions(projections)
		// Should be rounded to 2 decimals
		expect(
			result.targetReduction.toString().split('.')[1]?.length || 0,
		).toBeLessThanOrEqual(2)
	})
})
