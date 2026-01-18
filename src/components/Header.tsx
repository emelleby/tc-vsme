import { Link } from '@tanstack/react-router'
import { m } from '@/paraglide/messages'
import { getLocale, setLocale } from '@/paraglide/runtime'
import { type Language, LanguageSwitcher } from './LanguageSwitcher'
import { ThemeSwitcher } from './ThemeSwitcher'
import { Button } from './ui/button'

const languages: Language[] = [
	{ code: 'en', label: 'English' },
	{ code: 'no', label: 'Norsk' },
]

export default function Header() {
	const currentLocale = getLocale()

	return (
		<header className="bg-background border-b border-border shadow-sm">
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
						<span className="text-sm font-medium text-foreground">
							{m.nav_home()}
						</span>
					</Link>
					{/* Navigation Links */}
					<nav className="hidden md:flex items-center gap-6">
						<Link
							to="/demo"
							className="text-sm font-medium text-foreground hover:text-accent transition-colors"
							activeProps={{
								className: 'text-sm font-medium text-accent',
							}}
						>
							{m.nav_demo()}
						</Link>
						<Link
							to="/about"
							className="text-sm font-medium text-foreground hover:text-accent transition-colors"
							activeProps={{
								className: 'text-sm font-medium text-accent',
							}}
						>
							{m.nav_about()}
						</Link>
					</nav>
					{/* Back to Main Button */}
					<div className="flex items-center gap-4">
						<Button variant="outline" asChild>
							<Link to="/">{m.nav_back_to_main()}</Link>
						</Button>
						<LanguageSwitcher
							languages={languages}
							value={currentLocale}
							onChange={(code) => setLocale(code as typeof currentLocale)}
							variant="outline"
						/>
						<ThemeSwitcher />
					</div>
				</div>
			</div>
		</header>
	)
}
