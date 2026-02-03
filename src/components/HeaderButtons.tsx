/**
 * Header Buttons Component - Story 6: Header Conditional Rendering
 *
 * This component renders different buttons based on the user's authentication state
 * and VSME permissions. It implements the following logic:
 *
 * | State | Buttons Shown |
 * |-------|---------------|
 * | Signed Out | Sign Up, Sign In |
 * | Signed In, no VSME | Get Access link, UserButton |
 * | Has VSME, no org/db | Create Organization, UserButton |
 * | Full Access | Dashboard, OrgSwitcher, UserButton |
 */

'use client'

import {
	SignedIn,
	SignedOut,
	SignInButton,
	SignUpButton,
	UserButton,
	useAuth,
	useOrganization,
	useUser,
} from '@clerk/tanstack-react-start'
import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { getLocale, setLocale } from '@/paraglide/runtime'
import { type Language, LanguageSwitcher } from './LanguageSwitcher'
import { ThemeSwitcher } from './ThemeSwitcher'
import { Button } from './ui/button'

const languages: Language[] = [
	{ code: 'en', label: 'English' },
	{ code: 'no', label: 'Norsk' },
]

export function HeaderButtons() {
	const currentLocale = getLocale()

	return (
		<div className="flex items-center gap-4">
			{/* Public Access: Show Sign Up and Sign In buttons */}
			<SignedOut>
				<div className="flex items-center gap-2">
					<SignUpButton mode="modal" fallbackRedirectUrl="/app">
						<Button variant="outline">Sign up</Button>
					</SignUpButton>
					<SignInButton mode="modal" fallbackRedirectUrl="/app">
						<Button>
							Sign in
							<ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</SignInButton>
				</div>
			</SignedOut>

			{/* Authenticated Access: Logged-in specific controls */}
			<SignedIn>
				<SignedInButtons />
				<LanguageSwitcher
					languages={languages}
					value={currentLocale}
					onChange={(code) => setLocale(code as typeof currentLocale)}
					variant="ghost"
					showIcon={true}
				/>
				<ThemeSwitcher />
				<UserButton />
			</SignedIn>
		</div>
	)
}

function SignedInButtons() {
	const { user, isLoaded: userLoaded } = useUser()
	const { organization, isLoaded: orgLoaded } = useOrganization()
	const { isLoaded: authLoaded } = useAuth()

	// While we wait for client-side data, we can render nothing or a specialized skeleton.
	// Returning null here is safe inside <SignedIn> because the parent structure is already established.
	if (!userLoaded || !orgLoaded || !authLoaded) {
		return null
	}

	// Extract permission flags from metadata
	const hasVsme = Boolean(user?.publicMetadata?.hasVsme)
	const orgHasVsme = Boolean(organization?.publicMetadata?.hasVsme)
	const vsmeDb = Boolean(organization?.publicMetadata?.vsmeDb)

	return (
		<div className="flex items-center gap-4">
			<p>{hasVsme}</p>
			{/* No VSME access: Show "Get Access" link */}
			{!hasVsme && !orgHasVsme && (
				<Link
					to="/"
					hash="contact"
					className="text-sm font-medium text-foreground hover:text-accent transition-colors"
				>
					Get started! {orgHasVsme}
				</Link>
			)}

			{/* Has VSME but no org/db: Show "Create Organization" link */}
			{(orgHasVsme || hasVsme) && !vsmeDb && (
				<Link
					to="/create-organization"
					className="text-sm font-medium text-foreground hover:text-accent transition-colors"
				>
					Setup Organization
				</Link>
			)}

			{/* Full Access: Show Dashboard button */}
			{orgHasVsme && vsmeDb && (
				<Button asChild variant="outline" size="sm">
					<Link to="/app">
						Dashboard
						<ArrowRight className="ml-2 h-4 w-4" />
					</Link>
				</Button>
			)}
		</div>
	)
}
