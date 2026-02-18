import { useQuery } from '@tanstack/react-query'
import { useStore as useYearStore } from '@tanstack/react-store'
import { useAction } from 'convex/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FormButtons } from '@/hooks/tanstack-form'
import { useFormSubmission } from '@/hooks/use-form-submission'
import { useOrgGuard } from '@/hooks/use-org-guard'
import {
	type C2Scope3EmissionsFormValues,
	c2Scope3EmissionsSchema,
	SCOPE_3_CATEGORIES,
} from '@/lib/forms/schemas/c2-scope3-emissions-schema'
import { yearStore } from '@/lib/year-store'
import { api } from '../../../convex/_generated/api'

type MongoEmissionsData = {
	Scope3?: number
	scope3Categories?: {
		cat1?: number
		cat2?: number
		cat3?: number
		cat4?: number
		cat5?: number
		cat6?: number
		cat7?: number
		cat8?: number
		cat9?: number
		cat10?: number
		cat11?: number
		cat12?: number
		cat13?: number
		cat14?: number
		cat15?: number
		[key: string]: unknown
	}
	[key: string]: unknown
}

/**
 * Maps MongoDB emissions data to form default values.
 * Extracts Scope 3 totals and category breakdowns.
 */
function mapMongoToFormDefaults(
	data: MongoEmissionsData | null | undefined,
): Partial<C2Scope3EmissionsFormValues> {
	if (!data) return {}

	const scope3Categories = data.scope3Categories || {}

	return {
		totalScope3Emissions: data.Scope3 || 0,
		category1: scope3Categories.cat1 || 0,
		category2: scope3Categories.cat2 || 0,
		category3: scope3Categories.cat3 || 0,
		category4: scope3Categories.cat4 || 0,
		category5: scope3Categories.cat5 || 0,
		category6: scope3Categories.cat6 || 0,
		category7: scope3Categories.cat7 || 0,
		category8: scope3Categories.cat8 || 0,
		category9: scope3Categories.cat9 || 0,
		category10: scope3Categories.cat10 || 0,
		category11: scope3Categories.cat11 || 0,
		category12: scope3Categories.cat12 || 0,
		category13: scope3Categories.cat13 || 0,
		category14: scope3Categories.cat14 || 0,
		category15: scope3Categories.cat15 || 0,
	}
}

const listVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
		},
	},
}

const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0 },
}

export function C2Scope3EmissionsForm() {
	const reportingYear = useYearStore(yearStore, (state) => state.selectedYear)
	const { organization } = useOrgGuard()
	const getEmissions = useAction(api.emissions.getEmissionsByOrgId)

	// Fetch MongoDB emissions data with TanStack Query for caching
	const {
		data: mongoDefaults,
		isLoading: isMongoLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ['emissions', organization?.id, reportingYear],
		queryFn: async () => {
			const result = await getEmissions({
				orgIdToUse: organization!.id,
				year: reportingYear,
			})

			if (result.success && result.data) {
				return mapMongoToFormDefaults(result.data as MongoEmissionsData)
			}

			return {}
		},
		enabled: !!organization?.id,
		staleTime: 5 * 60 * 1000, // Cache for 5 minutes
		retry: 1, // Only retry once on failure
	})

	// Merge base defaults with MongoDB defaults
	const defaultValues = useMemo<C2Scope3EmissionsFormValues>(() => {
		const baseDefaults: C2Scope3EmissionsFormValues = {
			reportingYear: reportingYear.toString(),
			totalScope3Emissions: 0,
			category1: 0,
			category2: 0,
			category3: 0,
			category4: 0,
			category5: 0,
			category6: 0,
			category7: 0,
			category8: 0,
			category9: 0,
			category10: 0,
			category11: 0,
			category12: 0,
			category13: 0,
			category14: 0,
			category15: 0,
		}

		return {
			...baseDefaults,
			...mongoDefaults,
		} as C2Scope3EmissionsFormValues
	}, [reportingYear, mongoDefaults])

	const { form, status, isSaving, isLoading, saveDraft, submit, reopen } =
		useFormSubmission<C2Scope3EmissionsFormValues>({
			table: 'formEnvironmental',
			reportingYear,
			section: 'scope3Emissions',
			schema: c2Scope3EmissionsSchema,
			defaultValues,
		})

	// Combined loading state
	const isFormLoading = isLoading || isMongoLoading

	if (isFormLoading) {
		return (
			<div className="flex items-center justify-center p-8 text-muted-foreground">
				Loading form data...
			</div>
		)
	}

	if (isError) {
		return (
			<div className="flex items-center justify-center p-8 text-destructive">
				<p>
					Failed to load emissions data: {error?.message || 'Unknown error'}
				</p>
			</div>
		)
	}

	return (
		<form.AppForm>
			<form
				onSubmit={(e) => {
					e.preventDefault()
					e.stopPropagation()
					form.handleSubmit()
				}}
			>
				<fieldset disabled={status === 'submitted'} className="space-y-6">
					<form.AppField name="reportingYear">
						{(field) => (
							<field.TextField
								label="Rapporteringsår"
								placeholder="YYYY"
								hidden
							/>
						)}
					</form.AppField>

					<Card>
						<CardContent className="pt-6 space-y-6">
							<h3 className="text-lg font-medium mb-4">Scope 3 Emissions</h3>
							<form.AppField name="totalScope3Emissions">
								{(field) => (
									<field.NumberField
										label="Total Scope 3 Emissions"
										unit="tCO₂e"
										description="Total indirect emissions in value chain"
									/>
								)}
							</form.AppField>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="pt-6">
							<h3 className="text-lg font-medium mb-4">Scope 3 Categories</h3>
							<Tabs defaultValue="upstream" className="w-full">
								<TabsList className="grid w-full grid-cols-2">
									<TabsTrigger value="upstream">
										Upstream (Cat. 1-8)
									</TabsTrigger>
									<TabsTrigger value="downstream">
										Downstream (Cat. 9-15)
									</TabsTrigger>
								</TabsList>

								<TabsContent value="upstream" className="mt-6">
									<AnimatePresence>
										<motion.div
											animate="visible"
											className="grid grid-cols-1 md:grid-cols-2 gap-6"
											exit="hidden"
											initial="hidden"
											variants={listVariants}
										>
											{SCOPE_3_CATEGORIES.filter((cat) => cat.number <= 8).map(
												(cat) => (
													<motion.div
														key={cat.number}
														transition={{ type: 'tween' }}
														variants={itemVariants}
													>
														<form.AppField name={`category${cat.number}`}>
															{(field) => (
																<field.NumberField
																	label={`${cat.name} (cat. ${cat.number})`}
																	unit="tCO₂e"
																	description={`Emissions from ${cat.name.toLowerCase()}`}
																/>
															)}
														</form.AppField>
													</motion.div>
												),
											)}
										</motion.div>
									</AnimatePresence>
								</TabsContent>

								<TabsContent value="downstream" className="mt-6">
									<AnimatePresence>
										<motion.div
											animate="visible"
											className="grid grid-cols-1 md:grid-cols-2 gap-6"
											exit="hidden"
											initial="hidden"
											variants={listVariants}
										>
											{SCOPE_3_CATEGORIES.filter((cat) => cat.number >= 9).map(
												(cat) => (
													<motion.div
														key={cat.number}
														transition={{ type: 'tween' }}
														variants={itemVariants}
													>
														<form.AppField name={`category${cat.number}`}>
															{(field) => (
																<field.NumberField
																	label={`${cat.name} (cat. ${cat.number})`}
																	unit="tCO₂e"
																	description={`Emissions from ${cat.name.toLowerCase()}`}
																/>
															)}
														</form.AppField>
													</motion.div>
												),
											)}
										</motion.div>
									</AnimatePresence>
								</TabsContent>
							</Tabs>
						</CardContent>
					</Card>
				</fieldset>

				<FormButtons
					status={status as 'draft' | 'submitted'}
					isSaving={isSaving}
					onSaveDraft={saveDraft}
					onSubmit={submit}
					onReopen={reopen}
				/>
			</form>
		</form.AppForm>
	)
}
