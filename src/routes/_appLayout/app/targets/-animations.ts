import type { Variants } from 'framer-motion'

/**
 * Animation variants for list containers
 * Uses staggered children animation for smooth entrance
 */
export const listVariants: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
		},
	},
}

/**
 * Animation variants for individual items
 * Fades in with upward motion
 */
export const itemVariants: Variants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0 },
}
