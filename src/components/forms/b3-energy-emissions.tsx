import { useStore as useYearStore } from '@tanstack/react-store'
import { History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FormButtons } from '@/hooks/tanstack-form'
import { useFormSubmission } from '@/hooks/use-form-submission'
import {
	type B3EnergyEmissionsFormValues,
	b3EnergyEmissionsSchema,
} from '@/lib/forms/schemas/b3-energy-emissions-schema'
import { yearStore } from '@/lib/year-store'
import type { FieldChange, FormVersion } from '../../../convex/forms/_utils'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '../ui/accordion'

export function B3EnergyEmissionsForm() {
	const reportingYear = useYearStore(yearStore, (state) => state.selectedYear)

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
	} = useFormSubmission<B3EnergyEmissionsFormValues>({
		table: 'formGeneral',
		reportingYear,
		section: 'energyEmissions',
		schema: b3EnergyEmissionsSchema,
		defaultValues: {
			reportingYear: reportingYear.toString(),
			renewableElectricity: 0,
			nonRenewableElectricity: 0,
			emissionsIntensity: 0,
			scope1Emissions: 0,
			scope2EmissionsLocationBased: 0,
			scope2EmissionsMarketBased: 0,
		} as B3EnergyEmissionsFormValues,
	})

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
						B3
					</div>
					<h1 className="text-2xl font-semibold text-foreground inline-block ml-3 align-middle">
						Energi og klimagassutslipp
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
						<form.AppField name="reportingYear">
							{(field) => (
								<field.TextField
									label="Rapporteringsår"
									placeholder="YYYY"
									hidden
								/>
							)}
						</form.AppField>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<form.AppField name="renewableElectricity">
								{(field) => (
									<field.NumberField
										label="Renewable Electricity"
										unit="kWh"
										description="Total electricity consumption from renewable sources like solar, wind, and hydro"
									/>
								)}
							</form.AppField>

							<form.AppField name="nonRenewableElectricity">
								{(field) => (
									<field.NumberField
										label="Non-Renewable Electricity"
										unit="kWh"
										description="Total electricity consumption from non-renewable sources like coal and gas"
									/>
								)}
							</form.AppField>

							<form.AppField name="emissionsIntensity">
								{(field) => (
									<field.NumberField
										label="Emissions Intensity"
										unit="kgCO₂e/tNOK"
										step="0.01"
										description="Total emissions per unit of revenue (kgCO₂e/tNOK)"
									/>
								)}
							</form.AppField>

							<form.AppField name="scope1Emissions">
								{(field) => (
									<field.NumberField
										label="Scope 1 Emissions"
										unit="tCO₂e"
										step="0.001"
										description="Direct emissions from owned or controlled sources"
									/>
								)}
							</form.AppField>

							<form.AppField name="scope2EmissionsLocationBased">
								{(field) => (
									<field.NumberField
										label="Scope 2 Emissions (Location-based)"
										unit="tCO₂e"
										step="0.001"
										description="Indirect emissions using average grid emission factors"
									/>
								)}
							</form.AppField>

							<form.AppField name="scope2EmissionsMarketBased">
								{(field) => (
									<field.NumberField
										label="Scope 2 Emissions (Market-based)"
										unit="tCO₂e"
										step="0.001"
										description="Indirect emissions using supplier-specific emission factors"
									/>
								)}
							</form.AppField>
						</div>
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
		</div>
	)
}
