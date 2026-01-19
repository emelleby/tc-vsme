import { SignIn } from '@clerk/clerk-react'
import { createFileRoute } from '@tanstack/react-router'
import Header from '@/components/Header'

export const Route = createFileRoute('/sign-in')({
	component: SignInPage,
})

function SignInPage() {
	return (
		<>
			<Header />
			<div className="flex min-h-screen items-center justify-center">
				<SignIn fallbackRedirectUrl="/app" />
			</div>
		</>
	)
}
