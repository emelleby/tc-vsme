import { motion } from 'motion/react'
import * as React from 'react'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface GlowingCardProps extends React.ComponentProps<typeof Card> {
	glowColor?: 'sky' | 'teal' | 'rose' | 'amber' | 'pink' | 'copper'
}

const GlowingCard = React.forwardRef<HTMLDivElement, GlowingCardProps>(
	({ className, glowColor = 'sky', children, ...props }, ref) => {
		return (
			<motion.div
				whileHover={{ scale: 1.02 }}
				transition={{ duration: 0.2 }}
				className="h-full"
			>
				<Card
					ref={ref}
					className={cn(
						'h-full transition-all duration-300 border-2 border-transparent',
						glowColor === 'sky' &&
							'hover:shadow-[0_0_20px_-5px_var(--sky)] hover:border-[var(--sky)]',
						glowColor === 'teal' &&
							'hover:shadow-[0_0_20px_-5px_var(--teal)] hover:border-[var(--teal)]',
						glowColor === 'rose' &&
							'hover:shadow-[0_0_20px_-5px_var(--rose)] hover:border-[var(--rose)]',
						glowColor === 'amber' &&
							'hover:shadow-[0_0_20px_-5px_var(--amber)] hover:border-[var(--amber)]',
						glowColor === 'pink' &&
							'hover:shadow-[0_0_20px_-5px_var(--pink)] hover:border-[var(--pink)]',
						glowColor === 'copper' &&
							'hover:shadow-[0_0_20px_-5px_var(--copper)] hover:border-[var(--copper)]',
						className,
					)}
					{...props}
				>
					{children}
				</Card>
			</motion.div>
		)
	},
)
GlowingCard.displayName = 'GlowingCard'

export {
	GlowingCard,
	CardHeader,
	CardFooter,
	CardTitle,
	CardDescription,
	CardContent,
}
