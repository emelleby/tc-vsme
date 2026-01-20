import { revalidateLogic, useStore } from '@tanstack/react-form'
import { toast } from 'sonner'
import type * as z from 'zod'
import { Button } from '@/components/ui/button'
import { FieldDescription, FieldLegend } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useAppForm } from '@/components/ui/tanstack-form'
import { Textarea } from '@/components/ui/textarea'
import { contactFormSchema } from '@/lib/forms/schemas/contactFormSchema'

export function ContactForm() {
	const contactForm = useAppForm({
		defaultValues: {
			name: '',
			surname: '',
			input_1764927287951: '',
			message: '',
		} as z.input<typeof contactFormSchema>,
		validationLogic: revalidateLogic(),
		validators: { onDynamic: contactFormSchema, onDynamicAsyncDebounceMs: 300 },
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

	const isDefault = useStore(contactForm.store, (state) => state.isDefaultValue)

	return (
		<div>
			<contactForm.AppForm>
				<contactForm.Form>
					<h2 className="text-2xl font-bold">
						Klar til å forenkle din EU-standardiserte bærekraftsrapportering med
						VSME Guru?
					</h2>
					<FieldDescription>
						Bli med andre fremtidsrettede SMBer som har forvandlet
						bærekraftsrapportering fra en byrde til en strategisk fordel.
					</FieldDescription>

					<div className="flex items-center justify-between flex-wrap sm:flex-nowrap w-full gap-2">
						<contactForm.AppField name={'name'}>
							{(field) => (
								<field.FieldSet className="w-full">
									<field.Field>
										<field.FieldLabel htmlFor={'name'}>
											Fornavn *
										</field.FieldLabel>
										<Input
											name={'name'}
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
						</contactForm.AppField>
						<contactForm.AppField name={'surname'}>
							{(field) => (
								<field.FieldSet className="w-full">
									<field.Field>
										<field.FieldLabel htmlFor={'surname'}>
											Etternavn *
										</field.FieldLabel>
										<Input
											name={'surname'}
											placeholder=""
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
						</contactForm.AppField>
					</div>
					<contactForm.AppField name={'input_1764927287951'}>
						{(field) => (
							<field.FieldSet className="w-full">
								<field.Field>
									<field.FieldLabel htmlFor={'input_1764927287951'}>
										Jobbepost *
									</field.FieldLabel>
									<Input
										name={'input_1764927287951'}
										placeholder="meg@jobb.no"
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
					</contactForm.AppField>

					<contactForm.AppField name={'message'}>
						{(field) => (
							<field.FieldSet className="w-full">
								<field.Field>
									<field.FieldLabel htmlFor={'message'}>
										Melding{' '}
									</field.FieldLabel>
									<Textarea
										placeholder="Hvis du vil ha tilgang eller har noe på hjertet."
										required={false}
										disabled={false}
										value={(field.state.value as string | undefined) ?? ''}
										name={'message'}
										onChange={(e) => field.handleChange(e.target.value)}
										onBlur={field.handleBlur}
										className="resize-none"
										aria-invalid={
											!!field.state.meta.errors.length &&
											field.state.meta.isTouched
										}
									/>
								</field.Field>
								<field.FieldError />
							</field.FieldSet>
						)}
					</contactForm.AppField>

					<div className="flex justify-end items-center w-full pt-3 gap-3">
						{!isDefault && (
							<Button
								type="button"
								onClick={() => contactForm.reset()}
								className="rounded-lg"
								variant="outline"
								size="sm"
							>
								Reset
							</Button>
						)}
						<contactForm.SubmitButton label="Submit" />
					</div>
				</contactForm.Form>
			</contactForm.AppForm>
		</div>
	)
}
