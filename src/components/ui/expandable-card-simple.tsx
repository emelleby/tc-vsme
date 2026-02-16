'use client'

import { motion } from 'framer-motion'
import { BadgeQuestionMarkIcon, ChevronRightIcon } from 'lucide-react'
import React, { useRef } from 'react'
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
	children?: React.ReactNode
	module?: 'Grunnmodul' | 'Utvidet modul'
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
}: FormCardProps) {
	const { isExpanded, toggleExpand } = useExpandable()
	const contentRef = useRef<HTMLDivElement>(null)

	return (
		<Card
			className={cn(
				'mx-auto w-full max-w-6xl transition-all duration-300 hover:shadow-lg',
				module === 'Utvidet modul' && 'bg-accent/20',
			)}
		>
			<CardHeader
				className="space-y-1 cursor-pointer"
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
					<div className="flex gap-2">
						<h3 className="text-xl font-semibold text-secondary">{title}</h3>
						<ChevronRightIcon
							className={cn(
								'h-6 w-6 transition-transform duration-200',
								isExpanded && 'rotate-90',
							)}
						/>
					</div>
					<div className="flex gap-2">
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										type="button"
										className="flex gap-2"
										variant="ghost"
										size="default"
										onClick={(e) => {
											e.stopPropagation()
											console.log('Button clicked in FormCard')
											onClick()
										}}
										onPointerDown={(e) => e.stopPropagation()}
									>
										<BadgeQuestionMarkIcon className="h-6 w-6" />
										<span>{buttonText}</span>
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>{toolTip}</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
				</div>
			</CardHeader>

			<CardContent>
				<div className="space-y-4">
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
								className="bg-blue-100 border-blue-600 text-blue-600 dark:bg-blue-800 dark:text-blue-300"
							>
								{module}
							</Badge>
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
