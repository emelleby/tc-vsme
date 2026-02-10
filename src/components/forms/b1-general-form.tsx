import { revalidateLogic, useStore } from '@tanstack/react-form'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useAppForm } from '@/hooks/form'
import { focusFirstError } from '@/hooks/use-form'
import {
	type B1GeneralFormValues,
	b1GeneralSchema,
} from '@/lib/forms/schemas/b1-general-schema'

export function ReportForm() {
	const form = useAppForm({
		defaultValues: {
			reportingYear: '2028',
			organizationName: 'Lodestar',
			organizationNumber: '891755562',
			naceCode: '77.123',
			revenue: 100000,
			balanceSheetTotal: undefined, // Optional
			employees: 0,
			country: 'NOR', // Defaulting to Norway (Alpha3) as per image "Norge"
			reportType: false,
			subsidiaries: [],
			contactPersonName: 'Eivind',
			contactPersonEmail: 'e@scope321', // Intentionally invalid as per image? Or just placeholder.
		} as B1GeneralFormValues,
		validationLogic: revalidateLogic(),
		validators: {
			onDynamic: b1GeneralSchema,
		},
		canSubmitWhenInvalid: false,
		onSubmitInvalid: ({ formApi }) => {
			focusFirstError(formApi)
		},
		onSubmit: ({ value }) => {
			console.log('Form submitted:', value)
			alert(JSON.stringify(value, null, 2))
			toast.success('Form submitted successfully')
		},
	})

	const isDefault = useStore(form.store, (state) => state.isDefaultValue)
	return (
		<div className="w-full bg-white p-4 border border-gray-200 rounded-lg">
			<div className="mb-8">
				<div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm mb-4">
					B12
				</div>
				<h1 className="text-2xl font-semibold text-gray-900 inline-block ml-3 align-middle">
					Grunnleggende informasjon
				</h1>
			</div>
			<form.AppForm>
				<form
					onSubmit={(e) => {
						e.preventDefault()
						e.stopPropagation()
						form.handleSubmit()
					}}
					className="space-y-8"
				>
					{/* Row 1: Reporting Year & Org Name */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<form.AppField name="reportingYear">
							{(field) => (
								<field.TextField label="Rapporteringsår" placeholder="YYYY" />
							)}
						</form.AppField>

						<form.AppField name="organizationName">
							{(field) => <field.TextField label="Organisasjonsnavn" />}
						</form.AppField>
					</div>

					{/* Row 2: Org Number & NACE */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<form.AppField name="organizationNumber">
							{(field) => <field.TextField label="Organisasjonsnummer" />}
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
								<field.TextField type="number" label="Totalt antall ansatte" />
							)}
						</form.AppField>

						<form.AppField name="country">
							{(field) => <field.CountryField label="Land" />}
						</form.AppField>
					</div>

					{/* Row 5: Contact Person */}
					<div className="pt-4 border-t border-border">
						<h2 className="text-lg font-medium mb-4">Kontaktperson</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<form.AppField name="contactPersonName">
								{(field) => <field.TextField label="Navn på kontaktperson" />}
							</form.AppField>

							<form.AppField name="contactPersonEmail">
								{(field) => (
									<field.TextField label="E-post til kontaktperson" />
								)}
							</form.AppField>
						</div>
					</div>

					{/* Row 6: Report Type */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<form.AppField name="reportType">
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
						{(reportType) =>
							reportType ? (
								<div className="pt-4 border-t border-border">
									<h2 className="text-lg font-medium mb-4">Datterselskaper</h2>
									<form.AppField name="subsidiaries">
										{(field) => (
											<div className="space-y-6">
												{field.state.value?.map((item, i) => (
													<div
														key={item.id}
														className="grid grid-cols-1 md:grid-cols-[1fr,1fr,auto] gap-6 items-end"
													>
														<form.AppField name={`subsidiaries[${i}].name`}>
															{(f) => (
																<f.TextField label="Navn på datterselskap" />
															)}
														</form.AppField>
														<form.AppField name={`subsidiaries[${i}].address`}>
															{(f) => <f.TextField label="Adresse" />}
														</form.AppField>
														<Button
															type="button"
															variant="ghost"
															size="icon"
															className="text-destructive hover:text-destructive hover:bg-destructive/10 mb-1"
															onClick={() => field.removeValue(i)}
														>
															<Trash2 className="h-4 w-4" />
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
												>
													<Plus className="h-4 w-4 mr-2" />
													Legg til datterselskap
												</Button>
											</div>
										)}
									</form.AppField>
								</div>
							) : null
						}
					</form.Subscribe>

					<div className="flex justify-end pt-6">
						<form.SubmitButton label="Neste" />
					</div>
				</form>
			</form.AppForm>
		</div>
	)
}
