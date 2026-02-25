/**
 * Creates a listener that syncs reduction percentage to absolute value
 * When user enters a percentage, calculates the corresponding absolute emissions
 */
export function createReductionToAbsoluteListener(
	form: {
		getFieldValue: (name: string) => number | undefined
		setFieldValue: (name: string, value: number) => void
	},
	baseValue: number,
	absoluteFieldName: string,
) {
	return {
		onBlur: ({ value }: { value: number | undefined }) => {
			if (value !== undefined && baseValue > 0) {
				const expected = baseValue * (1 - value / 100)
				const current = form.getFieldValue(absoluteFieldName)
				if (Math.abs(expected - (current || 0)) > 0.01) {
					form.setFieldValue(absoluteFieldName, Number(expected.toFixed(2)))
				}
			}
		},
	}
}

/**
 * Creates a listener that syncs absolute value to reduction percentage
 * When user enters absolute emissions, calculates the corresponding percentage
 */
export function createAbsoluteToReductionListener(
	form: {
		getFieldValue: (name: string) => number | undefined
		setFieldValue: (name: string, value: number) => void
	},
	baseValue: number,
	reductionFieldName: string,
) {
	return {
		onBlur: ({ value }: { value: number | undefined }) => {
			if (value !== undefined && baseValue > 0) {
				const expectedPct = (1 - value / baseValue) * 100
				const currentPct = form.getFieldValue(reductionFieldName)
				if (Math.abs(expectedPct - (currentPct || 0)) > 0.01) {
					form.setFieldValue(reductionFieldName, Number(expectedPct.toFixed(2)))
				}
			}
		},
	}
}

/**
 * Combined field listeners for scope-specific target forms
 * Provides both percentage → absolute and absolute → percentage sync
 */
export interface ScopeFieldListenersProps {
	form: {
		getFieldValue: (name: string) => number | undefined
		setFieldValue: (name: string, value: number) => void
	}
	baseValue: number
	targetReductionField: string
	targetAbsoluteField: string
	longTermTargetReductionField: string
	longTermTargetAbsoluteField: string
}

/**
 * Creates all field listeners for a scope form
 * Returns an object with listeners for each field
 */
export function createScopeFieldListeners({
	form,
	baseValue,
	targetReductionField,
	targetAbsoluteField,
	longTermTargetReductionField,
	longTermTargetAbsoluteField,
}: ScopeFieldListenersProps) {
	return {
		targetReduction: createReductionToAbsoluteListener(
			form,
			baseValue,
			targetAbsoluteField,
		),
		targetAbsolute: createAbsoluteToReductionListener(
			form,
			baseValue,
			targetReductionField,
		),
		longTermTargetReduction: createReductionToAbsoluteListener(
			form,
			baseValue,
			longTermTargetAbsoluteField,
		),
		longTermTargetAbsolute: createAbsoluteToReductionListener(
			form,
			baseValue,
			longTermTargetReductionField,
		),
	}
}

/**
 * Creates listeners for Scope 3 totals to redistribute across categories
 */
export function createScope3TotalToCategories(
	form: {
		setFieldValue: (name: string, value: number) => void
	},
	proportions: number[],
	isLongTerm: boolean = false,
) {
	return {
		onBlur: ({ value }: { value: number | undefined }) => {
			if (value !== undefined) {
				const prefix = isLongTerm ? 'ltCategory' : 'targetCategory'
				proportions.forEach((prop, i) => {
					const categoryVal = value * prop
					form.setFieldValue(
						`${prefix}${i + 1}`,
						Number(categoryVal.toFixed(2)),
					)
				})
			}
		},
	}
}

/**
 * Creates listeners for individual Scope 3 categories to update totals
 */
export function createScope3CategoryToTotal(
	form: {
		getFieldValue: (name: string) => number | undefined
		setFieldValue: (name: string, value: number) => void
	},
	baseValue: number,
	isLongTerm: boolean = false,
) {
	return {
		onBlur: () => {
			const prefix = isLongTerm ? 'ltCategory' : 'targetCategory'
			const totalField = isLongTerm
				? 'longTermTargetAbsolute'
				: 'targetAbsolute'
			const reductionField = isLongTerm
				? 'longTermTargetReduction'
				: 'targetReduction'

			let newTotal = 0
			for (let i = 1; i <= 15; i++) {
				newTotal += form.getFieldValue(`${prefix}${i}`) || 0
			}

			form.setFieldValue(totalField, Number(newTotal.toFixed(2)))

			if (baseValue > 0) {
				const reduction = (1 - newTotal / baseValue) * 100
				form.setFieldValue(reductionField, Number(reduction.toFixed(2)))
			}
		},
	}
}
