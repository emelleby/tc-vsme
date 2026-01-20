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
	OrganizationSwitcher,
	SignedIn,
	SignedOut,
	SignInButton,
	SignUpButton,
	UserButton,
	useOrganization,
	useUser,
} from '@clerk/clerk-react'
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
	const { user, isLoaded: userLoaded } = useUser()
	const { organization, isLoaded: orgLoaded } = useOrganization()
	const currentLocale = getLocale()

	// Don't render until Clerk data is loaded
	if (!userLoaded || !orgLoaded) {
		return null
	}

	// Extract permission flags from metadata
	const hasVsme = Boolean(user?.publicMetadata?.hasVsme)
	const orgHasVsme = Boolean(organization?.publicMetadata?.hasVsme)
	const vsmeDb = Boolean(organization?.publicMetadata?.vsmeDb)

	return (
		<div className="flex items-center gap-4">
			{/* Signed Out Users: Show Sign Up and Sign In buttons */}
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

			{/* Signed In Users: Show auth-aware buttons */}
			<SignedIn>
				<div className="flex items-center gap-4">
					{/* No VSME access: Show "Get Access" link */}
					{!hasVsme && !orgHasVsme && (
						<Link
							to="/#contact"
							className="text-sm font-medium text-foreground hover:text-accent transition-colors"
						>
							Get access
						</Link>
					)}

					{/* Has VSME but no org/db: Show "Create Organization" link */}
					{hasVsme && (!orgHasVsme || !vsmeDb) && (
						<Link
							to="/create-organization"
							className="text-sm font-medium text-foreground hover:text-accent transition-colors"
						>
							Create Organization
						</Link>
					)}

					{/* Full Access: Show Dashboard button and OrganizationSwitcher */}
					{orgHasVsme && vsmeDb && (
						<>
							<Button asChild variant="outline" size="sm">
								<Link to="/app">
									Dashboard
									<ArrowRight className="ml-2 h-4 w-4" />
								</Link>
							</Button>
							<OrganizationSwitcher
								hidePersonal
								skipInvitationScreen
								appearance={{
									baseTheme: undefined,
								}}
							/>
						</>
					)}

					{/* Always show UserButton for signed-in users */}
					<LanguageSwitcher
						languages={languages}
						value={currentLocale}
						onChange={(code) => setLocale(code as typeof currentLocale)}
						variant="ghost"
						showIcon={true}
					/>
					<ThemeSwitcher />
					<UserButton />
				</div>
			</SignedIn>
		</div>
	)
}
