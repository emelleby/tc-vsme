import { cleanup, render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useFormSubmission } from '../../../hooks/use-form-submission'
import { C2Scope3EmissionsForm } from '../c2-scope3-emissions-form'

// Mock TanStack Store
vi.mock('@tanstack/react-store', () => ({
	useStore: vi.fn(() => 2025),
}))

// Mock TanStack Query
vi.mock('@tanstack/react-query', () => ({
	useQuery: vi.fn(() => ({
		data: {},
		isLoading: false,
		isError: false,
		error: null,
	})),
}))

// Mock Convex
vi.mock('convex/react', () => ({
	useAction: vi.fn(() => vi.fn()),
}))

// Mock useOrgGuard
vi.mock('../../../hooks/use-org-guard', () => ({
	useOrgGuard: vi.fn(() => ({
		organization: { id: 'org_123' },
	})),
}))

// Mock form submission hook
vi.mock('../../../hooks/use-form-submission', () => ({
	useFormSubmission: vi.fn(),
}))

// Mock FormButtons
vi.mock('../../../hooks/tanstack-form', () => ({
	FormButtons: () => <div data-testid="form-buttons" />,
}))

describe('C2Scope3EmissionsForm - Category Sum Validation', () => {
	const mockHandleSubmit = vi.fn()
	let mockFormState: Record<string, number>
	let mockSetFieldValue: ReturnType<typeof vi.fn>
	let mockUseStore: ReturnType<typeof vi.fn>

	afterEach(() => {
		cleanup()
	})

	const createMockForm = (initialValues: Record<string, number> = {}) => {
		mockFormState = {
			totalScope3Emissions: 0,
			category1: 0,
			category2: 0,
			category3: 0,
			category4: 0,
			category5: 0,
			category6: 0,
			category7: 0,
			category8: 0,
			category9: 0,
			category10: 0,
			category11: 0,
			category12: 0,
			category13: 0,
			category14: 0,
			category15: 0,
			...initialValues,
		}

		mockSetFieldValue = vi.fn((name: string, value: number) => {
			mockFormState[name] = value
		})

		mockUseStore = vi.fn((selector: (state: any) => any) => {
			return selector({ values: mockFormState })
		})

		return {
			handleSubmit: mockHandleSubmit,
			useStore: mockUseStore,
			setFieldValue: mockSetFieldValue,
			AppForm: ({ children }: { children: ReactNode }) => (
				<div data-testid="app-form">{children}</div>
			),
			AppField: ({
				name,
				children,
			}: {
				name: string
				children: (field: {
					NumberField: (props: {
						label: string
						unit?: string
						description?: string
					}) => ReactNode
					TextField: (props: {
						label: string
						placeholder?: string
						hidden?: boolean
					}) => ReactNode
				}) => ReactNode
			}) =>
				children({
					NumberField: ({ label, unit, description }) => (
						<div>
							<label htmlFor={`${name}-input`}>{label}</label>
							<input
								aria-label={label}
								id={`${name}-input`}
								type="number"
								value={mockFormState[name] || 0}
								onChange={(e) =>
									mockSetFieldValue(
										name,
										Number.parseFloat(e.target.value) || 0,
									)
								}
							/>
							{unit ? <span>{unit}</span> : null}
							{description ? <p>{description}</p> : null}
						</div>
					),
					TextField: ({ label, placeholder, hidden }) => (
						<div>
							<label htmlFor={`${name}-input`}>{label}</label>
							<input
								aria-label={label}
								id={`${name}-input`}
								placeholder={placeholder}
								hidden={hidden}
								value={mockFormState[name] || ''}
							/>
						</div>
					),
				}),
		}
	}

	type UseFormSubmissionReturn = ReturnType<typeof useFormSubmission>

	beforeEach(() => {
		mockHandleSubmit.mockClear()
		vi.clearAllMocks()
	})

	it('shows warning when category sum < total', async () => {
		// Set total = 1000, categories sum = 800
		const mockForm = createMockForm({
			totalScope3Emissions: 1000,
			category1: 500,
			category2: 300,
			// Sum = 800, difference = 200
		})

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

		render(<C2Scope3EmissionsForm />)

		await waitFor(() => {
			expect(
				screen.getByText(/Categories sum to 800\.00 tCO₂e but total is/i),
			).toBeTruthy()
			expect(screen.getByText(/1000\.00 tCO₂e/i)).toBeTruthy()
			expect(screen.getByText(/Difference: 200\.00 tCO₂e/i)).toBeTruthy()
		})
	})

	it('shows warning when category sum > total', async () => {
		// Set total = 500, categories sum = 800
		const mockForm = createMockForm({
			totalScope3Emissions: 500,
			category1: 500,
			category2: 300,
			// Sum = 800, difference = 300
		})

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

		render(<C2Scope3EmissionsForm />)

		await waitFor(() => {
			expect(
				screen.getByText(/Categories sum to 800\.00 tCO₂e but total is/i),
			).toBeTruthy()
			expect(screen.getByText(/500\.00 tCO₂e/i)).toBeTruthy()
			expect(screen.getByText(/Difference: 300\.00 tCO₂e/i)).toBeTruthy()
		})
	})

	it('hides warning when category sum = total', async () => {
		// Set total = 800, categories sum = 800
		const mockForm = createMockForm({
			totalScope3Emissions: 800,
			category1: 500,
			category2: 300,
			// Sum = 800, no difference
		})

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

		render(<C2Scope3EmissionsForm />)

		await waitFor(() => {
			const warning = screen.queryByText(/Categories sum to/i)
			expect(warning).toBeNull()
		})
	})

	it('handles floating point precision (within 0.01 tolerance)', async () => {
		// Set total = 100.00, categories sum = 100.005 (within tolerance)
		const mockForm = createMockForm({
			totalScope3Emissions: 100.0,
			category1: 50.0025,
			category2: 50.0025,
			// Sum = 100.005, difference = 0.005 (within 0.01 tolerance)
		})

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

		render(<C2Scope3EmissionsForm />)

		await waitFor(() => {
			const warning = screen.queryByText(/Categories sum to/i)
			expect(warning).toBeNull()
		})
	})

	it('treats empty fields as zero', async () => {
		// Set total = 100, leave categories empty (default to 0)
		const mockForm = createMockForm({
			totalScope3Emissions: 100,
			// All categories default to 0
		})

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

		render(<C2Scope3EmissionsForm />)

		await waitFor(() => {
			expect(
				screen.getByText(/Categories sum to 0\.00 tCO₂e but total is/i),
			).toBeTruthy()
			expect(screen.getByText(/100\.00 tCO₂e/i)).toBeTruthy()
			expect(screen.getByText(/Difference: 100\.00 tCO₂e/i)).toBeTruthy()
		})
	})
})
