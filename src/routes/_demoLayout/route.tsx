// This is the layout file of the app
import { createFileRoute, Outlet } from '@tanstack/react-router'
import DemoHeader from '@/components/DemoHeader'

export const Route = createFileRoute('/_demoLayout')({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<div className="flex flex-col min-h-screen">
			<DemoHeader />
			<Outlet />
		</div>
	)
}
