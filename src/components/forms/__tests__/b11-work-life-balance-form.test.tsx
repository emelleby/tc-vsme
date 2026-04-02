import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useFormSubmission } from '../../../hooks/use-form-submission'
import { B11WorkLifeBalanceForm } from '../social/B11Form'

vi.mock('@tanstack/react-store', () => ({
	useStore: vi.fn(() => 2025),
}))

vi.mock('../../../hooks/use-form-submission', () => ({
	useFormSubmission: vi.fn(),
}))

vi.mock('../../../hooks/tanstack-form', () => ({
	FormButtons: () => <div data-testid="form-buttons" />,
}))

describe('B11WorkLifeBalanceForm', () => {
	const mockHandleSubmit = vi.fn()

	const mockForm = {
		handleSubmit: mockHandleSubmit,
		AppForm: ({ children }: { children: ReactNode }) => (
			<div data-testid="app-form">{children}</div>
		),
		AppField: ({
			children,
			name,
		}: {
			children: (field: {
				TextField: (props: {
					label: string
					placeholder?: string
					hidden?: boolean
				}) => ReactNode
				NumberField: (props: {
					label: string
					description?: string
				}) => ReactNode
				TextareaField: (props: {
					label: string
					placeholder?: string
					rows?: number
					description?: string
				}) => ReactNode
			}) => ReactNode
			name: string
		}) =>
			children({
				TextField: ({ label, placeholder, hidden }) => (
					<div hidden={hidden}>
						<label htmlFor={`${label}-input`}>{label}</label>
						<input
							aria-label={label}
							id={`${label}-input`}
							placeholder={placeholder}
						/>
					</div>
				),
				NumberField: ({ label, description }) => (
					<div>
						<label htmlFor={`${label}-input`}>{label}</label>
						<input
							type="number"
							aria-label={label}
							id={`${label}-input`}
						/>
						{description ? <p>{description}</p> : null}
					</div>
				),
				TextareaField: ({ label, placeholder, rows, description }) => (
					<div>
						<label htmlFor={`${label}-textarea`}>{label}</label>
						<textarea
							aria-label={label}
							id={`${label}-textarea`}
							placeholder={placeholder}
							rows={rows}
						/>
						{description ? <p>{description}</p> : null}
					</div>
				),
			}),
	}

	type UseFormSubmissionReturn = ReturnType<typeof useFormSubmission>

	beforeEach(() => {
		mockHandleSubmit.mockClear()
		const baseReturn = {
			form: mockForm,
			status: 'draft',
			isSaving: false,
			isLoading: false,
			existingData: undefined,
			saveDraft: vi.fn(),
			submit: vi.fn(),
			reopen: vi.fn(),
			rollback: vi.fn(async () => {}),
		}

		vi.mocked(useFormSubmission).mockReturnValue(
			baseReturn as unknown as UseFormSubmissionReturn,
		)
	})

	it('renders all form fields', () => {
		render(<B11WorkLifeBalanceForm />)

		expect(screen.getByLabelText('Female Parental Leave')).toBeTruthy()
		expect(screen.getByLabelText('Male Parental Leave')).toBeTruthy()
		expect(
			screen.getByLabelText('Parental Leave Policy Description'),
		).toBeTruthy()
	})

	it('submits via form handleSubmit', () => {
		const { container } = render(<B11WorkLifeBalanceForm />)
		const form = container.querySelector('form')
		if (!form) throw new Error('Form element not found')

		fireEvent.submit(form)

		expect(mockHandleSubmit).toHaveBeenCalled()
	})

	it('disables fields when status is submitted', () => {
		const submittedReturn = {
			form: mockForm,
			status: 'submitted',
			isSaving: false,
			isLoading: false,
			existingData: undefined,
			saveDraft: vi.fn(),
			submit: vi.fn(),
			reopen: vi.fn(),
			rollback: vi.fn(async () => {}),
		}

		vi.mocked(useFormSubmission).mockReturnValue(
			submittedReturn as unknown as UseFormSubmissionReturn,
		)

		const { container } = render(<B11WorkLifeBalanceForm />)
		const fieldset = container.querySelector('fieldset')

		expect(fieldset?.hasAttribute('disabled')).toBe(true)
	})
})
