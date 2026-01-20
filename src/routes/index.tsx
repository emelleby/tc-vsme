import { SignInButton, useUser } from '@clerk/clerk-react'
import { createFileRoute, Link } from '@tanstack/react-router'
import Header from '@/components/Header'
import { Button } from '@/components/ui/button'
import { m } from '@/paraglide/messages'
import Home from '@/routes/-home'

export const Route = createFileRoute('/')({
	component: RouteComponent,
})

function RouteComponent() {
	const { isSignedIn } = useUser()
	return (
		<div className="flex flex-col min-h-screen">
			<Header />
			<Home />
		</div>
	)
}
