import { revalidateLogic, useStore } from '@tanstack/react-form'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import type * as z from 'zod'
import { Checkbox } from '@/components/ui/checkbox'
import {
	FieldDescription,
	FieldLegend,
	FieldSeparator,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
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
		onSubmit: ({ value }) => {
			toast.success('success')
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
		<div className="container mx-auto rounded-lg border mt-4">
			<orderForm.AppForm>
				<orderForm.Form>
					<h1 className="text-3xl font-bold">Place Your Order</h1>
					<FieldDescription>
						Fill out the details below to complete your order
					</FieldDescription>
					<orderForm.AppField name={'product'}>
						{(field) => {
							const options = [
								{ label: 'Basic Plan - $29/month', value: 'basic' },
								{ label: 'Pro Plan - $59/month', value: 'pro' },
								{ label: 'Enterprise Plan - $99/month', value: 'enterprise' },
							]
							return (
								<field.FieldSet className="w-full">
									<field.Field>
										<field.FieldLabel
											className="flex justify-between items-center"
											htmlFor={'product'}
										>
											Select Product *
										</field.FieldLabel>
									</field.Field>
									<Select
										name={'product'}
										value={(field.state.value as string | undefined) ?? ''}
										onValueChange={field.handleChange}
										defaultValue={String(field?.state.value ?? '')}
										disabled={false}
										aria-invalid={
											!!field.state.meta.errors.length &&
											field.state.meta.isTouched
										}
									>
										<field.Field>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Select Product" />
											</SelectTrigger>
										</field.Field>
										<SelectContent>
											{options.map(({ label, value }) => (
												<SelectItem key={value} value={value}>
													{label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>

									<field.FieldError />
								</field.FieldSet>
							)
						}}
					</orderForm.AppField>
					<div className="flex items-start justify-between flex-wrap sm:flex-nowrap w-full gap-2">
						<orderForm.AppField name={'firstName'}>
							{(field) => (
								<field.FieldSet className="w-full">
									<field.Field>
										<field.FieldLabel htmlFor={'firstName'}>
											First Name *
										</field.FieldLabel>
										<Input
											name={'firstName'}
											placeholder="Enter your first name"
											type="text"
											value={(field.state.value as string | undefined) ?? ''}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={
												!!field.state.meta.errors.length &&
												field.state.meta.isTouched
											}
										/>
									</field.Field>

									<field.FieldError />
								</field.FieldSet>
							)}
						</orderForm.AppField>
						<orderForm.AppField name={'lastName'}>
							{(field) => (
								<field.FieldSet className="w-full">
									<field.Field>
										<field.FieldLabel htmlFor={'lastName'}>
											Last Name *
										</field.FieldLabel>
										<Input
											name={'lastName'}
											placeholder="Enter your last name"
											type="text"
											value={(field.state.value as string | undefined) ?? ''}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={
												!!field.state.meta.errors.length &&
												field.state.meta.isTouched
											}
										/>
									</field.Field>

									<field.FieldError />
								</field.FieldSet>
							)}
						</orderForm.AppField>
					</div>
					<orderForm.AppField name={'email'}>
						{(field) => (
							<field.FieldSet className="w-full">
								<field.Field>
									<field.FieldLabel htmlFor={'email'}>
										Email Address *
									</field.FieldLabel>
									<Input
										name={'email'}
										placeholder="Enter your email address"
										type="email"
										value={(field.state.value as string | undefined) ?? ''}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={
											!!field.state.meta.errors.length &&
											field.state.meta.isTouched
										}
									/>
								</field.Field>

								<field.FieldError />
							</field.FieldSet>
						)}
					</orderForm.AppField>
					<orderForm.AppField name={'street_address'}>
						{(field) => (
							<field.FieldSet className="w-full">
								<field.Field>
									<field.FieldLabel htmlFor={'street_address'}>
										Street Address *
									</field.FieldLabel>
									<Input
										name={'street_address'}
										placeholder=""
										type="text"
										value={(field.state.value as string | undefined) ?? ''}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={
											!!field.state.meta.errors.length &&
											field.state.meta.isTouched
										}
									/>
								</field.Field>

								<field.FieldError />
							</field.FieldSet>
						)}
					</orderForm.AppField>
					<div className="flex items-start justify-between flex-wrap sm:flex-nowrap w-full gap-2">
						<orderForm.AppField name={'city'}>
							{(field) => (
								<field.FieldSet className="w-full">
									<field.Field>
										<field.FieldLabel htmlFor={'city'}>City *</field.FieldLabel>
										<Input
											name={'city'}
											placeholder=""
											type="text"
											value={(field.state.value as string | undefined) ?? ''}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={
												!!field.state.meta.errors.length &&
												field.state.meta.isTouched
											}
										/>
									</field.Field>

									<field.FieldError />
								</field.FieldSet>
							)}
						</orderForm.AppField>
						<orderForm.AppField name={'zip'}>
							{(field) => (
								<field.FieldSet className="w-full">
									<field.Field>
										<field.FieldLabel htmlFor={'zip'}>
											Zip code *
										</field.FieldLabel>
										<Input
											name={'zip'}
											placeholder=""
											type="text"
											value={(field.state.value as string | undefined) ?? ''}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={
												!!field.state.meta.errors.length &&
												field.state.meta.isTouched
											}
										/>
									</field.Field>
									<field.FieldDescription>4-numbers</field.FieldDescription>
									<field.FieldError />
								</field.FieldSet>
							)}
						</orderForm.AppField>
					</div>
					<orderForm.AppField name={'paymentMethod'}>
						{(field) => {
							const options = [
								{ label: 'Credit Card', value: 'credit' },
								{ label: 'PayPal', value: 'paypal' },
								{ label: 'Bank Transfer', value: 'bank' },
							]
							return (
								<field.FieldSet className="flex flex-col gap-2 w-full py-1">
									<field.FieldLabel className="mt-0" htmlFor={'paymentMethod'}>
										Payment Method *
									</field.FieldLabel>

									<field.Field>
										<RadioGroup
											onValueChange={field.handleChange}
											name={'paymentMethod'}
											value={(field.state.value as string | undefined) ?? ''}
											disabled={false}
											aria-invalid={
												!!field.state.meta.errors.length &&
												field.state.meta.isTouched
											}
										>
											{options.map(({ label, value }) => (
												<div key={value} className="flex items-center gap-x-2">
													<RadioGroupItem
														value={value}
														id={value}
														required={true}
													/>
													<Label htmlFor={value}>{label}</Label>
												</div>
											))}
										</RadioGroup>
									</field.Field>
									<field.FieldError />
								</field.FieldSet>
							)
						}}
					</orderForm.AppField>
					<FieldSeparator />
					<orderForm.AppField name={'terms'}>
						{(field) => (
							<field.FieldSet>
								<field.Field orientation="horizontal">
									<Checkbox
										id={field.name}
										checked={Boolean(field.state.value)}
										onCheckedChange={(checked) =>
											field.handleChange(checked as boolean)
										}
										onBlur={field.handleBlur}
										disabled={false}
										aria-invalid={
											!!field.state.meta.errors.length &&
											field.state.meta.isTouched
										}
									/>
									<field.FieldContent>
										<field.FieldLabel
											className="space-y-1 leading-none"
											htmlFor={'terms'}
										>
											I agree to the terms and conditions *
										</field.FieldLabel>

										<field.FieldError />
									</field.FieldContent>
								</field.Field>
							</field.FieldSet>
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
