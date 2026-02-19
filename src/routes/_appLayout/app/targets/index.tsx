import { createFileRoute } from '@tanstack/react-router'
import { useConvexAuth, useQuery } from 'convex/react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppForm } from '@/hooks/tanstack-form'
import { api } from '../../../../../convex/_generated/api'

// Schema for the targets form
const targetsFormSchema = z.object({
	baseYearWithData: z.string().optional(),
	baseYear: z.string().optional(),
	baseYearEmissions: z.number().optional(),
	targetYear: z.number().optional(),
	targetReduction: z.number().optional(),
	longTermTargetYear: z.number().optional(),
	longTermTargetReduction: z.number().optional(),
})

type TargetsFormValues = z.infer<typeof targetsFormSchema>

export const Route = createFileRoute('/_appLayout/app/targets/')({
	component: TargetsPage,
})

function TargetsPage() {
	const { authContext } = Route.useRouteContext()
	const { orgId } = authContext
	const { isAuthenticated } = useConvexAuth()

	// Fetch organization data to get company name
	const orgData = useQuery(
		api.organizations.getByClerkOrgId,
		isAuthenticated && orgId ? { clerkOrgId: orgId } : 'skip',
	)

	// Fetch reporting years from formEnvironmental table for Base Year dropdown
	const environmentalYears = useQuery(
		api.forms.get.getEnvironmentalReportingYears,
		isAuthenticated ? {} : 'skip',
	)

	const companyName = orgData?.name || 'Your Company'

	// Convert years to select options
	// Use "none" as a special value to represent empty/undefined (Radix Select doesn't allow empty string values)
	const NONE_VALUE = 'none'
	const yearOptions = [
		{ label: '- Clear field -', value: NONE_VALUE },
		...(environmentalYears ?? []).map((year) => ({
			label: year.toString(),
			value: year.toString(),
		})),
	]

	// Initialize TanStack Form
	const form = useAppForm({
		defaultValues: {
			baseYearWithData: '',
			baseYear: '',
			baseYearEmissions: undefined,
			targetYear: undefined,
			targetReduction: undefined,
			longTermTargetYear: undefined,
			longTermTargetReduction: undefined,
		} as TargetsFormValues,
		validators: {
			onChange: targetsFormSchema,
		},
		onSubmit: ({ value }) => {
			console.log('Form submitted:', value)
			// TODO: Implement form submission
		},
	})

	if (orgId && orgData === undefined) {
		return <div className="p-6">Loading...</div>
	}

	return (
		<div className="p-6 space-y-8 max-w-4xl mx-auto">
			<div>
				<h1 className="text-3xl font-bold mb-2">
					Climate emissions targets for {companyName}
				</h1>
				<p className="text-muted-foreground">
					Page for setting climate targets
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Emissions Targets</CardTitle>
				</CardHeader>
				<CardContent>
					<form.AppForm>
						<form className="space-y-6">
							{/* Base Year with data selector */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<form.AppField
									name="baseYearWithData"
									listeners={{
										onChange: ({ value, fieldApi }) => {
											// Handle "none" selection - clear both fields
											if (value === NONE_VALUE) {
												fieldApi.form.setFieldValue('baseYearWithData', '')
												fieldApi.form.setFieldValue('baseYear', '')
											} else {
												// Update baseYear field when baseYearWithData changes
												fieldApi.form.setFieldValue('baseYear', value ?? '')
											}
										},
									}}
								>
									{(field) => (
										<div className="space-y-2">
											<field.SelectField
												label="Base Year with data"
												placeholder="Select a year"
												options={yearOptions}
											/>
										</div>
									)}
								</form.AppField>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<form.AppField name="baseYear">
									{(field) => (
										<field.TextField
											label="Base year"
											placeholder="e.g., 2020"
											disabled={!!field.state.value}
										/>
									)}
								</form.AppField>

								<form.AppField name="baseYearEmissions">
									{(field) => (
										<field.NumberField
											label="Base year emissions"
											placeholder="e.g., 1000"
										/>
									)}
								</form.AppField>

								<form.AppField name="targetYear">
									{(field) => (
										<field.NumberField
											label="Target year"
											placeholder="e.g., 2030"
										/>
									)}
								</form.AppField>

								<form.AppField name="targetReduction">
									{(field) => (
										<field.NumberField
											label="Target reduction"
											placeholder="e.g., 50"
										/>
									)}
								</form.AppField>

								<form.AppField name="longTermTargetYear">
									{(field) => (
										<field.NumberField
											label="Long term target year"
											placeholder="e.g., 2050"
										/>
									)}
								</form.AppField>

								<form.AppField name="longTermTargetReduction">
									{(field) => (
										<field.NumberField
											label="Long term target reduction"
											placeholder="e.g., 90"
											unit="%"
										/>
									)}
								</form.AppField>
							</div>

							<div className="flex justify-end">
								<Button type="submit">Save targets</Button>
							</div>
						</form>
					</form.AppForm>
				</CardContent>
			</Card>
		</div>
	)
}
