import type { BaseYearEmissionsData, EmissionRow } from './-schemas'

/**
 * Calculate total emissions from base year emissions data
 * Treats null values as zero
 */
export function calculateTotalEmissions(
	data: BaseYearEmissionsData | null,
): number {
	if (!data) return 0
	const scope1 = data.scope1Emissions ?? 0
	const scope2 = data.scope2EmissionsMarketBased ?? 0
	const scope3 = data.totalScope3Emissions ?? 0
	return scope1 + scope2 + scope3
}

/**
 * Calculate compound annual reduction rate
 * Returns the annual multiplier to achieve the target reduction
 */
export function calculateCompoundReduction(
	startValue: number,
	startYear: number,
	endYear: number,
	reductionPercentage: number,
): number {
	if (startYear >= endYear) return 0 // Should not happen given constraints
	const targetValue = startValue * (1 - reductionPercentage / 100)
	// CAGR formula: (End / Start)^(1 / n) - 1
	// Here we want the factor x such that Start * x^n = Target
	// x = (Target / Start)^(1 / n)
	if (startValue === 0) return 0

	const n = endYear - startYear
	const rate = (targetValue / startValue) ** (1 / n)
	return rate
}

/**
 * Generate emission projection rows for all years from base to target/long-term
 * Applies compound reduction rates for each scope
 */
export function generateEmissionRows(
	baseYear: number,
	targetYear: number,
	targetReduction: number,
	longTermTargetYear: number | undefined,
	longTermTargetReduction: number | undefined,
	baseEmissions: BaseYearEmissionsData,
): EmissionRow[] {
	const rows: EmissionRow[] = []
	const startYear = baseYear
	// If long term target is present and valid (after target year), go up to that
	// otherwise just go to target year
	const endYear =
		longTermTargetYear && longTermTargetYear > targetYear
			? longTermTargetYear
			: targetYear

	// Initial values
	let currentScope1 = baseEmissions.scope1Emissions ?? 0
	let currentScope2 = baseEmissions.scope2EmissionsMarketBased ?? 0
	let currentScope3 = baseEmissions.totalScope3Emissions ?? 0

	// 1. Calculate rate for Base -> Target
	const rate1Scope1 = calculateCompoundReduction(
		baseEmissions.scope1Emissions ?? 0,
		baseYear,
		targetYear,
		targetReduction,
	)
	const rate1Scope2 = calculateCompoundReduction(
		baseEmissions.scope2EmissionsMarketBased ?? 0,
		baseYear,
		targetYear,
		targetReduction,
	)
	const rate1Scope3 = calculateCompoundReduction(
		baseEmissions.totalScope3Emissions ?? 0,
		baseYear,
		targetYear,
		targetReduction,
	)

	// 2. Calculate rate for Target -> Long Term (if applicable)
	let rate2Scope1 = 0
	let rate2Scope2 = 0
	let rate2Scope3 = 0

	if (
		longTermTargetYear &&
		longTermTargetReduction !== undefined &&
		longTermTargetYear > targetYear
	) {
		// We need the values AT target year to calculate the next leg
		const targetScope1 =
			(baseEmissions.scope1Emissions ?? 0) * (1 - targetReduction / 100)
		const targetScope2 =
			(baseEmissions.scope2EmissionsMarketBased ?? 0) *
			(1 - targetReduction / 100)
		const targetScope3 =
			(baseEmissions.totalScope3Emissions ?? 0) * (1 - targetReduction / 100)

		// Calculate rate from Target Year value -> Long Term value relative to Base Year
		// The Long Term Reduction is usually relative to Base Year
		const longTermValueScope1 =
			(baseEmissions.scope1Emissions ?? 0) * (1 - longTermTargetReduction / 100)
		const longTermValueScope2 =
			(baseEmissions.scope2EmissionsMarketBased ?? 0) *
			(1 - longTermTargetReduction / 100)
		const longTermValueScope3 =
			(baseEmissions.totalScope3Emissions ?? 0) *
			(1 - longTermTargetReduction / 100)

		// Calculate annual reduction rate for the second period
		// Formula: (Final / Intermediate)^(1 / n_years_period_2)
		const n2 = longTermTargetYear - targetYear
		if (targetScope1 > 0)
			rate2Scope1 = (longTermValueScope1 / targetScope1) ** (1 / n2)
		if (targetScope2 > 0)
			rate2Scope2 = (longTermValueScope2 / targetScope2) ** (1 / n2)
		if (targetScope3 > 0)
			rate2Scope3 = (longTermValueScope3 / targetScope3) ** (1 / n2)
	}

	for (let y = startYear; y <= endYear; y++) {
		// Round to 2 decimals
		const s1 = Number(currentScope1.toFixed(2))
		const s2 = Number(currentScope2.toFixed(2))
		const s3 = Number(currentScope3.toFixed(2))
		const tot = Number(
			(currentScope1 + currentScope2 + currentScope3).toFixed(2),
		)

		rows.push({
			year: y,
			scope1: s1,
			scope2: s2,
			scope3: s3,
			total: tot,
			isBaseYear: y === baseYear,
			isTargetYear: y === targetYear,
			isLongTermTargetYear: longTermTargetYear
				? y === longTermTargetYear
				: undefined,
		})

		// Prepare for next iteration
		if (y < targetYear) {
			currentScope1 *= rate1Scope1
			currentScope2 *= rate1Scope2
			currentScope3 *= rate1Scope3
		} else if (y >= targetYear && y < endYear) {
			currentScope1 *= rate2Scope1
			currentScope2 *= rate2Scope2
			currentScope3 *= rate2Scope3
		}
	}

	return rows
}

/**
 * Update Scope 1 projections in existing emission rows
 * Recalculates Scope 1 values based on new target reduction percentages
 */
export function updateScope1Projections(
	existingProjections: EmissionRow[],
	targetReduction: number,
	longTermTargetReduction: number | undefined,
): EmissionRow[] {
	const rows = [...existingProjections]
	const baseRow = rows.find((r) => r.isBaseYear)
	const targetRow = rows.find((r) => r.isTargetYear)
	const longTermRow = rows.find((r) => r.isLongTermTargetYear)

	if (!baseRow || !targetRow) return rows

	const baseYear = baseRow.year
	const targetYear = targetRow.year
	const longTermTargetYear = longTermRow?.year
	const baseScope1 = baseRow.scope1

	const rate1Scope1 = calculateCompoundReduction(
		baseScope1,
		baseYear,
		targetYear,
		targetReduction,
	)

	let rate2Scope1 = 0

	if (
		longTermTargetYear &&
		longTermTargetReduction !== undefined &&
		longTermTargetYear > targetYear
	) {
		const targetScope1 = baseScope1 * (1 - targetReduction / 100)
		const longTermValueScope1 = baseScope1 * (1 - longTermTargetReduction / 100)
		const n2 = longTermTargetYear - targetYear
		if (targetScope1 > 0) {
			rate2Scope1 = (longTermValueScope1 / targetScope1) ** (1 / n2)
		}
	}

	let currentScope1 = baseScope1

	return rows.map((row) => {
		const y = row.year
		const newScope1 = currentScope1

		if (y < targetYear) {
			currentScope1 *= rate1Scope1
		} else if (
			longTermTargetYear &&
			y >= targetYear &&
			y < longTermTargetYear
		) {
			currentScope1 *= rate2Scope1
		}

		const s1 = Number(newScope1.toFixed(2))
		const s2 = row.scope2
		const s3 = row.scope3
		const tot = Number((s1 + s2 + s3).toFixed(2))

		return {
			...row,
			scope1: s1,
			total: tot,
		}
	})
}

/**
 * Update Scope 2 projections in existing emission rows
 * Recalculates Scope 2 values based on new target reduction percentages
 */
export function updateScope2Projections(
	existingProjections: EmissionRow[],
	targetReduction: number,
	longTermTargetReduction: number | undefined,
): EmissionRow[] {
	const rows = [...existingProjections]
	const baseRow = rows.find((r) => r.isBaseYear)
	const targetRow = rows.find((r) => r.isTargetYear)
	const longTermRow = rows.find((r) => r.isLongTermTargetYear)

	if (!baseRow || !targetRow) return rows

	const baseYear = baseRow.year
	const targetYear = targetRow.year
	const longTermTargetYear = longTermRow?.year
	const baseScope2 = baseRow.scope2

	const rate1Scope2 = calculateCompoundReduction(
		baseScope2,
		baseYear,
		targetYear,
		targetReduction,
	)

	let rate2Scope2 = 0

	if (
		longTermTargetYear &&
		longTermTargetReduction !== undefined &&
		longTermTargetYear > targetYear
	) {
		const targetScope2 = baseScope2 * (1 - targetReduction / 100)
		const longTermValueScope2 = baseScope2 * (1 - longTermTargetReduction / 100)
		const n2 = longTermTargetYear - targetYear
		if (targetScope2 > 0) {
			rate2Scope2 = (longTermValueScope2 / targetScope2) ** (1 / n2)
		}
	}

	let currentScope2 = baseScope2

	return rows.map((row) => {
		const y = row.year
		const newScope2 = currentScope2

		if (y < targetYear) {
			currentScope2 *= rate1Scope2
		} else if (
			longTermTargetYear &&
			y >= targetYear &&
			y < longTermTargetYear
		) {
			currentScope2 *= rate2Scope2
		}

		const s1 = row.scope1
		const s2 = Number(newScope2.toFixed(2))
		const s3 = row.scope3
		const tot = Number((s1 + s2 + s3).toFixed(2))

		return {
			...row,
			scope2: s2,
			total: tot,
		}
	})
}

/**
 * Calculate proportions for Scope 3 categories from base year data
 */
export function getScope3CategoryProportions(
	baseEmissions: BaseYearEmissionsData,
): number[] {
	const total = baseEmissions.totalScope3Emissions || 0
	if (total <= 0) {
		// Fallback: equal split across all 15 categories
		return Array(15).fill(1 / 15)
	}

	return Array.from({ length: 15 }, (_, i) => {
		const catVal =
			(baseEmissions[
				`category${i + 1}` as keyof BaseYearEmissionsData
			] as number) || 0
		return catVal / total
	})
}

/**
 * Update Scope 3 projections in existing emission rows
 */
export function updateScope3Projections(
	existingProjections: EmissionRow[],
	targetReduction: number,
	longTermTargetReduction: number | undefined,
	targetCategoryValues: Record<string, number | undefined>,
	ltCategoryValues?: Record<string, number | undefined>,
): EmissionRow[] {
	const rows = [...existingProjections]
	const baseRow = rows.find((r) => r.isBaseYear)
	const targetRow = rows.find((r) => r.isTargetYear)
	const longTermRow = rows.find((r) => r.isLongTermTargetYear)

	if (!baseRow || !targetRow) return rows

	const baseYear = baseRow.year
	const targetYear = targetRow.year
	const longTermTargetYear = longTermRow?.year
	const baseScope3 = baseRow.scope3

	const rate1Scope3 = calculateCompoundReduction(
		baseScope3,
		baseYear,
		targetYear,
		targetReduction,
	)

	let rate2Scope3 = 0
	if (
		longTermTargetYear &&
		longTermTargetReduction !== undefined &&
		longTermTargetYear > targetYear
	) {
		const targetScope3 = baseScope3 * (1 - targetReduction / 100)
		const longTermValueScope3 = baseScope3 * (1 - longTermTargetReduction / 100)
		const n2 = longTermTargetYear - targetYear
		if (targetScope3 > 0) {
			rate2Scope3 = (longTermValueScope3 / targetScope3) ** (1 / n2)
		}
	}

	let currentScope3 = baseScope3

	return rows.map((row) => {
		const y = row.year
		const newScope3 = currentScope3

		if (y < targetYear) {
			currentScope3 *= rate1Scope3
		} else if (
			longTermTargetYear &&
			y >= targetYear &&
			y < longTermTargetYear
		) {
			currentScope3 *= rate2Scope3
		}

		const s1 = row.scope1
		const s2 = row.scope2
		const s3 = Number(newScope3.toFixed(2))
		const tot = Number((s1 + s2 + s3).toFixed(2))

		const newRow: EmissionRow = {
			...row,
			scope3: s3,
			total: tot,
		}

		// Store category breakdown on target and long-term target rows
		if (y === targetYear) {
			newRow.scope3Categories = {}
			for (let i = 1; i <= 15; i++) {
				const val = targetCategoryValues[`targetCategory${i}`]
				if (val !== undefined) {
					newRow.scope3Categories[
						`category${i}` as keyof typeof newRow.scope3Categories
					] = Number(val.toFixed(2))
				}
			}
		} else if (y === longTermTargetYear && ltCategoryValues) {
			newRow.scope3Categories = {}
			for (let i = 1; i <= 15; i++) {
				const val = ltCategoryValues[`ltCategory${i}`]
				if (val !== undefined) {
					newRow.scope3Categories[
						`category${i}` as keyof typeof newRow.scope3Categories
					] = Number(val.toFixed(2))
				}
			}
		}

		return newRow
	})
}

/**
 * Calculate overall reduction percentages from emission projections
 * Returns target and long-term reduction percentages relative to base year
 */
export function calculateOverallReductions(projections: EmissionRow[]): {
	targetReduction: number
	longTermTargetReduction?: number
} {
	const baseRow = projections.find((p) => p.isBaseYear)
	const targetRow = projections.find((p) => p.isTargetYear)
	const longTermRow = projections.find((p) => p.isLongTermTargetYear)

	if (!baseRow || !targetRow) {
		return { targetReduction: 0 }
	}

	const baseTotal = baseRow.total
	let targetReduction = 0
	let longTermTargetReduction: number | undefined

	if (baseTotal > 0) {
		targetReduction = (1 - targetRow.total / baseTotal) * 100

		if (longTermRow) {
			longTermTargetReduction = (1 - longTermRow.total / baseTotal) * 100
		}
	} else if (baseTotal === 0 && targetRow.total !== undefined) {
		targetReduction = 0
		if (longTermRow) {
			longTermTargetReduction = 0
		}
	}

	return {
		targetReduction: Number(targetReduction.toFixed(2)),
		longTermTargetReduction:
			longTermTargetReduction !== undefined
				? Number(longTermTargetReduction.toFixed(2))
				: undefined,
	}
}
