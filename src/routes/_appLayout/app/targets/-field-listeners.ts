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
