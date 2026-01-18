import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/use-theme'
import { Button } from '@/components/ui/button'

export function ThemeSwitcher() {
	const { theme, setTheme, isDark } = useTheme()

	return (
		<Button
			variant="ghost"
			size="sm"
			onClick={() => setTheme(isDark ? 'light' : 'dark')}
			title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
		>
			{isDark ? (
				<Sun className="size-4" />
			) : (
				<Moon className="size-4" />
			)}
		</Button>
	)
}

