import { SignInButton, useUser } from '@clerk/clerk-react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({
	component: RouteComponent,
})

function RouteComponent() {
	const { isSignedIn } = useUser()
	return (
		<div className="flex flex-col items-center justify-center h-screen gap-6">
			<h1 className="text-4xl font-bold tracking-tight">Home Page Combined</h1>
			<div className="flex flex-col gap-4">
				<Button variant="outline" asChild>
					<Link to="/demo">Demo</Link>
				</Button>
				{isSignedIn ? (
					<Button variant="outline" asChild>
						<Link to="/app">App</Link>
					</Button>
				) : (
					<SignInButton mode="modal" />
				)}
			</div>
		</div>
	)
}
