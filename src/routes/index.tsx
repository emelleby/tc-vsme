import { createFileRoute } from '@tanstack/react-router'
import Header from '@/components/Header'
import Home from '@/routes/-home'

export const Route = createFileRoute('/')({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<div className="flex flex-col min-h-screen">
			<Header />
			<Home />
		</div>
	)
}
