// This is the layout file of the app
import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import Header from '@/components/Header'

export const Route = createFileRoute('/_demoLayout')({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<div className="flex flex-col min-h-screen">
			<Header />
			<Outlet />
		</div>
	)
}
