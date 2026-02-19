'use client'

import { motion } from 'framer-motion'
import { BadgeQuestionMarkIcon, ChevronRightIcon, InfoIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { useRef } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip'
import { useExpandable } from '@/hooks/use-expandable'
import { cn } from '@/lib/utils'

interface FormCardProps {
	title: string
	status: string
	updatedDate: string
	contributor: { name: string; image?: string }
	onClick?: () => void
	toolTip: string
	buttonText?: string
	children?: ReactNode
	module?: 'Grunnmodul' | 'Utvidet modul'
	code: string
	version?: number
}

export function FormCard({
	title,
	status,
	updatedDate,
	contributor,
	onClick = () => {},
	toolTip,
	buttonText,
	children,
	module,
	code,
	version,
}: FormCardProps) {
	const { isExpanded, toggleExpand } = useExpandable()
	const contentRef = useRef<HTMLDivElement>(null)
	const hasHelpButton = Boolean(buttonText)

	return (
		<Card
			className={cn(
				'mx-auto w-full max-w-6xl transition-all duration-300 hover:shadow-lg gap-2',
				module === 'Utvidet modul' && 'bg-accent/20',
			)}
		>
			<CardHeader
				className="cursor-pointer"
				onClick={toggleExpand}
				role="button"
				tabIndex={0}
				onKeyDown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault()
						toggleExpand()
					}
				}}
			>
				<div className="flex justify-between items-start w-full">
					<div className="flex gap-2 items-center">
						<div
							className={cn(
								'inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm',
								module === 'Utvidet modul'
									? 'bg-secondary text-secondary-foreground'
									: 'bg-primary text-primary-foreground',
							)}
						>
							{code}
						</div>
						<h3 className="text-xl font-semibold text-secondary">{title}</h3>
						<ChevronRightIcon
							className={cn(
								'h-6 w-6 transition-transform duration-200',
								isExpanded && 'rotate-90',
							)}
						/>
					</div>
					<div className="flex items-center gap-2">
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<InfoIcon
										className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors cursor-help"
										onClick={(e) => e.stopPropagation()}
									/>
								</TooltipTrigger>
								<TooltipContent>
									<p>{toolTip}</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
						{hasHelpButton && (
							<Button
								type="button"
								className="flex gap-2"
								variant="ghost"
								size="default"
								onClick={(e) => {
									e.stopPropagation()
									onClick()
								}}
								onPointerDown={(e) => e.stopPropagation()}
							>
								<BadgeQuestionMarkIcon className="h-6 w-6" />
								<span>{buttonText}</span>
							</Button>
						)}
					</div>
				</div>
			</CardHeader>

			<CardContent>
				<div className="space-y-0">
					<div className="flex justify-between items-center">
						<div className="flex gap-2">
							<Badge
								variant="secondary"
								className={
									status === 'submitted'
										? 'bg-emerald-100 border-emerald-600 text-emerald-600 dark:bg-emerald-800 dark:text-emerald-300'
										: 'bg-amber-100 border-amber-600 text-amber-600 dark:bg-amber-800 dark:text-amber-300'
								}
							>
								{status === 'submitted' ? 'Completed' : 'In Progress'}
							</Badge>
							{module && (
								<Badge
									variant="secondary"
									className={cn(
										'bg-secondary text-secondary-foreground',
										module === 'Grunnmodul' &&
											'bg-primary text-primary-foreground',
									)}
								>
									{module}
								</Badge>
							)}
						</div>
						{version !== undefined && (
							<div className="text-sm text-muted-foreground text-right">
								<div>
									Status:{' '}
									<span className="font-medium capitalize">{status}</span>
								</div>
								<div>Version: {version}</div>
							</div>
						)}
					</div>

					<motion.div
						initial={false}
						animate={{
							height: isExpanded ? 'auto' : 0,
							opacity: isExpanded ? 1 : 0,
						}}
						transition={{ type: 'spring', stiffness: 300, damping: 30 }}
						className="overflow-hidden"
					>
						<div ref={contentRef} className="pb-4">
							{/* Children kept mounted to preserve Convex subscriptions */}
							<div className="space-y-4 pt-2">
								<div className="space-y-2">{children}</div>
							</div>
						</div>
					</motion.div>
				</div>
			</CardContent>

			<CardFooter>
				<div className="w-full text-sm text-muted-foreground">
					Last updated by {contributor.name}: {updatedDate}
				</div>
			</CardFooter>
		</Card>
	)
}
