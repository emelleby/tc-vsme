'use client'

import { Link } from '@tanstack/react-router'
import { Menu } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTrigger,
} from '@/components/ui/sheet'
import { m } from '@/paraglide/messages'

import { HeaderButtons } from './HeaderButtons'

export default function Header() {
	const [isOpen, setIsOpen] = useState(false)

	return (
		<header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 shadow-md">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					{/* Mobile Menu Trigger */}
					<Sheet open={isOpen} onOpenChange={setIsOpen}>
						<SheetTrigger asChild>
							<Button
								variant="ghost"
								size="sm"
								className="xl:hidden"
								aria-label="Open navigation menu"
							>
								<Menu className="size-5" />
							</Button>
						</SheetTrigger>
						<SheetContent side="left" className="w-64">
							<SheetHeader className="mb-6">
								<Link
									to="/"
									className="flex items-center gap-2 hover:opacity-80 transition-opacity"
									onClick={() => setIsOpen(false)}
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
							</SheetHeader>
							<nav className="flex flex-col gap-4">
								<Link
									to="/demo"
									className="text-sm font-medium text-foreground hover:text-accent transition-colors"
									activeProps={{
										className: 'text-sm font-medium text-accent',
									}}
									onClick={() => setIsOpen(false)}
								>
									{m.nav_demo()}
								</Link>
								<Link
									to="/about"
									className="text-sm font-medium text-foreground hover:text-accent transition-colors"
									activeProps={{
										className: 'text-sm font-medium text-accent',
									}}
									onClick={() => setIsOpen(false)}
								>
									{m.nav_about()}
								</Link>
							</nav>
						</SheetContent>
					</Sheet>

					{/* Logo/Brand - Desktop Only */}
					<Link
						to="/"
						className="hidden xl:flex items-center gap-2 hover:opacity-80 transition-opacity"
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

					{/* Navigation Links - Desktop Only */}
					<nav className="hidden xl:flex items-center gap-6">
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

					{/* Right Side Controls - Always Visible */}
					<div className="flex items-center gap-2 xl:gap-4">
						<HeaderButtons />
					</div>
				</div>
			</div>
		</header>
	)
}
