import { revalidateLogic, useStore } from '@tanstack/react-form'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import type * as z from 'zod'
import { FieldDescription, FieldSeparator } from '@/components/ui/field'
import { useAppForm } from '@/components/ui/tanstack-form'
import { orderFormSchema } from '@/lib/orderFormSchema'

export const Route = createFileRoute('/_appLayout/app/order')({
	component: OrderForm,
})

export function OrderForm() {
	const orderForm = useAppForm({
		defaultValues: {
			product: 'basic',
			firstName: '',
			lastName: '',
			email: '',
			street_address: '',
			city: '',
			zip: '',
			paymentMethod: 'credit',
			terms: false,
		} as z.input<typeof orderFormSchema>,
		validationLogic: revalidateLogic(),
		validators: { onDynamic: orderFormSchema, onDynamicAsyncDebounceMs: 500 },
		onSubmit: async ({ value }) => {
			console.log('Form data:', value)
			toast.success(
				<div className="text-sm">
					<p className="font-semibold mb-2">Order Submitted</p>
					<div className="space-y-1">
						<p>
							<strong>Product:</strong> {value.product}
						</p>
						<p>
							<strong>Name:</strong> {value.firstName} {value.lastName}
						</p>
						<p>
							<strong>Email:</strong> {value.email}
						</p>
						<p>
							<strong>Address: </strong> {value.street_address}, {value.zip},{' '}
							{value.city}
						</p>
						<p>
							<strong>Payment:</strong> {value.paymentMethod}
						</p>
						<p>
							<strong>Terms Agreed:</strong> {value.terms ? 'Yes' : 'No'}
						</p>
					</div>
				</div>,
			)
		},
		onSubmitInvalid({ formApi }) {
			const errorMap = formApi.state.errorMap['onDynamic']!
			const inputs = Array.from(
				document.querySelectorAll('#previewForm input'),
			) as HTMLInputElement[]

			let firstInput: HTMLInputElement | undefined
			for (const input of inputs) {
				if (errorMap[input.name]) {
					firstInput = input
					break
				}
			}
			firstInput?.focus()
		},
	})
	const isDefault = useStore(orderForm.store, (state) => state.isDefaultValue)

	return (
		<div className="container mx-auto rounded-lg border border-border mt-4">
			<orderForm.AppForm>
				<orderForm.Form>
					<h1 className="text-3xl font-bold">Place Your Order</h1>
					<FieldDescription>
						Fill out the details below to complete your order
					</FieldDescription>
					<orderForm.AppField name="product">
						{(field) => (
							<field.SelectField
								label="Select Product"
								required
								className="w-full"
								placeholder="Select Product"
								options={[
									{ label: 'Basic Plan - $29/month', value: 'basic' },
									{ label: 'Pro Plan - $59/month', value: 'pro' },
									{ label: 'Enterprise Plan - $99/month', value: 'enterprise' },
								]}
							/>
						)}
					</orderForm.AppField>
					<div className="flex items-start justify-between flex-wrap sm:flex-nowrap w-full gap-2">
						<orderForm.AppField name="firstName">
							{(field) => (
								<field.TextField
									label="First Name"
									required
									placeholder="Enter your first name"
									className="w-full"
								/>
							)}
						</orderForm.AppField>
						<orderForm.AppField name="lastName">
							{(field) => (
								<field.TextField
									label="Last Name"
									required
									placeholder="Enter your last name"
									className="w-full"
								/>
							)}
						</orderForm.AppField>
					</div>
					<orderForm.AppField name="email">
						{(field) => (
							<field.TextField
								label="Email Address"
								required
								type="email"
								placeholder="Enter your email address"
								className="w-full"
							/>
						)}
					</orderForm.AppField>
					<orderForm.AppField name="street_address">
						{(field) => (
							<field.TextField
								label="Street Address"
								required
								className="w-full"
							/>
						)}
					</orderForm.AppField>
					<div className="flex items-start justify-between flex-wrap sm:flex-nowrap w-full gap-2">
						<orderForm.AppField name="city">
							{(field) => (
								<field.TextField label="City" required className="w-full" />
							)}
						</orderForm.AppField>
						<orderForm.AppField name="zip">
							{(field) => (
								<field.TextField
									label="Zip code"
									required
									description="4-numbers"
									className="w-full"
								/>
							)}
						</orderForm.AppField>
					</div>
					<orderForm.AppField name="paymentMethod">
						{(field) => (
							<field.RadioGroupField
								label="Payment Method"
								required
								className="w-full"
								options={[
									{ label: 'Credit Card', value: 'credit' },
									{ label: 'PayPal', value: 'paypal' },
									{ label: 'Bank Transfer', value: 'bank' },
								]}
							/>
						)}
					</orderForm.AppField>
					<FieldSeparator />
					<orderForm.AppField name="terms">
						{(field) => (
							<field.CheckboxField
								label="I agree to the terms and conditions"
								required
							/>
						)}
					</orderForm.AppField>
					<div className="flex justify-end items-center w-full pt-3 gap-3">
						{!isDefault && (
							<orderForm.SubmitButton
								type="button"
								label="Reset"
								variant="outline"
								onClick={() => orderForm.reset()}
								className="rounded-lg"
								size="sm"
							/>
						)}
						<orderForm.SubmitButton label="Submit" />
					</div>
				</orderForm.Form>
			</orderForm.AppForm>
		</div>
	)
}
