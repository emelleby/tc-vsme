import { SignUp } from '@clerk/clerk-react'
import { createFileRoute } from '@tanstack/react-router'
import Header from '@/components/Header'

export const Route = createFileRoute('/sign-up')({
	component: SignUpPage,
})

function SignUpPage() {
	return (
		<>
			<Header />
			<div className="flex min-h-screen items-center justify-center">
				<SignUp fallbackRedirectUrl="/app" />
			</div>
		</>
	)
}
