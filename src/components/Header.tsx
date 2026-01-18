import { Link } from '@tanstack/react-router'
import { type Language, LanguageSwitcher } from './LanguageSwitcher'
import { Button } from './ui/button'

const languages: Language[] = [
	{ code: 'en', label: 'English' },
	{ code: 'de', label: 'Deutsch' },
]

export default function Header() {
	return (
		<header className="bg-background border-b border-gray-200 shadow-sm">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					{/* Logo/Brand */}
					<Link
						to="/"
						className="flex items-center gap-2 hover:opacity-80 transition-opacity"
					>
						<img
							src="/tanstack-word-logo-white.svg"
							alt="TanStack Logo"
							className="h-8"
						/>
						<span className="text-sm font-medium text-foreground">Demo</span>
					</Link>
					{/* Navigation Links */}
					<nav className="hidden md:flex items-center gap-6">
						<Link
							to="/demo"
							className="text-sm font-medium text-foreground hover:text-accent transition-colors"
							activeProps={{
								className: 'text-sm font-medium text-blue-600',
							}}
						>
							Home
						</Link>
						<Link
							to="/about"
							className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
							activeProps={{
								className: 'text-sm font-medium text-blue-600',
							}}
						>
							About us
						</Link>
						<LanguageSwitcher languages={languages} />
					</nav>
					{/* Back to Main Button */}
					<Button variant="outline" asChild>
						<Link to="/">Back to Main</Link>
					</Button>
				</div>
			</div>
		</header>
	)
}
