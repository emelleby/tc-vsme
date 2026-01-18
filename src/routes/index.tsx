import { SignInButton, useUser } from '@clerk/clerk-react'
import { createFileRoute, Link } from '@tanstack/react-router'
import Header from '@/components/Header'
import { Button } from '@/components/ui/button'
import { m } from '@/paraglide/messages'

export const Route = createFileRoute('/')({
	component: RouteComponent,
})

function RouteComponent() {
	const { isSignedIn } = useUser()
	return (
		<div className="flex flex-col min-h-screen">
			<Header />
			<div className="flex flex-col items-center justify-center flex-1 gap-6">
				<h1 className="text-4xl font-bold tracking-tight">{m.index_title()}</h1>
				<div className="flex flex-col gap-4">
					<Button variant="outline" asChild>
						<Link to="/demo">{m.index_demo()}</Link>
					</Button>
					{isSignedIn ? (
						<Button variant="outline" asChild>
							<Link to="/app">{m.index_app()}</Link>
						</Button>
					) : (
						<SignInButton mode="modal" />
					)}
				</div>
			</div>
		</div>
	)
}
