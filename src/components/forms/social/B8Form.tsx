import { type AnyFormApi, useStore } from '@tanstack/react-form'
import { useStore as useYearStore } from '@tanstack/react-store'
import { api } from 'convex/_generated/api'
import { useMutation } from 'convex/react'
import { AlertTriangle, Info, Plus, Save, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { NumberFieldReadOnly } from '@/components/form-fields/NumberFieldReadOnly'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { FormButtons } from '@/hooks/tanstack-form'
import { useFormSubmission } from '@/hooks/use-form-submission'
import {
	type B8WorkforceFormValues,
	b8WorkforceSchema,
} from '@/lib/forms/schemas/b8-workforce-schema'
import { yearStore } from '@/lib/year-store'

interface EmployeeCountAlertProps {
	form: AnyFormApi
	totalEmployees: number
}

function EmployeeCountAlert({ form, totalEmployees }: EmployeeCountAlertProps) {
	const employeeSum = useStore(form.store, (state) => {
		const h = state.values.heltidsansatte ?? 0
		const m = state.values.midlertidigAnsatte ?? 0
		return h + m
	})
	const matches = employeeSum === totalEmployees

	return (
		<Alert variant={matches ? 'info' : 'warning'} className="mb-6 border-l-4">
			{matches ? <Info /> : <AlertTriangle />}
			<AlertTitle>Employee count</AlertTitle>
			<AlertDescription>
				{matches
					? 'Fulltime employees and temporary employees are linked to information in B1.'
					: `Fulltime + temporary (${employeeSum}) does not match total employees from B1 (${totalEmployees}).`}
			</AlertDescription>
		</Alert>
	)
}

function GenderCountAlert({ form, totalEmployees }: EmployeeCountAlertProps) {
	const genderSum = useStore(form.store, (state) => {
		const menn = state.values.menn ?? 0
		const kvinner = state.values.kvinner ?? 0
		const annet = state.values.annet ?? 0
		return menn + kvinner + annet
	})
	const matches = genderSum === totalEmployees

	return (
		<Alert variant={matches ? 'info' : 'warning'} className="mb-6 border-l-4">
			{matches ? <Info /> : <AlertTriangle />}
			<AlertTitle>Gender count</AlertTitle>
			<AlertDescription>
				{matches
					? 'Gender distribution is linked to information in B1.'
					: `Men + women + other (${genderSum}) does not match total employees from B1 (${totalEmployees}).`}
			</AlertDescription>
		</Alert>
	)
}

interface B8WorkforceFormProps {
	totalEmployees: number
	companyCountry: string
	generalFormData?: Record<string, unknown>
}

export function B8WorkforceForm({
	totalEmployees,
	companyCountry,
	generalFormData,
}: B8WorkforceFormProps) {
	const reportingYear = useYearStore(yearStore, (state) => state.selectedYear)
	const [isUpdatingCompany, setIsUpdatingCompany] = useState(false)

	const updateGeneralForm = useMutation(api.forms.save.saveForm)

	const defaultEmployeesByCountry = useMemo(() => {
		if (companyCountry && totalEmployees > 0) {
			return [
				{
					id: crypto.randomUUID(),
					land: companyCountry,
					antallAnsatte: totalEmployees,
				},
			]
		}
		return []
	}, [companyCountry, totalEmployees])

	const { form, status, isSaving, isLoading, saveDraft, submit, reopen } =
		useFormSubmission<B8WorkforceFormValues>({
			table: 'formSocial',
			reportingYear,
			section: 'workforce',
			schema: b8WorkforceSchema,
			defaultValues: {
				reportingYear: reportingYear.toString(),
				heltidsansatte: totalEmployees,
				deltidsansatte: 0,
				midlertidigAnsatte: 0,
				menn: 0,
				kvinner: 0,
				annet: 0,
				ansattePerLand: defaultEmployeesByCountry,
				eventuellUtfyllendeInfo: '',
			} as B8WorkforceFormValues,
			transformBeforeSave: (values) => {
				const left = values.employeesLeft ?? 0
				const start = values.employeesAtStart ?? 0
				const end = values.employeesAtEnd ?? 0
				const employeeTurnoverRate =
					start > 0 && end > 0
						? Number((left / ((start + end) / 2)).toFixed(4))
						: undefined
				return { ...values, employeeTurnoverRate }
			},
		})

	const employeeSum = useStore(form.store, (state) => {
		const h = state.values.heltidsansatte ?? 0
		const m = state.values.midlertidigAnsatte ?? 0
		return h + m
	})
	const genderSum = useStore(form.store, (state) => {
		const menn = state.values.menn ?? 0
		const kvinner = state.values.kvinner ?? 0
		const annet = state.values.annet ?? 0
		return menn + kvinner + annet
	})

	const employeesLeft = useStore(
		form.store,
		(state) => state.values.employeesLeft,
	)
	const employeesAtStart = useStore(
		form.store,
		(state) => state.values.employeesAtStart,
	)
	const employeesAtEnd = useStore(
		form.store,
		(state) => state.values.employeesAtEnd,
	)

	const employeeMatches = employeeSum === totalEmployees
	const genderMatches = genderSum === totalEmployees
	const requiresTurnover = totalEmployees >= 50
	const turnoverComplete =
		employeesLeft != null &&
		employeesAtStart != null &&
		employeesAtEnd != null &&
		employeesLeft >= 0 &&
		employeesAtStart > 0 &&
		employeesAtEnd > 0
	const canSubmit =
		employeeMatches && genderMatches && (!requiresTurnover || turnoverComplete)

	const submitDisabledReasons: string[] = []
	if (!employeeMatches) {
		submitDisabledReasons.push(
			`Employee types (${employeeSum}) must match total from B1 (${totalEmployees})`,
		)
	}
	if (!genderMatches) {
		submitDisabledReasons.push(
			`Gender distribution (${genderSum}) must match total from B1 (${totalEmployees})`,
		)
	}
	if (requiresTurnover && !turnoverComplete) {
		submitDisabledReasons.push(
			'Turnover rate is required for companies with 50+ employees. Fill in Employees Left, Employees at Start, and Employees at End.',
		)
	}

	const turnoverRateAbsolute =
		employeesAtStart != null &&
		employeesAtEnd != null &&
		employeesAtStart > 0 &&
		employeesAtEnd > 0 &&
		employeesLeft != null
			? Number(
					(employeesLeft / ((employeesAtStart + employeesAtEnd) / 2)).toFixed(
						4,
					),
				)
			: undefined

	const turnoverRatePercent =
		turnoverRateAbsolute != null
			? Number((turnoverRateAbsolute * 100).toFixed(2))
			: undefined

	const handleUpdateCompanyEmployees = async (newEmployeeCount: number) => {
		if (!generalFormData) return
		try {
			setIsUpdatingCompany(true)
			await updateGeneralForm({
				table: 'formGeneral',
				reportingYear,
				section: 'companyInfo',
				data: {
					...generalFormData,
					employees: newEmployeeCount,
				},
			})
			toast.success(
				`Oppdatert antall ansatte i selskapet til ${newEmployeeCount}`,
			)
		} catch (error) {
			toast.error('Kunne ikke oppdatere antall ansatte i B1')
			console.error(error)
		} finally {
			setIsUpdatingCompany(false)
		}
	}

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

					{/* Card 1 — Country distribution */}
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Ansatte per land</CardTitle>
							<p className="text-sm text-muted-foreground">
								Totalt {totalEmployees} ansatte fra B1 — fordel per land
							</p>
						</CardHeader>
						<CardContent>
							<form.AppField name="ansattePerLand">
								{(field) => {
									const rows = field.state.value ?? []
									const totalAllocated = rows.reduce(
										(sum, r) => sum + (r.antallAnsatte ?? 0),
										0,
									)
									const remaining = totalEmployees - totalAllocated

									return (
										<div className="space-y-3">
											<div className="rounded-md border border-border">
												<Table>
													<TableHeader>
														<TableRow>
															<TableHead className="w-[50%]">Land</TableHead>
															<TableHead className="w-[35%]">
																Antall ansatte
															</TableHead>
															<TableHead className="w-[15%] text-right">
																&nbsp;
															</TableHead>
														</TableRow>
													</TableHeader>
													<TableBody>
														{rows.length === 0 && (
															<TableRow>
																<TableCell
																	colSpan={3}
																	className="h-16 text-center text-muted-foreground"
																>
																	Ingen land lagt til. Klikk "Legg til land" for
																	å begynne.
																</TableCell>
															</TableRow>
														)}
														{rows.map((item, i) => (
															<TableRow key={item.id}>
																<TableCell>
																	<form.AppField
																		name={`ansattePerLand[${i}].land`}
																	>
																		{(f) => (
																			<f.CountryField
																				label=""
																				placeholder="Velg land"
																			/>
																		)}
																	</form.AppField>
																</TableCell>
																<TableCell>
																	<form.AppField
																		name={`ansattePerLand[${i}].antallAnsatte`}
																	>
																		{(f) => (
																			<f.NumberField label="" placeholder="0" />
																		)}
																	</form.AppField>
																</TableCell>
																<TableCell className="text-center">
																	<Button
																		type="button"
																		variant="ghost"
																		size="icon"
																		className="h-8 w-8 text-destructive hover:bg-destructive/10"
																		onClick={() => field.removeValue(i)}
																		disabled={status === 'submitted'}
																	>
																		<Trash2 className="h-4 w-4" />
																	</Button>
																</TableCell>
															</TableRow>
														))}
													</TableBody>
												</Table>
											</div>

											{/* Summary row */}
											{rows.length > 0 && (
												<div className="flex items-center justify-between text-sm px-1">
													<span className="text-muted-foreground">
														Fordelt:{' '}
														<span className="font-medium text-foreground">
															{totalAllocated}
														</span>{' '}
														av{' '}
														<span className="font-medium text-foreground">
															{totalEmployees}
														</span>{' '}
														ansatte
													</span>
													{remaining !== 0 && (
														<span
															className={
																remaining < 0
																	? 'text-destructive font-medium'
																	: 'text-amber-600 font-medium'
															}
														>
															{remaining > 0
																? `${remaining} ansatte ikke fordelt`
																: `${Math.abs(remaining)} ansatte for mye fordelt`}
														</span>
													)}
													{remaining === 0 && (
														<span className="text-emerald-600 font-medium">
															Alle ansatte fordelt
														</span>
													)}
												</div>
											)}
											<div className="flex items-center justify-between text-sm px-1">
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() =>
														field.pushValue({
															id: crypto.randomUUID(),
															land: '',
															antallAnsatte: 0,
														})
													}
													disabled={status === 'submitted'}
												>
													<Plus className="h-4 w-4 mr-1" />
													Legg til land
												</Button>
												{totalAllocated !== totalEmployees &&
													generalFormData &&
													status !== 'submitted' && (
														<Button
															type="button"
															variant="secondary"
															size="sm"
															disabled={isUpdatingCompany}
															onClick={() =>
																handleUpdateCompanyEmployees(totalAllocated)
															}
														>
															<Save className="h-4 w-4 mr-1" />
															Oppdater B1
														</Button>
													)}
											</div>
										</div>
									)
								}}
							</form.AppField>
						</CardContent>
					</Card>

					{/* Card 2 — Employees */}
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Ansatte</CardTitle>
							<p className="text-sm text-muted-foreground">
								Fordeling av ansatte etter ansettelsestype
							</p>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<form.AppField name="heltidsansatte">
									{(field) => (
										<field.NumberField
											label="Heltidsansatte"
											description="Antall ansatte som jobber standard heltid"
										/>
									)}
								</form.AppField>

								<form.AppField name="deltidsansatte">
									{(field) => (
										<field.NumberField
											label="Deltidsansatte"
											description="Antall ansatte som jobber mindre enn heltid"
										/>
									)}
								</form.AppField>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<form.AppField name="midlertidigAnsatte">
									{(field) => (
										<field.NumberField
											label="Midlertidig ansatte"
											description="Antall ansatte med tidsbegrensede kontrakter"
										/>
									)}
								</form.AppField>
								<EmployeeCountAlert
									form={form}
									totalEmployees={totalEmployees}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Card 3 — Gender */}
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Kjønnsfordeling</CardTitle>
							<p className="text-sm text-muted-foreground">
								Fordeling av ansatte etter kjønn
							</p>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								<form.AppField name="menn">
									{(field) => <field.NumberField label="Menn" />}
								</form.AppField>

								<form.AppField name="kvinner">
									{(field) => <field.NumberField label="Kvinner" />}
								</form.AppField>

								<form.AppField name="annet">
									{(field) => <field.NumberField label="Annet" />}
								</form.AppField>
							</div>

							<GenderCountAlert form={form} totalEmployees={totalEmployees} />
						</CardContent>
					</Card>
					{/* Card 4 — Turnover Rate */}
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Turnover Rate</CardTitle>
							<p className="text-sm text-muted-foreground">
								Employee turnover during the reporting period
							</p>
						</CardHeader>
						<CardContent>
							{totalEmployees < 50 && (
								<Alert variant="info" className="mb-6 border-l-4">
									<Info />
									<AlertTitle>About Turnover Rate</AlertTitle>
									<AlertDescription>
										Reporting turnover rate is only mandatory for undertakings
										with 50 or more employees.
									</AlertDescription>
								</Alert>
							)}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<form.AppField name="employeesLeft">
									{(field) => (
										<field.NumberField
											label="Employees Left"
											description="Number of employees who left during the reporting period"
										/>
									)}
								</form.AppField>

								<form.AppField name="employeesAtStart">
									{(field) => (
										<field.NumberField
											label="Employees at Start"
											description="Number of employees at the beginning of the reporting period"
										/>
									)}
								</form.AppField>

								<form.AppField name="employeesAtEnd">
									{(field) => (
										<field.NumberField
											label="Employees at End"
											description="Number of employees at the end of the reporting period"
										/>
									)}
								</form.AppField>

								<NumberFieldReadOnly
									label="Employee Turnover Rate"
									unit="%"
									value={turnoverRatePercent ?? ''}
									description="Employee turnover rate in the reporting period (calculated automatically)"
									placeholder="—"
								/>
							</div>
						</CardContent>
					</Card>

					{/* Eventuell utfyllende info */}
					<form.AppField name="eventuellUtfyllendeInfo">
						{(field) => (
							<field.TextareaField
								label="Eventuell utfyllende info"
								placeholder="Beskriv eventuelle ekstraordinære forhold, endringer i organisering, eller annen relevant kontekst..."
								description="Oppgi eventuell tilleggsinformasjon eller forklaringer til arbeidsstyrkedata"
							/>
						)}
					</form.AppField>
				</fieldset>

				<FormButtons
					status={status as 'draft' | 'submitted'}
					isSaving={isSaving}
					onSaveDraft={saveDraft}
					onSubmit={submit}
					onReopen={reopen}
					disableSubmit={!canSubmit && status !== 'submitted'}
					submitDisabledReasons={submitDisabledReasons}
				/>
			</form>
		</form.AppForm>
	)
}
