import { useStore as useYearStore } from '@tanstack/react-store'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormButtons } from '@/hooks/tanstack-form'
import { useFormSubmission } from '@/hooks/use-form-submission'
import {
	PREDEFINED_TITLES,
	type SustainabilityInitiativesFormValues,
	sustainabilityInitiativesSchema,
} from '@/lib/forms/schemas/b2-sustainability-initiatives-schema'
import { yearStore } from '@/lib/year-store'

export function B2SustainabilityInitiativesForm() {
	const reportingYear = useYearStore(yearStore, (state) => state.selectedYear)

	const { form, status, isSaving, isLoading, saveDraft, submit, reopen } =
		useFormSubmission<SustainabilityInitiativesFormValues>({
			table: 'formGeneral',
			reportingYear,
			section: 'sustainabilityInitiatives',
			schema: sustainabilityInitiativesSchema,
			defaultValues: {
				reportingYear: reportingYear.toString(),
				initiatives: [],
			} as SustainabilityInitiativesFormValues,
		})

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-8 text-muted-foreground">
				Loading...
			</div>
		)
	}

	return (
		<div className="w-full bg-card/50 p-4 border border-border rounded-lg shadow-sm">
			<div className="mb-8 flex justify-between items-start">
				<div>
					<div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm mb-4">
						B2
					</div>
					<h1 className="text-2xl font-semibold text-foreground inline-block ml-3 align-middle">
						Sustainability Initiatives
					</h1>
				</div>
				<div className="text-sm text-muted-foreground text-right">
					<div>
						Status: <span className="font-medium capitalize">{status}</span>
					</div>
				</div>
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
						{/* Hidden reporting year field */}
						<form.AppField name="reportingYear">
							{(field) => (
								<field.TextField
									label="Reporting Year"
									placeholder="YYYY"
									hidden
								/>
							)}
						</form.AppField>

						{/* Initiatives array */}
						<form.AppField name="initiatives">
							{(field) => (
								<div className="space-y-4">
									{field.state.value?.length === 0 && (
										<Card className="bg-muted/30">
											<CardContent className="pt-6 text-center">
												<div className="text-4xl mb-2">📋</div>
												<h3 className="font-medium mb-2">
													No initiatives added yet
												</h3>
												<p className="text-sm text-muted-foreground mb-4">
													It&apos;s okay if you don&apos;t have any
													sustainability initiatives to report. You can submit
													this form empty or add initiatives below.
												</p>
											</CardContent>
										</Card>
									)}

									{field.state.value?.map((item, i) => (
										<Card key={item.id} className="relative">
											<CardHeader className="pb-3">
												<div className="flex items-center justify-between">
													<CardTitle className="text-base">
														Initiative {i + 1}
													</CardTitle>
													<Button
														type="button"
														variant="ghost"
														size="icon"
														className="text-destructive hover:text-destructive hover:bg-destructive/10"
														onClick={() => field.removeValue(i)}
														disabled={status === 'submitted'}
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
											</CardHeader>
											<CardContent className="space-y-4">
												<form.AppField name={`initiatives[${i}].title`}>
													{(f) => (
														<f.ComboboxField
															label="Initiative Title"
															options={PREDEFINED_TITLES}
															placeholder="Select from list or type a custom title..."
															helperText="💡 Tip: You can type a custom title if none match"
														/>
													)}
												</form.AppField>

												<form.AppField name={`initiatives[${i}].description`}>
													{(f) => (
														<f.TextareaField
															label="Description"
															placeholder="Describe the initiative..."
															rows={3}
														/>
													)}
												</form.AppField>

												<form.AppField name={`initiatives[${i}].goals`}>
													{(f) => (
														<f.TextareaField
															label="Goals"
															placeholder="What are the goals of this initiative?"
															rows={3}
														/>
													)}
												</form.AppField>

												<form.AppField
													name={`initiatives[${i}].responsiblePerson`}
												>
													{(f) => (
														<f.TextField
															label="Responsible Person"
															placeholder="Name of the person responsible"
														/>
													)}
												</form.AppField>

												<form.AppField name={`initiatives[${i}].status`}>
													{(f) => (
														<f.SelectField
															label="Status"
															options={[
																{ label: 'Not Started', value: 'not_started' },
																{ label: 'In Progress', value: 'in_progress' },
																{ label: 'Completed', value: 'completed' },
															]}
														/>
													)}
												</form.AppField>
											</CardContent>
										</Card>
									))}

									<Button
										type="button"
										variant="outline"
										className="w-full"
										onClick={() =>
											field.pushValue({
												id: crypto.randomUUID(),
												title: '',
												description: '',
												goals: '',
												responsiblePerson: '',
												status: 'not_started',
											})
										}
										disabled={status === 'submitted'}
									>
										<Plus className="h-4 w-4 mr-2" />
										Add Initiative
									</Button>
								</div>
							)}
						</form.AppField>
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
		</div>
	)
}

