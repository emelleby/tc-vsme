import { useStore } from '@tanstack/react-form'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { CountryDropdown } from '@/components/form-fields/country-dropdown'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useAppForm } from '@/hooks/form'
import { useFieldContext } from '@/hooks/form-context'

export const Route = createFileRoute('/_appLayout/app/general/form-b1')({
	component: ReportForm,
})

const schema = z.object({
	reportingYear: z.string().regex(/^\d{4}$/, 'Year must be 4 digits'),
	organizationName: z.string().min(1, 'Organization name is required'),
	organizationNumber: z.string().min(1, 'Organization number is required'),
	naceCode: z.string().min(1, 'NACE code is required'),
	revenue: z.coerce.number().min(0),
	balanceSheetTotal: z.coerce.number().min(0).optional(),
	employees: z.coerce.number().min(0),
	country: z
		.string({ required_error: 'Please select a country' })
		.min(1, 'Country is required'),
	reportType: z.enum(['individuell', 'konsolidert'], {
		required_error: 'Please select a report type',
	}),
	contactPersonName: z.string().min(1, 'Contact name is required'),
	contactPersonEmail: z.string().email('Invalid email address'),
})

// Field Adapter for CountryDropdown
function CountryField({ label }: { label: string }) {
	const field = useFieldContext<string>()
	const errors = useStore(field.store, (state) => state.meta.errors)

	return (
		<div className="flex flex-col gap-2">
			<Label htmlFor={label} className="text-sm font-medium">
				{label}
			</Label>
			<CountryDropdown
				placeholder="Select country"
				defaultValue={field.state.value}
				onChange={(country) => {
					field.handleChange(country.alpha3)
				}}
				// The CountryDropdown doesn't strictly support 'onBlur' in its current interface effectively for the field interaction
				// but we can simulate or ignore if not critical, or wrap if needed.
				// Assuming validation triggers on change or submit is fine for now.
			/>
			{field.state.meta.isTouched && errors.length > 0 && (
				<span className="text-destructive text-sm font-medium">
					{errors.join(', ')}
				</span>
			)}
		</div>
	)
}

// Field Adapter for RadioGroup
function RadioField({
	label,
	options,
}: {
	label: string
	options: { label: string; value: string }[]
}) {
	const field = useFieldContext<string>()
	const errors = useStore(field.store, (state) => state.meta.errors)

	return (
		<div className="flex flex-col gap-3">
			<Label className="text-sm font-medium">{label}</Label>
			<RadioGroup
				value={field.state.value}
				onValueChange={field.handleChange}
				className="flex flex-col gap-2"
			>
				{options.map((option) => (
					<div key={option.value} className="flex items-center space-x-2">
						<RadioGroupItem value={option.value} id={option.value} />
						<Label htmlFor={option.value} className="font-normal">
							{option.label}
						</Label>
					</div>
				))}
			</RadioGroup>
			{field.state.meta.isTouched && errors.length > 0 && (
				<span className="text-destructive text-sm font-medium">
					{errors.join(', ')}
				</span>
			)}
		</div>
	)
}

function ReportForm() {
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
			reportType: 'individuell',
			contactPersonName: 'Eivind',
			contactPersonEmail: 'egsdffsdff', // Intentionally invalid as per image? Or just placeholder.
		},
		validators: {
			onSubmit: schema,
		},
		onSubmit: ({ value }) => {
			console.log('Form submitted:', value)
			alert(JSON.stringify(value, null, 2))
		},
	})

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-50/50 p-4">
			<div className="w-full max-w-4xl p-8 bg-white rounded-xl shadow-sm border border-border">
				<div className="mb-8">
					<div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm mb-4">
						B1
					</div>
					<h1 className="text-2xl font-semibold text-gray-900 inline-block ml-3 align-middle">
						Grunnleggende informasjon
					</h1>
				</div>

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
								<div className="space-y-1">
									<field.TextField label="NACE-kode" />
									<p className="text-xs text-muted-foreground">
										Europeisk bransjeklassifiseringskode
									</p>
								</div>
							)}
						</form.AppField>
					</div>

					{/* Row 3: Revenue & Balance */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<form.AppField name="revenue">
							{(field) => <field.TextField label="Omsetning (NOK)" />}
						</form.AppField>

						<form.AppField name="balanceSheetTotal">
							{(field) => <field.TextField label="Balansesum (NOK)" />}
						</form.AppField>
					</div>

					{/* Row 4: Employees & Country */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<form.AppField name="employees">
							{(field) => <field.TextField label="Totalt antall ansatte" />}
						</form.AppField>

						<form.AppField name="country">
							{(field) => <CountryField label="Land" />}
						</form.AppField>
					</div>

					{/* Row 5: Report Type */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<form.AppField name="reportType">
							{(field) => (
								<RadioField
									label="Rapporttype"
									options={[
										{ label: 'Individuell', value: 'individuell' },
										{ label: 'Konsolidert', value: 'konsolidert' },
									]}
								/>
							)}
						</form.AppField>
						{/* Empty column to match image layout if needed, or just full width */}
						<div></div>
					</div>

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

					<div className="flex justify-end pt-6">
						<form.AppForm>
							<form.SubscribeButton label="Submit Report" />
						</form.AppForm>
					</div>
				</form>
			</div>
		</div>
	)
}
