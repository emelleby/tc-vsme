import { useMutation, useQuery } from 'convex/react'
import { useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import type { useAppForm } from '@/hooks/tanstack-form'
import { useOrgGuard } from '@/hooks/use-org-guard'
import { api } from '../../../../../convex/_generated/api'
import type { Doc } from '../../../../../convex/_generated/dataModel'
import type {
	BaseYearEmissionsData,
	EmissionRow,
	Scope1TargetsFormValues,
	Scope2TargetsFormValues,
	Scope3TargetsFormValues,
	TargetsFormValues,
} from './-schemas'
import {
	scope1TargetsFormSchema,
	scope2TargetsFormSchema,
	scope3TargetsFormSchema,
	targetsFormSchema,
} from './-schemas'
import {
	calculateOverallReductions,
	generateEmissionRows,
	getScope3CategoryProportions,
	updateScope1Projections,
	updateScope2Projections,
	updateScope3Projections,
} from './-utils'

interface UseTargetsDataResult {
	organization: ReturnType<typeof useOrgGuard>['organization']
	orgData: ReturnType<typeof useQuery>
	existingTargets: ReturnType<typeof useQuery>
	environmentalYears: ReturnType<typeof useQuery>
	baseYearEmissionsData: ReturnType<typeof useQuery>
	saveTargets: ReturnType<typeof useMutation>
	yearOptions: { label: string; value: string }[]
	companyName: string
}

/**
 * Hook for fetching all targets-related data
 */
export function useTargetsData(
	selectedBaseYear: number | null,
): UseTargetsDataResult {
	const { organization } = useOrgGuard()

	// Fetch organization data to get company name
	const orgData = useQuery(
		api.organizations.getByClerkOrgId,
		organization ? { clerkOrgId: organization.id } : 'skip',
	)

	// Fetch existing targets for the organization
	const existingTargets = useQuery(
		api.targets.getTargets,
		organization ? {} : 'skip',
	)

	// Fetch reporting years from formEnvironmental table for Base Year dropdown
	const environmentalYears = useQuery(
		api.forms.get.getEnvironmentalReportingYears,
		organization ? {} : 'skip',
	)

	// Fetch emissions data for selected base year
	const baseYearEmissionsData = useQuery(
		api.forms.get.getBaseYearEmissions,
		selectedBaseYear ? { reportingYear: selectedBaseYear } : 'skip',
	)

	// Mutation to save targets
	const saveTargets = useMutation(api.targets.saveTargets)

	// Convert years to select options
	const yearOptions = useMemo(() => {
		return [
			{ label: '- Select year -', value: '' },
			...(environmentalYears ?? []).map((year) => ({
				label: year.toString(),
				value: year.toString(),
			})),
		]
	}, [environmentalYears])

	const companyName = orgData?.name || 'Your Company'

	return {
		organization,
		orgData,
		existingTargets,
		environmentalYears,
		baseYearEmissionsData,
		saveTargets,
		yearOptions,
		companyName,
	}
}

/**
 * Hook for managing the main targets form
 */
export function useTargetsForm(
	existingTargets: Doc<'targets'> | null | undefined,
	baseYearEmissionsData: BaseYearEmissionsData | null | undefined,
	saveTargets: ReturnType<typeof useMutation>,
	selectedBaseYear: number | null,
	setSelectedBaseYear: (year: number | null) => void,
	formHook: typeof useAppForm,
) {
	const [isSaving, setIsSaving] = useState(false)
	const baseYearEmissionsDataRef = useRef(baseYearEmissionsData)
	baseYearEmissionsDataRef.current = baseYearEmissionsData

	// Compute default values from existing targets
	const defaultValues = useMemo(() => {
		if (existingTargets) {
			// If we have existing targets, we should also set the selected base year
			// so that we can fetch the emissions data for it
			if (selectedBaseYear === null && existingTargets.baseYear) {
				setSelectedBaseYear(existingTargets.baseYear)
			}

			return {
				baseYear: existingTargets.baseYear,
				baseYearEmissions: existingTargets.baseYearEmissions,
				targetYear: existingTargets.targetYear,
				targetReduction: existingTargets.targetReduction,
				longTermTargetYear: existingTargets.longTermTargetYear,
				longTermTargetReduction: existingTargets.longTermTargetReduction,
			}
		}
		return {
			baseYear: undefined as number | undefined,
			baseYearEmissions: undefined as number | undefined,
			targetYear: undefined as number | undefined,
			targetReduction: undefined as number | undefined,
			longTermTargetYear: undefined as number | undefined,
			longTermTargetReduction: undefined as number | undefined,
		}
	}, [existingTargets, selectedBaseYear, setSelectedBaseYear])

	// Initialize TanStack Form with default values
	const form = formHook({
		defaultValues: defaultValues as TargetsFormValues,
		validators: {
			onSubmit: targetsFormSchema,
		},
		onSubmit: async ({ value }: { value: TargetsFormValues }) => {
			setIsSaving(true)
			try {
				const currentBaseEmissions = baseYearEmissionsDataRef.current
				let projections: EmissionRow[] = []

				if (currentBaseEmissions) {
					projections = generateEmissionRows(
						value.baseYear,
						value.targetYear,
						value.targetReduction,
						value.longTermTargetYear,
						value.longTermTargetReduction,
						currentBaseEmissions,
					)
				}

				await saveTargets({
					baseYear: value.baseYear,
					baseYearEmissions: value.baseYearEmissions,
					targetYear: value.targetYear,
					targetReduction: value.targetReduction,
					longTermTargetYear: value.longTermTargetYear,
					longTermTargetReduction: value.longTermTargetReduction,
					hasScopeSpecificTargets: {
						scope1: false,
						scope2: false,
						scope3: false,
					},
					projections: projections.length > 0 ? projections : undefined,
				})
				toast.success('Targets saved successfully')
			} catch (error) {
				console.error('Failed to save targets:', error)
				toast.error('Failed to save targets')
			} finally {
				setIsSaving(false)
			}
		},
	})

	return {
		form,
		isSaving,
		defaultValues,
	}
}

/**
 * Hook for computing scope-specific default values
 */
export function useScopeDefaultValues(
	existingTargets: Doc<'targets'> | null | undefined,
	scopeNumber: 1 | 2,
): {
	targetReduction: number | undefined
	targetAbsolute: number | undefined
	longTermTargetReduction: number | undefined
	longTermTargetAbsolute: number | undefined
} {
	return useMemo(() => {
		if (!existingTargets?.projections) {
			return {
				targetReduction: undefined,
				targetAbsolute: undefined,
				longTermTargetReduction: undefined,
				longTermTargetAbsolute: undefined,
			}
		}

		const base = existingTargets.projections.find(
			(p: EmissionRow) => p.isBaseYear,
		)
		const tgt = existingTargets.projections.find(
			(p: EmissionRow) => p.isTargetYear,
		)
		const ltTgt = existingTargets.projections.find(
			(p: EmissionRow) => p.isLongTermTargetYear,
		)

		const baseVal =
			scopeNumber === 1 ? (base?.scope1 ?? 0) : (base?.scope2 ?? 0)
		const targetVal = scopeNumber === 1 ? tgt?.scope1 : tgt?.scope2

		let targetPct: number | undefined
		if (baseVal > 0 && targetVal !== undefined) {
			targetPct = (1 - targetVal / baseVal) * 100
		} else if (baseVal === 0 && targetVal !== undefined) {
			targetPct = 0
		}

		const ltVal = scopeNumber === 1 ? ltTgt?.scope1 : ltTgt?.scope2
		let ltPct: number | undefined
		if (ltVal !== undefined) {
			if (baseVal > 0) {
				ltPct = (1 - ltVal / baseVal) * 100
			} else {
				ltPct = 0
			}
		}

		return {
			targetReduction:
				targetPct !== undefined ? Number(targetPct.toFixed(2)) : undefined,
			targetAbsolute:
				targetVal !== undefined ? Number(targetVal.toFixed(2)) : undefined,
			longTermTargetReduction:
				ltPct !== undefined ? Number(ltPct.toFixed(2)) : undefined,
			longTermTargetAbsolute:
				ltVal !== undefined ? Number(ltVal.toFixed(2)) : undefined,
		}
	}, [existingTargets, scopeNumber])
}

/**
 * Hook for computing Scope 3 specific default values including categories
 */
export function useScope3DefaultValues(
	existingTargets: Doc<'targets'> | null | undefined,
	baseYearEmissionsData: BaseYearEmissionsData | null | undefined,
): Scope3TargetsFormValues {
	return useMemo(() => {
		const baseDefaults = {
			targetReduction: undefined,
			targetAbsolute: undefined,
			longTermTargetReduction: undefined,
			longTermTargetAbsolute: undefined,
		}

		const proportions = baseYearEmissionsData
			? getScope3CategoryProportions(baseYearEmissionsData)
			: Array(15).fill(1 / 15)

		// Initialize all category fields to undefined
		const categoryDefaults: Record<string, number | undefined> = {}
		for (let i = 1; i <= 15; i++) {
			categoryDefaults[`targetCategory${i}`] = undefined
			categoryDefaults[`ltCategory${i}`] = undefined
		}

		if (!existingTargets?.projections) {
			return {
				...baseDefaults,
				...categoryDefaults,
			} as unknown as Scope3TargetsFormValues
		}

		const base = existingTargets.projections.find(
			(p: EmissionRow) => p.isBaseYear,
		)
		const tgt = existingTargets.projections.find(
			(p: EmissionRow) => p.isTargetYear,
		)
		const ltTgt = existingTargets.projections.find(
			(p: EmissionRow) => p.isLongTermTargetYear,
		)

		const baseVal = base?.scope3 ?? 0
		const targetVal = tgt?.scope3
		const ltVal = ltTgt?.scope3

		let targetPct: number | undefined
		if (baseVal > 0 && targetVal !== undefined) {
			targetPct = (1 - targetVal / baseVal) * 100
		} else if (baseVal === 0 && targetVal !== undefined) {
			targetPct = 0
		}

		let ltPct: number | undefined
		if (ltVal !== undefined) {
			if (baseVal > 0) {
				ltPct = (1 - ltVal / baseVal) * 100
			} else {
				ltPct = 0
			}
		}

		// Fill in category values from projections OR fallback to proportional split
		if (tgt?.scope3Categories) {
			for (let i = 1; i <= 15; i++) {
				categoryDefaults[`targetCategory${i}`] =
					tgt.scope3Categories[
						`category${i}` as keyof typeof tgt.scope3Categories
					]
			}
		} else if (targetVal !== undefined) {
			for (let i = 1; i <= 15; i++) {
				categoryDefaults[`targetCategory${i}`] = Number(
					(targetVal * proportions[i - 1]).toFixed(2),
				)
			}
		}

		if (ltTgt?.scope3Categories) {
			for (let i = 1; i <= 15; i++) {
				categoryDefaults[`ltCategory${i}`] =
					ltTgt.scope3Categories[
						`category${i}` as keyof typeof ltTgt.scope3Categories
					]
			}
		} else if (ltVal !== undefined) {
			for (let i = 1; i <= 15; i++) {
				categoryDefaults[`ltCategory${i}`] = Number(
					(ltVal * proportions[i - 1]).toFixed(2),
				)
			}
		}

		return {
			targetReduction:
				targetPct !== undefined ? Number(targetPct.toFixed(2)) : undefined,
			targetAbsolute:
				targetVal !== undefined ? Number(targetVal.toFixed(2)) : undefined,
			longTermTargetReduction:
				ltPct !== undefined ? Number(ltPct.toFixed(2)) : undefined,
			longTermTargetAbsolute:
				ltVal !== undefined ? Number(ltVal.toFixed(2)) : undefined,
			...categoryDefaults,
		} as unknown as Scope3TargetsFormValues
	}, [existingTargets, baseYearEmissionsData])
}

/**
 * Hook for managing the Scope 1 targets form
 */
export function useScope1Form(
	existingTargets: Doc<'targets'> | null | undefined,
	saveTargets: ReturnType<typeof useMutation>,
	formHook: typeof useAppForm,
) {
	const [isSaving, setIsSaving] = useState(false)
	const scope1DefaultValues = useScopeDefaultValues(existingTargets, 1)

	const form = formHook({
		defaultValues: scope1DefaultValues as Scope1TargetsFormValues,
		validators: {
			onSubmit: scope1TargetsFormSchema,
		},
		onSubmit: async ({ value }: { value: Scope1TargetsFormValues }) => {
			setIsSaving(true)
			try {
				if (!existingTargets || !existingTargets.projections) {
					throw new Error('No base projections found')
				}

				const newProjections = updateScope1Projections(
					existingTargets.projections,
					value.targetReduction || 0,
					value.longTermTargetReduction,
				)

				const {
					targetReduction: newGlobalTargetReduction,
					longTermTargetReduction: newGlobalLongTermTargetReduction,
				} = calculateOverallReductions(newProjections)

				await saveTargets({
					baseYear: existingTargets.baseYear,
					baseYearEmissions: existingTargets.baseYearEmissions,
					targetYear: existingTargets.targetYear,
					targetReduction: newGlobalTargetReduction,
					longTermTargetYear: existingTargets.longTermTargetYear,
					longTermTargetReduction:
						newGlobalLongTermTargetReduction ??
						existingTargets.longTermTargetReduction,
					hasScopeSpecificTargets: {
						scope1: true,
						scope2: existingTargets.hasScopeSpecificTargets?.scope2 ?? false,
						scope3: existingTargets.hasScopeSpecificTargets?.scope3 ?? false,
					},
					projections: newProjections,
				})
				toast.success('Scope 1 targets saved successfully')
			} catch (error) {
				console.error('Failed to save Scope 1 targets:', error)
				toast.error('Failed to save Scope 1 targets')
			} finally {
				setIsSaving(false)
			}
		},
	})

	return {
		form,
		isSaving,
	}
}

/**
 * Hook for managing the Scope 2 targets form
 */
export function useScope2Form(
	existingTargets: Doc<'targets'> | null | undefined,
	saveTargets: ReturnType<typeof useMutation>,
	formHook: typeof useAppForm,
) {
	const [isSaving, setIsSaving] = useState(false)
	const scope2DefaultValues = useScopeDefaultValues(existingTargets, 2)

	const form = formHook({
		defaultValues: scope2DefaultValues as Scope2TargetsFormValues,
		validators: {
			onSubmit: scope2TargetsFormSchema,
		},
		onSubmit: async ({ value }: { value: Scope2TargetsFormValues }) => {
			setIsSaving(true)
			try {
				if (!existingTargets || !existingTargets.projections) {
					throw new Error('No base projections found')
				}

				const newProjections = updateScope2Projections(
					existingTargets.projections,
					value.targetReduction || 0,
					value.longTermTargetReduction,
				)

				const {
					targetReduction: newGlobalTargetReduction,
					longTermTargetReduction: newGlobalLongTermTargetReduction,
				} = calculateOverallReductions(newProjections)

				await saveTargets({
					baseYear: existingTargets.baseYear,
					baseYearEmissions: existingTargets.baseYearEmissions,
					targetYear: existingTargets.targetYear,
					targetReduction: newGlobalTargetReduction,
					longTermTargetYear: existingTargets.longTermTargetYear,
					longTermTargetReduction:
						newGlobalLongTermTargetReduction ??
						existingTargets.longTermTargetReduction,
					hasScopeSpecificTargets: {
						scope1: existingTargets.hasScopeSpecificTargets?.scope1 ?? false,
						scope2: true,
						scope3: existingTargets.hasScopeSpecificTargets?.scope3 ?? false,
					},
					projections: newProjections,
				})
				toast.success('Scope 2 targets saved successfully')
			} catch (error) {
				console.error('Failed to save Scope 2 targets:', error)
				toast.error('Failed to save Scope 2 targets')
			} finally {
				setIsSaving(false)
			}
		},
	})

	return {
		form,
		isSaving,
	}
}

/**
 * Hook for managing the Scope 3 targets form
 */
export function useScope3Form(
	existingTargets: Doc<'targets'> | null | undefined,
	baseYearEmissionsData: BaseYearEmissionsData | null | undefined,
	saveTargets: ReturnType<typeof useMutation>,
	formHook: typeof useAppForm,
) {
	const [isSaving, setIsSaving] = useState(false)
	const scope3DefaultValues = useScope3DefaultValues(
		existingTargets,
		baseYearEmissionsData,
	)

	const form = formHook({
		defaultValues: scope3DefaultValues,
		validators: {
			onSubmit: scope3TargetsFormSchema,
		},
		onSubmit: async ({ value }: { value: Scope3TargetsFormValues }) => {
			setIsSaving(true)
			try {
				if (!existingTargets || !existingTargets.projections) {
					throw new Error('No base projections found')
				}

				// Extract category values for target and long-term target
				const targetCategoryValues: Record<string, number | undefined> = {}
				const ltCategoryValues: Record<string, number | undefined> = {}

				for (let i = 1; i <= 15; i++) {
					targetCategoryValues[`targetCategory${i}`] = value[
						`targetCategory${i}` as keyof Scope3TargetsFormValues
					] as number | undefined
					ltCategoryValues[`ltCategory${i}`] = value[
						`ltCategory${i}` as keyof Scope3TargetsFormValues
					] as number | undefined
				}

				const newProjections = updateScope3Projections(
					existingTargets.projections,
					value.targetReduction || 0,
					value.longTermTargetReduction,
					targetCategoryValues,
					ltCategoryValues,
				)

				const {
					targetReduction: newGlobalTargetReduction,
					longTermTargetReduction: newGlobalLongTermTargetReduction,
				} = calculateOverallReductions(newProjections)

				await saveTargets({
					baseYear: existingTargets.baseYear,
					baseYearEmissions: existingTargets.baseYearEmissions,
					targetYear: existingTargets.targetYear,
					targetReduction: newGlobalTargetReduction,
					longTermTargetYear: existingTargets.longTermTargetYear,
					longTermTargetReduction:
						newGlobalLongTermTargetReduction ??
						existingTargets.longTermTargetReduction,
					hasScopeSpecificTargets: {
						scope1: existingTargets.hasScopeSpecificTargets?.scope1 ?? false,
						scope2: existingTargets.hasScopeSpecificTargets?.scope2 ?? false,
						scope3: true,
					},
					projections: newProjections,
				})
				toast.success('Scope 3 targets saved successfully')
			} catch (error) {
				console.error('Failed to save Scope 3 targets:', error)
				toast.error('Failed to save Scope 3 targets')
			} finally {
				setIsSaving(false)
			}
		},
	})

	return {
		form,
		isSaving,
	}
}

/**
 * Hook for computing derived values from targets data
 */
export function useTargetsComputedValues(
	existingTargets: Doc<'targets'> | null | undefined,
	baseYearEmissionsData: BaseYearEmissionsData | null | undefined,
	formValues: TargetsFormValues,
) {
	// Get base scope values from projections
	const baseScope1Proj = existingTargets?.projections?.find(
		(p: EmissionRow) => p.isBaseYear,
	)
	const baseScope1Value = baseScope1Proj?.scope1 ?? 0

	const baseScope2Proj = existingTargets?.projections?.find(
		(p: EmissionRow) => p.isBaseYear,
	)
	const baseScope2Value = baseScope2Proj?.scope2 ?? 0

	const baseScope3Proj = existingTargets?.projections?.find(
		(p: EmissionRow) => p.isBaseYear,
	)
	const baseScope3Value = baseScope3Proj?.scope3 ?? 0

	// Generate table data efficiently
	const tableData = useMemo(() => {
		if (
			!baseYearEmissionsData ||
			!formValues.baseYear ||
			!formValues.targetYear ||
			!formValues.targetReduction
		) {
			return []
		}

		return generateEmissionRows(
			formValues.baseYear,
			formValues.targetYear,
			formValues.targetReduction,
			formValues.longTermTargetYear,
			formValues.longTermTargetReduction,
			baseYearEmissionsData,
		)
	}, [
		baseYearEmissionsData,
		formValues.baseYear,
		formValues.targetYear,
		formValues.targetReduction,
		formValues.longTermTargetYear,
		formValues.longTermTargetReduction,
	])

	// Check if scope-specific targets are active
	const hasSpecificTargetsActive = useMemo(() => {
		if (!existingTargets?.hasScopeSpecificTargets) return false
		const targets = existingTargets.hasScopeSpecificTargets
		return targets.scope1 || targets.scope2 || targets.scope3
	}, [existingTargets])

	return {
		baseScope1Value,
		baseScope2Value,
		baseScope3Value,
		tableData,
		hasSpecificTargetsActive,
	}
}
