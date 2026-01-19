import { ClerkProvider } from '@clerk/clerk-react'
import { dark } from '@clerk/themes'
import { useEffect, useState } from 'react'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
if (!PUBLISHABLE_KEY) {
	throw new Error('Add your Clerk Publishable Key to the .env.local file')
}

export default function AppClerkProvider({
	children,
}: {
	children: React.ReactNode
}) {
	const [isDark, setIsDark] = useState(false)

	useEffect(() => {
		// Check if dark mode is active
		const checkDarkMode = () => {
			setIsDark(document.documentElement.classList.contains('dark'))
		}

		// Initial check
		checkDarkMode()

		// Watch for theme changes
		const observer = new MutationObserver(checkDarkMode)
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class'],
		})

		return () => observer.disconnect()
	}, [])

	return (
		<ClerkProvider
			publishableKey={PUBLISHABLE_KEY}
			afterSignOutUrl="/"
			appearance={{
				baseTheme: isDark ? dark : undefined,
				variables: {
					colorPrimary: 'oklch(0.65 0.14 55)', // --primary
					colorBackground: isDark
						? 'oklch(0.13 0.01 60)'
						: 'oklch(0.98 0.01 85)', // --background
					colorText: isDark ? 'oklch(0.93 0.02 85)' : 'oklch(0.13 0.01 60)', // --foreground
					colorInputBackground: isDark
						? 'oklch(0.22 0.02 55)'
						: 'oklch(0.95 0.01 85)', // --input
					colorInputText: isDark
						? 'oklch(0.93 0.02 85)'
						: 'oklch(0.13 0.01 60)', // --foreground
					borderRadius: '0.625rem', // --radius
				},
			}}
		>
			{children}
		</ClerkProvider>
	)
}
