import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

export function useTheme() {
	const [theme, setThemeState] = useState<Theme>('system')
	const [mounted, setMounted] = useState(false)

	// Initialize theme from localStorage on mount
	useEffect(() => {
		const storedTheme = localStorage.getItem('theme') as Theme | null
		if (storedTheme) {
			setThemeState(storedTheme)
		}
		setMounted(true)
	}, [])

	// Apply theme to DOM
	useEffect(() => {
		if (!mounted) return

		const htmlElement = document.documentElement
		let effectiveTheme = theme

		// If system theme, check system preference
		if (theme === 'system') {
			effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
				? 'dark'
				: 'light'
		}

		// Apply the theme
		if (effectiveTheme === 'dark') {
			htmlElement.classList.add('dark')
		} else {
			htmlElement.classList.remove('dark')
		}

		// Save preference
		localStorage.setItem('theme', theme)
	}, [theme, mounted])

	const setTheme = (newTheme: Theme) => {
		setThemeState(newTheme)
	}

	// Only compute isDark on client side
	const isDark = mounted
		? theme === 'dark' ||
			(theme === 'system' &&
				typeof window !== 'undefined' &&
				window.matchMedia('(prefers-color-scheme: dark)').matches)
		: false

	return {
		theme,
		setTheme,
		isDark,
	}
}
