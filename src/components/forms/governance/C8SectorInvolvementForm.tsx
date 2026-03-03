import { useStore as useYearStore } from '@tanstack/react-store'
import { FormButtons } from '@/hooks/tanstack-form'
import { useFormSubmission } from '@/hooks/use-form-submission'
import {
	type C8SectorInvolvementValues,
	c8SectorInvolvementSchema,
} from '@/lib/forms/schemas/c8-sector-involvement-schema'
import { yearStore } from '@/lib/year-store'

export function C8SectorInvolvementForm() {
	const reportingYear = useYearStore(yearStore, (state) => state.selectedYear)

	const { form, status, isSaving, isLoading, saveDraft, submit, reopen } =
		useFormSubmission<C8SectorInvolvementValues>({
			table: 'formGovernance',
			reportingYear,
			section: 'sectorInvolvement',
			schema: c8SectorInvolvementSchema,
			defaultValues: {
				reportingYear: reportingYear.toString(),
				controversialWeapons: false,
				controversialWeaponsRevenue: undefined,
				fossilFuels: false,
				fossilFuelRevenue: undefined,
				fossilFuelsBreakdown: '',
				agriculturalChemicals: false,
				agriculturalChemicalsRevenue: undefined,
				euBenchmarksExclusion: false,
			} as C8SectorInvolvementValues,
		})

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-8 text-muted-foreground">
				Loading...
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
					{/* Hidden reporting year */}
					<form.AppField name="reportingYear">
						{(field) => (
							<field.TextField
								label="Rapporteringsår"
								placeholder="YYYY"
								hidden
							/>
						)}
					</form.AppField>

					<div className="text-sm font-medium">C8  Inntekter fra spesifikke sektorer</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						{/* Controversial Weapons */}
						<div className="space-y-4">
							<form.AppField 
								name="controversialWeapons"
								listeners={{
									onChange: ({ value, fieldApi }) => {
										if (!value) {
											fieldApi.form.setFieldValue('controversialWeaponsRevenue', undefined)
										}
									},
								}}
							>
								{(field) => <field.CheckboxField label="Controversial Weapons" />}
							</form.AppField>

							<form.Subscribe selector={(state) => state.values.controversialWeapons}>
								{(isChecked) => isChecked && (
									<form.AppField name="controversialWeaponsRevenue">
										{(field) => (
											<field.NumberField 
												label="Controversial Weapons Revenue" 
												unit="NOK" 
												description="Total revenue from controversial weapons-related activities"
											/>
										)}
									</form.AppField>
								)}
							</form.Subscribe>
						</div>

						{/* Fossil Fuels */}
						<div className="space-y-4">
							<form.AppField 
								name="fossilFuels"
								listeners={{
									onChange: ({ value, fieldApi }) => {
										if (!value) {
											fieldApi.form.setFieldValue('fossilFuelRevenue', undefined)
											fieldApi.form.setFieldValue('fossilFuelsBreakdown', '')
										}
									},
								}}
							>
								{(field) => <field.CheckboxField label="Fossil Fuels" />}
							</form.AppField>

							<form.Subscribe selector={(state) => state.values.fossilFuels}>
								{(isChecked) => isChecked && (
									<>
										<form.AppField name="fossilFuelRevenue">
											{(field) => (
												<field.NumberField 
													label="Fossil Fuel Revenue" 
													unit="NOK" 
													description="Total revenue from fossil fuel-related activities"
												/>
											)}
										</form.AppField>
										<form.AppField name="fossilFuelsBreakdown">
											{(field) => (
												<field.TextareaField 
													label="Fossil Fuels Breakdown" 
													description="Detailed breakdown of fossil fuel activities"
													rows={3}
												/>
											)}
										</form.AppField>
									</>
								)}
							</form.Subscribe>
						</div>

						{/* Agricultural Chemicals */}
						<div className="space-y-4">
							<form.AppField 
								name="agriculturalChemicals"
								listeners={{
									onChange: ({ value, fieldApi }) => {
										if (!value) {
											fieldApi.form.setFieldValue('agriculturalChemicalsRevenue', undefined)
										}
									},
								}}
							>
								{(field) => <field.CheckboxField label="Agricultural Chemicals" />}
							</form.AppField>

							<form.Subscribe selector={(state) => state.values.agriculturalChemicals}>
								{(isChecked) => isChecked && (
									<form.AppField name="agriculturalChemicalsRevenue">
										{(field) => (
											<field.NumberField 
												label="Agricultural Chemicals Revenue" 
												unit="NOK" 
												description="Total revenue from agricultural chemicals-related activities"
											/>
										)}
									</form.AppField>
								)}
							</form.Subscribe>
						</div>

						{/* EU Benchmarks Exclusion */}
						<div className="space-y-4 pt-1">
							<form.AppField name="euBenchmarksExclusion">
								{(field) => <field.CheckboxField label="EU Benchmarks Exclusion" />}
							</form.AppField>
						</div>
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
	)
}
