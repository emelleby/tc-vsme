import { useStore } from '@tanstack/react-form'
import { useStore as useYearStore } from '@tanstack/react-store'
import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { FormButtons } from '@/hooks/tanstack-form'
import { useFormSubmission } from '@/hooks/use-form-submission'
import {
	type B6WaterFormValues,
	b6WaterSchema,
} from '@/lib/forms/schemas/b6-water-schema'
import { yearStore } from '@/lib/year-store'

export function B6WaterManagementForm() {
	const reportingYear = useYearStore(yearStore, (state) => state.selectedYear)

	const { form, status, isSaving, isLoading, saveDraft, submit, reopen } =
		useFormSubmission<B6WaterFormValues>({
			table: 'formEnvironmental',
			reportingYear,
			section: 'waterManagement',
			schema: b6WaterSchema,
			defaultValues: {
				reportingYear: reportingYear.toString(),
				waterWithdrawal: 0,
				waterWithdrawalStress: 0,
				waterDischarge: 0,
				waterConsumption: 0,
			} as B6WaterFormValues,
		})

	const withdrawal = useStore(
		form.store,
		(state) => (state.values as B6WaterFormValues).waterWithdrawal,
	)
	const discharge = useStore(
		form.store,
		(state) => (state.values as B6WaterFormValues).waterDischarge,
	)

	// Sync calculated consumption
	React.useEffect(() => {
		const expected = (withdrawal ?? 0) - (discharge ?? 0)
		form.setFieldValue('waterConsumption', expected)
	}, [withdrawal, discharge, form])

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
						<CardContent className="">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
								<form.AppField name="waterWithdrawal">
									{(field) => (
										<field.NumberField
											label="Vannuttak"
											unit="m³"
											description="Totalt vannuttak i kubikkmeter (alt vann hentet inn fra alle kilder)"
										/>
									)}
								</form.AppField>

								<form.AppField name="waterWithdrawalStress">
									{(field) => (
										<field.NumberField
											label="Vannuttak i vannstressområder"
											unit="m³"
											description="Vannuttak fra lokasjoner i områder med høy vannstress (m³)"
										/>
									)}
								</form.AppField>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<form.AppField name="waterDischarge">
									{(field) => (
										<field.NumberField
											label="Vannutslipp"
											unit="m³"
											description="Totalt vann returnert til miljøet (m³)"
										/>
									)}
								</form.AppField>

								<div className="space-y-3">
									<div className="text-sm font-bold">Vannforbruk</div>
									<div className="h-9 px-3 py-2 rounded-md border border-input bg-secondary/10 flex items-center justify-between">
										<span className="text-sm font-semibold">
											{(withdrawal ?? 0) - (discharge ?? 0)}
										</span>
										<span className="text-muted-foreground text-sm">m³</span>
									</div>
									<p className="text-sm text-muted-foreground">
										Beregnet: vannuttak minus vannutslipp
									</p>
									{/* Hidden field to satisfy validation and form submission */}
									<form.AppField name="waterConsumption">
										{(field) => (
											<input
												type="hidden"
												name={field.name}
												value={field.state.value}
											/>
										)}
									</form.AppField>
								</div>
							</div>
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
