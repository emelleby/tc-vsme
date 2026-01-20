/**
 * Tests for HeaderButtons Component - Story 6: Header Conditional Rendering
 *
 * This test suite verifies that the HeaderButtons component renders the correct
 * buttons based on the user's authentication state and VSME permissions.
 *
 * Test Scenarios:
 * 1. Signed Out: Sign Up and Sign In buttons
 * 2. Signed In, no VSME: Get Access link and UserButton
 * 3. Has VSME, no org/db: Create Organization link and UserButton
 * 4. Full Access: Dashboard button, OrganizationSwitcher, and UserButton
 */

import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HeaderButtons } from '../HeaderButtons'

// Mock Clerk hooks
vi.mock('@clerk/clerk-react', () => ({
	useUser: vi.fn(),
	useOrganization: vi.fn(),
	SignedIn: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="signed-in">{children}</div>
	),
	SignedOut: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="signed-out">{children}</div>
	),
	SignUpButton: ({ children }: { children: React.ReactNode }) => (
		<button type="button" data-testid="sign-up-button">
			{children}
		</button>
	),
	SignInButton: ({ children }: { children: React.ReactNode }) => (
		<button type="button" data-testid="sign-in-button">
			{children}
		</button>
	),
	UserButton: () => <div data-testid="user-button">UserButton</div>,
	OrganizationSwitcher: () => (
		<div data-testid="org-switcher">OrganizationSwitcher</div>
	),
}))

// Mock TanStack Router
vi.mock('@tanstack/react-router', () => ({
	Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
		<a href={to}>{children}</a>
	),
}))

// Mock lucide-react
vi.mock('lucide-react', () => ({
	ArrowRight: () => <span data-testid="arrow-icon">→</span>,
}))

// Mock Button component
vi.mock('../ui/button', () => ({
	Button: ({
		children,
		asChild,
		...props
	}: {
		children: React.ReactNode
		asChild?: boolean
	}) => (
		<button data-testid="button" {...props}>
			{children}
		</button>
	),
}))

const { useUser, useOrganization } = vi.hoisted(() => ({
	useUser: vi.fn(),
	useOrganization: vi.fn(),
}))

describe('HeaderButtons Component', () => {
	describe('Signed Out Users', () => {
		beforeEach(() => {
			useUser.mockReturnValue({
				isLoaded: true,
				isSignedIn: false,
				user: null,
			})
			useOrganization.mockReturnValue({
				isLoaded: true,
				organization: null,
			})
		})

		it('renders Sign Up and Sign In buttons for signed-out users', () => {
			render(<HeaderButtons />)

			expect(screen.getByTestId('signed-out')).toBeInTheDocument()
			expect(screen.getByTestId('sign-up-button')).toBeInTheDocument()
			expect(screen.getByTestId('sign-in-button')).toBeInTheDocument()
		})

		it('does not render signed-in content for signed-out users', () => {
			render(<HeaderButtons />)

			expect(screen.queryByTestId('user-button')).not.toBeInTheDocument()
		})
	})

	describe('Signed In, No VSME Access', () => {
		beforeEach(() => {
			useUser.mockReturnValue({
				isLoaded: true,
				isSignedIn: true,
				user: {
					id: 'user_123',
					publicMetadata: {}, // No hasVsme flag
				},
			})
			useOrganization.mockReturnValue({
				isLoaded: true,
				organization: null,
			})
		})

		it('renders Get Access link and UserButton', () => {
			render(<HeaderButtons />)

			expect(screen.getByTestId('signed-in')).toBeInTheDocument()
			expect(screen.getByText('Get access')).toBeInTheDocument()
			expect(screen.getByTestId('user-button')).toBeInTheDocument()
		})

		it('does not render Create Organization or Dashboard buttons', () => {
			render(<HeaderButtons />)

			expect(screen.queryByText('Create Organization')).not.toBeInTheDocument()
			expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
		})
	})

	describe('Has VSME, No Org/DB', () => {
		beforeEach(() => {
			useUser.mockReturnValue({
				isLoaded: true,
				isSignedIn: true,
				user: {
					id: 'user_123',
					publicMetadata: { hasVsme: true },
				},
			})
			useOrganization.mockReturnValue({
				isLoaded: true,
				organization: null,
			})
		})

		it('renders Create Organization link and UserButton', () => {
			render(<HeaderButtons />)

			expect(screen.getByTestId('signed-in')).toBeInTheDocument()
			expect(screen.getByText('Create Organization')).toBeInTheDocument()
			expect(screen.getByTestId('user-button')).toBeInTheDocument()
		})

		it('does not render Get Access or Dashboard buttons', () => {
			render(<HeaderButtons />)

			expect(screen.queryByText('Get access')).not.toBeInTheDocument()
			expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
		})
	})

	describe('Full Access (orgHasVsme + vsmeDb)', () => {
		beforeEach(() => {
			useUser.mockReturnValue({
				isLoaded: true,
				isSignedIn: true,
				user: {
					id: 'user_123',
					publicMetadata: { hasVsme: true },
				},
			})
			useOrganization.mockReturnValue({
				isLoaded: true,
				organization: {
					id: 'org_456',
					publicMetadata: { hasVsme: true, vsmeDb: true },
				},
			})
		})

		it('renders Dashboard button, OrganizationSwitcher, and UserButton', () => {
			render(<HeaderButtons />)

			expect(screen.getByTestId('signed-in')).toBeInTheDocument()
			expect(screen.getByText('Dashboard')).toBeInTheDocument()
			expect(screen.getByTestId('org-switcher')).toBeInTheDocument()
			expect(screen.getByTestId('user-button')).toBeInTheDocument()
		})

		it('does not render Get Access or Create Organization', () => {
			render(<HeaderButtons />)

			expect(screen.queryByText('Get access')).not.toBeInTheDocument()
			expect(screen.queryByText('Create Organization')).not.toBeInTheDocument()
		})
	})

	describe('Loading States', () => {
		it('returns null while user data is loading', () => {
			useUser.mockReturnValue({
				isLoaded: false,
				isSignedIn: false,
				user: null,
			})
			useOrganization.mockReturnValue({
				isLoaded: true,
				organization: null,
			})

			const { container } = render(<HeaderButtons />)
			expect(container.firstChild).toBeNull()
		})

		it('returns null while org data is loading', () => {
			useUser.mockReturnValue({
				isLoaded: true,
				isSignedIn: true,
				user: { id: 'user_123', publicMetadata: {} },
			})
			useOrganization.mockReturnValue({
				isLoaded: false,
				organization: null,
			})

			const { container } = render(<HeaderButtons />)
			expect(container.firstChild).toBeNull()
		})
	})
})
