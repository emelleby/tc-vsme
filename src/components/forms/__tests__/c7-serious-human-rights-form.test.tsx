import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useFormSubmission } from '../../../hooks/use-form-submission'
import { C7SeriousHumanRightsForm } from '../social/C7Form'

vi.mock('@tanstack/react-store', () => ({
	useStore: vi.fn(() => 2025),
}))

vi.mock('../../../hooks/use-form-submission', () => ({
	useFormSubmission: vi.fn(),
}))

vi.mock('../../../hooks/tanstack-form', () => ({
	FormButtons: () => <div data-testid="form-buttons" />,
}))

// Track which boolean values are exposed by Subscribe
const subscribeValues: Record<string, boolean> = {
	childLabor: false,
	forcedLabor: false,
	humanTrafficking: false,
	discrimination: false,
	other: false,
}

describe('C7SeriousHumanRightsForm', () => {
	const mockHandleSubmit = vi.fn()

	const makeMockForm = (overrideSubscribeValues?: Record<string, boolean>) => {
		const resolvedValues = { ...subscribeValues, ...overrideSubscribeValues }

		return {
			handleSubmit: mockHandleSubmit,
			AppForm: ({ children }: { children: ReactNode }) => (
				<div data-testid="app-form">{children}</div>
			),
			Subscribe: ({
				selector,
				children,
			}: {
				selector: (state: { values: Record<string, boolean> }) => boolean
				children: (value: boolean) => ReactNode
			}) => {
				const value = selector({ values: resolvedValues })
				return <>{children(value)}</>
			},
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
					CheckboxField: (props: {
						label: string
						description?: string
					}) => ReactNode
					TextareaField: (props: {
						label: string
						placeholder?: string
						rows?: number
					}) => ReactNode
				}) => ReactNode
				name: string
				listeners?: object
			}) =>
				children({
					TextField: ({ label, hidden }) => (
						<div hidden={hidden}>
							<label htmlFor={`${label}-input`}>{label}</label>
							<input aria-label={label} id={`${label}-input`} />
						</div>
					),
					CheckboxField: ({ label, description }) => (
						<div>
							<label htmlFor={`${name}-checkbox`}>{label}</label>
							<input
								type="checkbox"
								aria-label={label}
								id={`${name}-checkbox`}
							/>
							{description ? <p>{description}</p> : null}
						</div>
					),
					TextareaField: ({ label, placeholder, rows }) => (
						<div>
							<label htmlFor={`${name}-textarea`}>{label}</label>
							<textarea
								aria-label={label}
								id={`${name}-textarea`}
								placeholder={placeholder}
								rows={rows}
							/>
						</div>
					),
				}),
		}
	}

	type UseFormSubmissionReturn = ReturnType<typeof useFormSubmission>

	beforeEach(() => {
		mockHandleSubmit.mockClear()
		vi.mocked(useFormSubmission).mockReturnValue({
			form: makeMockForm(),
			status: 'draft',
			isSaving: false,
			isLoading: false,
			existingData: undefined,
			saveDraft: vi.fn(),
			submit: vi.fn(),
			reopen: vi.fn(),
			rollback: vi.fn(async () => {}),
		} as unknown as UseFormSubmissionReturn)
	})

	it('renders all 5 incident type checkboxes', () => {
		render(<C7SeriousHumanRightsForm />)

		expect(screen.getByLabelText('Child Labor')).toBeTruthy()
		expect(screen.getByLabelText('Forced Labor')).toBeTruthy()
		expect(screen.getByLabelText('Human Trafficking')).toBeTruthy()
		expect(screen.getByLabelText('Discrimination')).toBeTruthy()
		expect(screen.getByLabelText('Other')).toBeTruthy()
	})

	it('does not render measure textareas when all checkboxes are unchecked', () => {
		render(<C7SeriousHumanRightsForm />)

		expect(screen.queryByLabelText(/Measures taken/)).toBeNull()
	})

	it('shows inline textarea for childLabor when its value is true', () => {
		vi.mocked(useFormSubmission).mockReturnValue({
			form: makeMockForm({ childLabor: true }),
			status: 'draft',
			isSaving: false,
			isLoading: false,
			existingData: undefined,
			saveDraft: vi.fn(),
			submit: vi.fn(),
			reopen: vi.fn(),
			rollback: vi.fn(async () => {}),
		} as unknown as UseFormSubmissionReturn)

		render(<C7SeriousHumanRightsForm />)

		expect(screen.getByLabelText('Measures taken – Child Labor')).toBeTruthy()
		expect(screen.queryByLabelText('Measures taken – Forced Labor')).toBeNull()
	})

	it('shows only the expected textareas when specific checkboxes are true', () => {
		vi.mocked(useFormSubmission).mockReturnValue({
			form: makeMockForm({ humanTrafficking: true, discrimination: true }),
			status: 'draft',
			isSaving: false,
			isLoading: false,
			existingData: undefined,
			saveDraft: vi.fn(),
			submit: vi.fn(),
			reopen: vi.fn(),
			rollback: vi.fn(async () => {}),
		} as unknown as UseFormSubmissionReturn)

		render(<C7SeriousHumanRightsForm />)

		expect(
			screen.getByLabelText('Measures taken – Human Trafficking'),
		).toBeTruthy()
		expect(
			screen.getByLabelText('Measures taken – Discrimination'),
		).toBeTruthy()
		// Forced labor and other are false — no textareas for them
		expect(screen.queryByLabelText('Measures taken – Forced Labor')).toBeNull()
		expect(screen.queryByLabelText('Measures taken – Other')).toBeNull()
	})

	it('submits via form handleSubmit', () => {
		const { container } = render(<C7SeriousHumanRightsForm />)
		const form = container.querySelector('form')
		if (!form) throw new Error('Form element not found')

		fireEvent.submit(form)

		expect(mockHandleSubmit).toHaveBeenCalled()
	})

	it('disables fieldset when status is submitted', () => {
		vi.mocked(useFormSubmission).mockReturnValue({
			form: makeMockForm(),
			status: 'submitted',
			isSaving: false,
			isLoading: false,
			existingData: undefined,
			saveDraft: vi.fn(),
			submit: vi.fn(),
			reopen: vi.fn(),
			rollback: vi.fn(async () => {}),
		} as unknown as UseFormSubmissionReturn)

		const { container } = render(<C7SeriousHumanRightsForm />)
		const fieldset = container.querySelector('fieldset')

		expect(fieldset?.hasAttribute('disabled')).toBe(true)
	})

	it('shows loading state when isLoading is true', () => {
		vi.mocked(useFormSubmission).mockReturnValue({
			form: makeMockForm(),
			status: 'draft',
			isSaving: false,
			isLoading: true,
			existingData: undefined,
			saveDraft: vi.fn(),
			submit: vi.fn(),
			reopen: vi.fn(),
			rollback: vi.fn(async () => {}),
		} as unknown as UseFormSubmissionReturn)

		render(<C7SeriousHumanRightsForm />)

		expect(screen.getByText('Loading...')).toBeTruthy()
	})
})
