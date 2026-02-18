import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useFormSubmission } from '../../../hooks/use-form-submission'
import { C4ClimateRiskForm } from '../c4-climate-risk-form'

vi.mock('@tanstack/react-store', () => ({
	useStore: vi.fn(() => 2025),
}))

vi.mock('../../../hooks/use-form-submission', () => ({
	useFormSubmission: vi.fn(),
}))

vi.mock('../../../hooks/tanstack-form', () => ({
	FormButtons: () => <div data-testid="form-buttons" />,
}))

describe('C4ClimateRiskForm', () => {
	const mockHandleSubmit = vi.fn()

	const mockForm = {
		handleSubmit: mockHandleSubmit,
		AppForm: ({ children }: { children: ReactNode }) => (
			<div data-testid="app-form">{children}</div>
		),
		AppField: ({
			children,
		}: {
			children: (field: {
				TextField: (props: {
					label: string
					placeholder?: string
					hidden?: boolean
				}) => ReactNode
				TextareaField: (props: {
					label: string
					placeholder?: string
					rows?: number
					description?: string
				}) => ReactNode
			}) => ReactNode
		}) =>
			children({
				TextField: ({ label, placeholder, hidden }) => (
					<div>
						<label htmlFor={`${label}-input`}>{label}</label>
						<input
							aria-label={label}
							id={`${label}-input`}
							placeholder={placeholder}
							hidden={hidden}
						/>
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

	it('renders the climate risk description field', () => {
		render(<C4ClimateRiskForm />)

		const textarea = screen.getByLabelText('Description of climate risks')
		expect(textarea).toBeTruthy()
		expect(textarea.getAttribute('rows')).toBe('8')
		expect(
			screen.getByText(
				'Describe how climate change may affect the business (physical and transition risks).',
			),
		).toBeTruthy()
	})

	it('submits via form handleSubmit', () => {
		const { container } = render(<C4ClimateRiskForm />)
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

		const { container } = render(<C4ClimateRiskForm />)
		const fieldset = container.querySelector('fieldset')

		expect(fieldset?.hasAttribute('disabled')).toBe(true)
	})
})
