import { useOrganization } from '@clerk/clerk-react'
import { useStore } from '@tanstack/react-form'
import { useStore as useYearStore } from '@tanstack/react-store'
import { useQuery } from 'convex/react'
import { History, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FormButtons } from '@/hooks/tanstack-form'
import { useFormSubmission } from '@/hooks/use-form-submission'
import {
	type B1GeneralFormValues,
	b1GeneralSchema,
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

export function B1GeneralForm() {
	const reportingYear = useYearStore(yearStore, (state) => state.selectedYear)

	const { organization } = useOrganization()
	const orgData = useQuery(
		api.organizations.getByClerkOrgId,
		organization?.id ? { clerkOrgId: organization.id } : 'skip',
	)

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
		schema: b1GeneralSchema,
		defaultValues: {
			reportingYear: reportingYear.toString(),
			organizationName: orgData?.name || '',
			organizationNumber: orgData?.orgNumber || '',
			naceCode: orgData?.naceCode || '',
			revenue: 0,
			balanceSheetTotal: 0,
			employees: 0,
			country: 'NOR',
			reportType: false,
			subsidiaries: [],
			contactPersonName: '',
			contactPersonEmail: '',
		} as B1GeneralFormValues,
	})

	const reportType2 = useStore(form.store, (state) => state.values.reportType)

	if (isLoading) {
		return (
			<div className="p-8 text-center text-muted-foreground">
				Loading form data...
			</div>
		)
	}

	return (
		<div className="w-full bg-card/50 p-4 border border-border rounded-lg shadow-sm">
			<div className="mb-8 flex justify-between items-start">
				<div>
					<div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm mb-4">
						B1
					</div>
					<h1 className="text-2xl font-semibold text-foreground inline-block ml-3 align-middle">
						Grunnleggende informasjon
					</h1>
				</div>
				{existingData && (
					<div className="text-sm text-muted-foreground text-right">
						<div>
							Status: <span className="font-medium capitalize">{status}</span>
						</div>
						<div>
							Version:{' '}
							{existingData.versions.length
								? existingData.versions[existingData.versions.length - 1]
										.version
								: 1}
						</div>
					</div>
				)}
			</div>
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
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<form.AppField name="revenue">
								{(field) => (
									<field.TextField label="Omsetning (NOK)" type="number" />
								)}
							</form.AppField>

							<form.AppField name="balanceSheetTotal">
								{(field) => (
									<field.TextField label="Balansesum (NOK)" type="number" />
								)}
							</form.AppField>
						</div>

						{/* Row 4: Employees & Country */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<form.AppField name="employees">
								{(field) => (
									<field.TextField
										type="number"
										label="Totalt antall ansatte"
									/>
								)}
							</form.AppField>

							<form.AppField name="country">
								{(field) => <field.CountryField label="Land" />}
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
													<div className="flex gap-2 items-center">
														<div className="text-muted-foreground text-xs">
															{new Date(version.changedAt).toLocaleString()}
														</div>
														{status !== 'submitted' && (
															<Button
																variant="outline"
																size="sm"
																className="h-7 text-xs"
																onClick={() => rollback(version.version)}
																disabled={isSaving}
															>
																Rull tilbake
															</Button>
														)}
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
		</div>
	)
}
