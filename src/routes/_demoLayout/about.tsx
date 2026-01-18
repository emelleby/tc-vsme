import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_demoLayout/about')({
	component: AboutPage,
})

function AboutPage() {
	return (
		<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
			<div className="space-y-8">
				<div>
					<h1 className="text-4xl font-bold text-gray-900 mb-4">About This Demo</h1>
					<p className="text-lg text-gray-600">
						Welcome to the TanStack demo application. This section showcases various
						features and integrations built with modern web technologies.
					</p>
				</div>

				<div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
					<h2 className="text-2xl font-semibold text-gray-900 mb-3">
						What's Included
					</h2>
					<ul className="space-y-2 text-gray-700">
						<li className="flex items-start gap-3">
							<span className="text-blue-600 font-bold">•</span>
							<span>TanStack Router for powerful routing and navigation</span>
						</li>
						<li className="flex items-start gap-3">
							<span className="text-blue-600 font-bold">•</span>
							<span>TanStack Query for server state management</span>
						</li>
						<li className="flex items-start gap-3">
							<span className="text-blue-600 font-bold">•</span>
							<span>TanStack Form for flexible form handling</span>
						</li>
						<li className="flex items-start gap-3">
							<span className="text-blue-600 font-bold">•</span>
							<span>Clerk for authentication and user management</span>
						</li>
						<li className="flex items-start gap-3">
							<span className="text-blue-600 font-bold">•</span>
							<span>Convex for backend database and real-time features</span>
						</li>
						<li className="flex items-start gap-3">
							<span className="text-blue-600 font-bold">•</span>
							<span>AI integrations for chat, image generation, and more</span>
						</li>
					</ul>
				</div>

				<div>
					<h2 className="text-2xl font-semibold text-gray-900 mb-3">
						Explore the Demos
					</h2>
					<p className="text-gray-700 mb-4">
						Navigate through the different demo sections using the menu to see these
						technologies in action. Each demo is designed to showcase specific
						capabilities and best practices.
					</p>
					<p className="text-gray-600 text-sm italic">
						Note: This demo section will be removed in future versions of the
						application.
					</p>
				</div>
			</div>
		</div>
	)
}

