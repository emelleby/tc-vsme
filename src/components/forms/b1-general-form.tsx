import { useStore } from '@tanstack/react-form'
import { useQuery } from '@tanstack/react-query'
import { useStore as useYearStore } from '@tanstack/react-store'
import { useAction, useQuery as useConvexQuery } from 'convex/react'
import {
	Award,
	Building2,
	History,
	Plus,
	RefreshCw,
	Trash2,
} from 'lucide-react'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { FormButtons } from '@/hooks/tanstack-form'
import { useFormSubmission } from '@/hooks/use-form-submission'
import { useOrgGuard } from '@/hooks/use-org-guard'
import {
	type B1GeneralFormValues,
	b1GeneralSchema,
	EMPLOYEE_COUNTING_METHODOLOGIES,
	TYPE_OF_NUMBER_OF_EMPLOYEES,
} from '@/lib/forms/schemas/b1-general-schema'
import { yearStore } from '@/lib/year-store'
import { api } from '../../../convex/_generated/api'
import type { FieldChange, FormVersion } from '../../../convex/forms/_utils'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '../ui/accordion'
import { FieldGroup } from '../ui/field'

type MongoEmissionsData = {
	Revenue?: number
	[key: string]: unknown
}

/**
 * Maps MongoDB emissions data to form default values.
 * Extracts revenue from MongoDB for form pre-population.
 */
function mapMongoToFormDefaults(data: MongoEmissionsData | null | undefined): {
	revenue?: number
} {
	if (!data || data.Revenue === undefined) return {}
	return { revenue: data.Revenue }
}

export function B1GeneralForm() {
	const reportingYear = useYearStore(yearStore, (state) => state.selectedYear)

	// Guard against race conditions during org switching
	const { organization, skipQuery } = useOrgGuard()
	const orgData = useConvexQuery(
		api.organizations.getByClerkOrgId,
		skipQuery || { clerkOrgId: organization?.id ?? '' },
	)

	// Fetch MongoDB emissions data with TanStack Query for caching
	const getEmissions = useAction(api.emissions.getEmissionsByOrgId)
	const {
		data: mongoDefaults,
		isLoading: isMongoLoading,
		isError,
		refetch: refetchMongoData,
		isFetching: isRefetching,
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

	// Merge base defaults with org data and MongoDB defaults
	const defaultValues = useMemo<B1GeneralFormValues>(() => {
		const baseDefaults: B1GeneralFormValues = {
			reportingYear: reportingYear.toString(),
			organizationName: orgData?.name || '',
			organizationNumber: orgData?.orgNumber || '',
			naceCode: orgData?.naceCode || '',
			revenue: 0,
			balanceSheetTotal: 0,
			employees: 0,
			EmployeeCountingMethodology: 'vsme:AtTheEndOfTheReportingPeriodMember',
			TypeOfNumberOfEmployees: 'vsme:HeadcountMember',
			country: 'NOR',
			reportType: false,
			subsidiaries: [],
			contactPersonName: '',
			contactPersonEmail: '',
			properties: [],
			certifications: [],
		}

		return {
			...baseDefaults,
			...mongoDefaults,
		} as B1GeneralFormValues
	}, [reportingYear, orgData, mongoDefaults])

	const {
		form,
		status,
		isSaving,
		isLoading,
		existingData,
		saveDraft,
		submit,
		reopen,
		rollback,
	} = useFormSubmission<B1GeneralFormValues>({
		table: 'formGeneral',
		reportingYear,
		section: 'companyInfo',
		schema: b1GeneralSchema,
		defaultValues,
	})

	// Ensure org-sourced fields are always populated from live data,
	// overriding any stale empty values that may have been saved in a draft.
	// useEffect(() => {
	// 	if (orgData?.orgNumber) {
	// 		form.setFieldValue('organizationNumber', orgData.orgNumber)
	// 	}
	// 	if (orgData?.name) {
	// 		form.setFieldValue('organizationName', orgData.name)
	// 	}
	// }, [orgData?.orgNumber, orgData?.name, form])

	const reportType2 = useStore(form.store, (state) => state.values.reportType)

	// Combined loading state (only for initial load, not refetch)
	const isFormLoading = isLoading || isMongoLoading

	if (isFormLoading) {
		return (
			<div className="p-8 text-center text-muted-foreground">
				Loading form data...
			</div>
		)
	}
	console.log(orgData)

	return (
		<>
			<form.AppForm>
				<form
					onSubmit={(e) => {
						e.preventDefault()
						e.stopPropagation()
						form.handleSubmit()
					}}
				>
					<fieldset disabled={status === 'submitted'} className="space-y-6">
						{/* Row 1: Reporting Year & Org Number is hidden */}
						<p>ReportType: {reportType2 ? 'True' : 'False'}</p>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<form.AppField name="reportingYear">
								{(field) => (
									<field.TextField
										label="Rapporteringsår"
										placeholder="YYYY"
										disabled
										hidden
									/>
								)}
							</form.AppField>

							<form.AppField name="organizationNumber">
								{(field) => (
									<field.TextField label="Organisasjonsnummer" hidden />
								)}
							</form.AppField>
						</div>

						{/* Row 2: Org Name & NACE */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<form.AppField name="organizationName">
								{(field) => <field.TextField label="Organisasjonsnavn" />}
							</form.AppField>

							<form.AppField name="naceCode">
								{(field) => (
									<field.TextField
										label="NACE-kode"
										description="Europeisk bransjeklassifiseringskode"
									/>
								)}
							</form.AppField>
						</div>

						{/* Row 3: Revenue & Balance */}
						{/* TODO: Add button to fetch data from Brønnøysundregistrene */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-2">
								<form.AppField name="revenue">
									{(field) => (
										<field.NumberField
											label="Omsetning"
											unit="NOK"
											placeholder="0"
										/>
									)}
								</form.AppField>
								{/* Show retry button only on fetch error */}
								{isError && (
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="text-destructive hover:text-destructive hover:bg-destructive/10"
										onClick={() => refetchMongoData()}
										disabled={isRefetching}
									>
										<RefreshCw
											className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`}
										/>
										{isRefetching
											? 'Retrying...'
											: 'Retry fetching revenue data'}
									</Button>
								)}
							</div>

							<form.AppField name="balanceSheetTotal">
								{(field) => <field.NumberField label="Balansesum" unit="NOK" />}
							</form.AppField>
						</div>

						{/* Row 4: Employees & Country */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<form.AppField name="employees">
								{(field) => <field.NumberField label="Totalt antall ansatte" />}
							</form.AppField>

							<form.AppField name="country">
								{(field) => <field.CountryField label="Land" />}
							</form.AppField>
							<form.AppField name="EmployeeCountingMethodology">
								{(field) => (
									<field.SelectField
										label="Employee counting methodology"
										placeholder="At the end of the reporting period"
										options={EMPLOYEE_COUNTING_METHODOLOGIES.map((m) => ({
											label:
												m === 'vsme:AtTheEndOfTheReportingPeriodMember'
													? 'At the end of the reporting period'
													: 'As an average across the reporting period',
											value: m,
										}))}
									/>
								)}
							</form.AppField>
							<form.AppField name="TypeOfNumberOfEmployees">
								{(field) => (
									<field.SelectField
										label="Headcount or FTE"
										placeholder="Headcount"
										options={TYPE_OF_NUMBER_OF_EMPLOYEES.map((t) => ({
											label:
												t === 'vsme:HeadcountMember'
													? 'Headcount'
													: 'Full-time equivalents (FTE)',
											value: t,
										}))}
									/>
								)}
							</form.AppField>
						</div>

						{/* Row 5: Contact Person */}
						<FieldGroup>
							<div className="pt-4 pb-4 border-t border-b border-border">
								<h2 className="text-lg font-medium mb-4">Kontaktperson</h2>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<form.AppField name="contactPersonName">
										{(field) => (
											<field.TextField label="Navn på kontaktperson" />
										)}
									</form.AppField>

									<form.AppField name="contactPersonEmail">
										{(field) => (
											<field.TextField label="E-post til kontaktperson" />
										)}
									</form.AppField>
								</div>
							</div>
						</FieldGroup>

						{/* Row 6: Report Type */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<form.AppField
								name="reportType"
								listeners={{
									onChange: ({ value, fieldApi }) => {
										if (!value) {
											fieldApi.form.setFieldValue('subsidiaries', [])
										}
									},
								}}
							>
								{(field) => (
									<field.SwitchField
										label="Konsolidert rapport"
										description="Velg om rapporten skal være konsolidert eller individuell."
									/>
								)}
							</form.AppField>
							{/* Empty column to match image layout if needed, or just full width */}

							<div></div>
						</div>

						<form.Subscribe selector={(state) => state.values.reportType}>
							{(reportType) => (
								<FieldGroup>
									{reportType && (
										<div className="pt-4">
											<h2 className="text-lg font-medium mb-4">
												Datterselskaper
											</h2>
											<form.AppField name="subsidiaries">
												{(field) => (
													<div className="space-y-4">
														{field.state.value?.map((item, i) => (
															<div
																key={item.id}
																className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-x-6"
															>
																<form.AppField name={`subsidiaries[${i}].name`}>
																	{(f) => (
																		<f.TextField label="Navn på datterselskap" />
																	)}
																</form.AppField>
																<form.AppField
																	name={`subsidiaries[${i}].address`}
																>
																	{(f) => <f.TextField label="Adresse" />}
																</form.AppField>
																<Button
																	type="button"
																	variant="ghost"
																	size="icon"
																	className="text-destructive hover:text-destructive hover:bg-destructive/10 self-end"
																	onClick={() => field.removeValue(i)}
																	disabled={status === 'submitted'}
																>
																	<Trash2 className="h-6 w-6" />
																</Button>
															</div>
														))}
														<Button
															type="button"
															variant="outline"
															className="w-full md:w-auto"
															onClick={() =>
																field.pushValue({
																	id: crypto.randomUUID(),
																	name: '',
																	address: '',
																})
															}
															disabled={status === 'submitted'}
														>
															<Plus className="h-4 w-4 mr-2" />
															Legg til datterselskap
														</Button>
													</div>
												)}
											</form.AppField>
										</div>
									)}
								</FieldGroup>
							)}
						</form.Subscribe>
						{/* Row 7: Certifications & Properties in a grid for lg screens */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-border">
							{/* Certifications Section */}
							<FieldGroup>
								<div className="flex items-center gap-2 mb-1">
									<Award className="h-5 w-5 text-muted-foreground" />
									<h2 className="text-lg font-medium">
										Sertifiseringer og merkeordninger
									</h2>
								</div>
								<p className="text-sm text-muted-foreground mb-4">
									F.eks. ISO 14001, EMAS, EU Ecolabel, Miljøfyrtårn
								</p>

								<form.AppField name="certifications">
									{(field) => (
										<div className="space-y-4">
											{field.state.value?.map((item, i) => (
												<div
													key={item.id}
													className="relative rounded-lg border border-border bg-card p-4 space-y-4"
												>
													<div className="flex items-center justify-between">
														<span className="text-sm font-medium text-muted-foreground">
															Sertifisering {i + 1}
														</span>
														<Button
															type="button"
															variant="ghost"
															size="icon"
															className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
															onClick={() => field.removeValue(i)}
															disabled={status === 'submitted'}
															aria-label={`Fjern sertifisering ${i + 1}`}
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</div>

													<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
														<form.AppField name={`certifications[${i}].name`}>
															{(f) => (
																<f.TextField
																	label="Sertifisering/merkeordning"
																	placeholder="Sertifisering/merkeordning"
																/>
															)}
														</form.AppField>
														<form.AppField name={`certifications[${i}].issuer`}>
															{(f) => (
																<f.TextField
																	label="Utsteder"
																	placeholder="Utsteder"
																/>
															)}
														</form.AppField>
														<form.AppField name={`certifications[${i}].date`}>
															{(f) => (
																<f.DateField
																	label="Dato"
																	placeholder="dd.mm.åååå"
																/>
															)}
														</form.AppField>
														<form.AppField
															name={`certifications[${i}].assessment`}
														>
															{(f) => (
																<f.TextField
																	label="Vurdering/poengsum"
																	placeholder="Vurdering/poengsum"
																/>
															)}
														</form.AppField>
													</div>
												</div>
											))}

											<Button
												type="button"
												variant="outline"
												className="w-full"
												onClick={() =>
													field.pushValue({
														id: crypto.randomUUID(),
														name: '',
														issuer: '',
														date: '',
														assessment: '',
													})
												}
												disabled={status === 'submitted'}
											>
												<Plus className="h-4 w-4 mr-2" />
												Legg til sertifisering
											</Button>
										</div>
									)}
								</form.AppField>
							</FieldGroup>

							{/* Properties Section */}
							<FieldGroup>
								<div className="flex items-center gap-2 mb-1">
									<Building2 className="h-5 w-5 text-muted-foreground" />
									<h2 className="text-lg font-medium">Eiendommer</h2>
								</div>
								<p className="text-sm text-muted-foreground mb-4">
									Legg til adresser og geolokasjon for eiendommer som eies eller
									driftes av virksomheten.
								</p>

								<form.AppField name="properties">
									{(field) => (
										<div className="space-y-4">
											{field.state.value?.map((item, i) => (
												<div
													key={item.id}
													className="relative rounded-lg border border-border bg-card p-4"
												>
													<div className="flex items-center justify-between mb-3">
														<span className="text-sm font-medium text-muted-foreground">
															Eiendom {i + 1}
														</span>
														<Button
															type="button"
															variant="ghost"
															size="icon"
															className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
															onClick={() => field.removeValue(i)}
															disabled={status === 'submitted'}
															aria-label={`Fjern eiendom ${i + 1}`}
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</div>

													<form.AppField name={`properties[${i}]`}>
														{(f) => (
															<f.PropertyLocationField
																label="Adresse"
																description="Søk etter adressen ved hjelp av Google Maps"
																disabled={status === 'submitted'}
															/>
														)}
													</form.AppField>
												</div>
											))}

											<Button
												type="button"
												variant="outline"
												className="w-full"
												onClick={() =>
													field.pushValue({
														id: crypto.randomUUID(),
														formattedAddress: '',
														streetAddress: '',
														city: '',
														postalCode: '',
														country: '',
														countryCode: '',
														placeId: '',
														lat: 0,
														lng: 0,
													})
												}
												disabled={status === 'submitted'}
											>
												<Plus className="h-4 w-4 mr-2" />
												Legg til eiendom
											</Button>
										</div>
									)}
								</form.AppField>
							</FieldGroup>
						</div>
					</fieldset>

					<FormButtons
						status={status as 'not_started' | 'draft' | 'submitted'}
						isSaving={isSaving}
						onSaveDraft={saveDraft}
						onSubmit={submit}
						onReopen={reopen}
					/>
				</form>
			</form.AppForm>

			{/* Version History Panel */}
			{existingData?.versions && existingData.versions.length > 0 && (
				<div className="mt-8 pt-8 border-t border-border">
					<Accordion type="single" collapsible>
						<AccordionItem value="history" className="border-none">
							<AccordionTrigger className="hover:no-underline py-0">
								<h3 className="text-lg font-medium flex items-center gap-2">
									<History className="h-5 w-5" />
									Version History
								</h3>
							</AccordionTrigger>
							<AccordionContent className="pt-4">
								<div className="space-y-4">
									{[...existingData.versions]
										.reverse()
										.map((version: FormVersion) => (
											<div
												key={version.version}
												className="bg-muted/30 p-4 rounded-md text-sm"
											>
												<div className="flex justify-between items-start mb-2">
													<div className="font-medium">
														Version {version.version}
													</div>
													<div className="flex gap-3 items-center ml-auto">
														<div className="text-muted-foreground text-xs font-mono">
															{new Date(version.changedAt).toLocaleString()}
														</div>
														<Button
															variant="secondary"
															size="sm"
															className="h-7 px-3 text-xs font-semibold"
															onClick={() => rollback(version.version)}
															disabled={isSaving || status === 'submitted'}
														>
															Rull tilbake
														</Button>
													</div>
												</div>
												<div className="text-muted-foreground">
													{version.changes.length > 0 ? (
														<ul className="list-disc list-inside">
															{version.changes.map(
																(change: FieldChange, i: number) => (
																	<li key={`${change.field}-${i}`}>
																		{change.field === '_rollback'
																			? `Rolled back to version ${change.newValue}`
																			: `Changed ${change.field}`}
																	</li>
																),
															)}
														</ul>
													) : (
														<span className="italic">No changes recorded</span>
													)}
												</div>
											</div>
										))}
								</div>
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</div>
			)}
		</>
	)
}
