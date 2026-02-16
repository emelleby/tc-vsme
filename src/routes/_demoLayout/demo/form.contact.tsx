/* eslint-disable react/no-children-prop */

import { useForm } from '@tanstack/react-form'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import * as React from 'react'
import {
	ImageField,
	SelectField,
	TextareaField,
	TextField,
} from '@/components/form-fields'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { FieldGroup } from '@/components/ui/field'
import { focusFirstError } from '@/hooks/use-form'

import type { Contact } from '@/lib/forms/schemas/contacts'
import { contactSchema } from '@/lib/forms/schemas/contacts'

export const Route = createFileRoute('/_demoLayout/demo/form/contact')({
	component: ContactFormShadcn,
})

function ContactFormShadcn() {
	const addContact = useMutation(api.contacts.addContact)
	const updateContact = useMutation(api.contacts.updateContact)
	const deleteContact = useMutation(api.contacts.deleteContact)
	const generateUploadUrl = useMutation(api.contacts.generateUploadUrl)
	const contacts = useQuery(api.contacts.getContacts)

	const [editingId, setEditingId] = React.useState<string | null>(null)
	const [viewOnly, setViewOnly] = React.useState(false)

	const imageUpload = useImageUpload()

	const form = useForm({
		defaultValues: {
			firstName: '',
			lastName: '',
			email: '',
			address: {
				street: '',
				city: '',
				state: '',
				zipCode: '',
				country: '',
			},
			phone: '',
			picture: undefined,
		} as Contact,
		validators: {
			onSubmit: contactSchema,
			onBlur: contactSchema,
		},
		canSubmitWhenInvalid: true,
		onSubmitInvalid: ({ formApi }) => {
			focusFirstError(formApi)
		},
		onSubmit: async ({ value }) => {
			try {
				let pictureId = value.picture

				// If there's a new file selected
				const file = imageUpload.fileInputRef.current?.files?.[0]
				if (file) {
					// 1. Generate upload URL
					const uploadUrl = await generateUploadUrl()
					// 2. Upload file
					const result = await fetch(uploadUrl, {
						method: 'POST',
						headers: { 'Content-Type': file.type },
						body: file,
					})
					const { storageId } = await result.json()
					pictureId = storageId
				}

				const contactData = {
					...value,
					picture: pictureId as Id<'_storage'> | undefined,
				}

				if (editingId) {
					await updateContact({
						id: editingId as Id<'contacts'>,
						...contactData,
					})
					alert('Contact updated successfully!')
				} else {
					await addContact(contactData)
					alert('Contact saved successfully!')
				}
				resetForm()
			} catch (error) {
				console.error('Failed to save contact:', error)
				alert('Error saving contact. Please try again.')
			}
		},
	})

	const resetForm = () => {
		form.reset()
		setEditingId(null)
		setViewOnly(false)
		imageUpload.handleRemove()
	}

	// Helper to load image preview from storageId
	const getImageUrl = useQuery(
		api.contacts.getUrl,
		editingId && form.getFieldValue('picture')
			? { storageId: form.getFieldValue('picture') as Id<'_storage'> }
			: 'skip',
	)

	React.useEffect(() => {
		if (getImageUrl) {
			imageUpload.setPreviewUrl(getImageUrl)
		}
	}, [getImageUrl, imageUpload.setPreviewUrl])

	const handleEdit = (contact: Contact) => {
		resetForm()
		setEditingId(contact._id)
		setViewOnly(false)
		form.setFieldValue('firstName', contact.firstName)
		form.setFieldValue('lastName', contact.lastName)
		form.setFieldValue('email', contact.email)
		form.setFieldValue('address', contact.address)
		form.setFieldValue('phone', contact.phone)
		form.setFieldValue('picture', contact.picture)
	}

	const handleView = (contact: ContactWithId) => {
		resetForm()
		setEditingId(contact._id)
		setViewOnly(true)
		form.setFieldValue('firstName', contact.firstName)
		form.setFieldValue('lastName', contact.lastName)
		form.setFieldValue('email', contact.email)
		form.setFieldValue('address', contact.address)
		form.setFieldValue('phone', contact.phone)
		form.setFieldValue('picture', contact.picture)
	}

	const handleDelete = async (id: string) => {
		if (confirm('Are you sure you want to delete this contact?')) {
			try {
				await deleteContact({ id: id as Id<'contacts'> })
				if (editingId === id) resetForm()
			} catch (error) {
				console.error('Failed to delete contact:', error)
				alert('Error deleting contact.')
			}
		}
	}

	return (
		<div className="container mx-auto p-8 space-y-8 max-w-7xl">
			<Card className="max-w-2xl mx-auto">
				<CardHeader>
					<CardTitle>
						{viewOnly
							? 'View Contact'
							: editingId
								? 'Edit Contact'
								: 'Add Contact'}
					</CardTitle>
					<CardDescription>
						{viewOnly
							? 'Contact details'
							: editingId
								? 'Update contact information'
								: 'Create a new contact'}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						id="contact-form"
						onSubmit={(e) => {
							e.preventDefault()
							e.stopPropagation()
							form.handleSubmit()
						}}
					>
						<FieldGroup>
							<form.Field name="picture">
								{(field) => (
									<ImageField
										field={field}
										label="Contact Picture"
										disabled={viewOnly}
										imageUpload={imageUpload}
									/>
								)}
							</form.Field>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<form.Field name="firstName">
									{(field) => (
										<TextField
											field={field}
											label="First Name"
											placeholder="John"
											disabled={viewOnly}
											autoComplete="given-name"
										/>
									)}
								</form.Field>

								<form.Field name="lastName">
									{(field) => (
										<TextField
											field={field}
											label="Last Name"
											placeholder="Doe"
											disabled={viewOnly}
											autoComplete="family-name"
										/>
									)}
								</form.Field>
							</div>

							<form.Field name="email">
								{(field) => (
									<TextField
										field={field}
										label="Email"
										type="email"
										placeholder="john.doe@example.com"
										disabled={viewOnly}
										autoComplete="email"
									/>
								)}
							</form.Field>

							<form.Field name="address.street">
								{(field) => (
									<TextField
										field={field}
										label="Street Address"
										placeholder="123 Main St"
										disabled={viewOnly}
										autoComplete="street-address"
									/>
								)}
							</form.Field>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<form.Field name="address.city">
									{(field) => (
										<TextField
											field={field}
											label="City"
											placeholder="New York"
											disabled={viewOnly}
											autoComplete="address-level2"
										/>
									)}
								</form.Field>

								<form.Field name="address.state">
									{(field) => (
										<TextField
											field={field}
											label="State"
											placeholder="NY"
											disabled={viewOnly}
											autoComplete="address-level1"
										/>
									)}
								</form.Field>

								<form.Field name="address.zipCode">
									{(field) => (
										<TextField
											field={field}
											label="Zip Code"
											placeholder="10001"
											disabled={viewOnly}
											autoComplete="postal-code"
										/>
									)}
								</form.Field>
							</div>

							<form.Field name="address.country">
								{(field) => (
									<SelectField
										field={field}
										label="Country"
										placeholder="Select a country"
										disabled={viewOnly}
										options={[
											{ label: 'United States', value: 'US' },
											{ label: 'Canada', value: 'CA' },
											{ label: 'United Kingdom', value: 'UK' },
											{ label: 'Australia', value: 'AU' },
											{ label: 'Germany', value: 'DE' },
											{ label: 'France', value: 'FR' },
											{ label: 'Japan', value: 'JP' },
										]}
									/>
								)}
							</form.Field>

							<form.Field name="phone">
								{(field) => (
									<TextField
										field={field}
										label="Phone"
										type="tel"
										placeholder="123-456-7890"
										disabled={viewOnly}
										autoComplete="tel"
									/>
								)}
							</form.Field>
						</FieldGroup>
					</form>
				</CardContent>
				<CardFooter className="flex justify-between">
					{editingId && (
						<Button type="button" variant="outline" onClick={resetForm}>
							Cancel
						</Button>
					)}
					<div className="flex-1" />
					{!viewOnly && (
						<Button type="submit" form="contact-form">
							{editingId ? 'Update' : 'Submit'}
						</Button>
					)}
				</CardFooter>
			</Card>
		</div>
	)
}
