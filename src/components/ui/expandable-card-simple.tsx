'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { BadgeQuestionMarkIcon, ChevronRightIcon } from 'lucide-react'
import React, { useRef } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Progress as ProgressBar } from '@/components/ui/progress'
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
	progress: number
	updatedDate: string
	contributor: { name: string; image?: string }
	onClick?: () => void
	openIssues: number
	toolTip: string
	buttonText?: string
	children?: React.ReactNode
}

export function FormCard({
	title,
	progress,
	updatedDate,
	contributor,
	onClick = () => {},
	openIssues,
	toolTip,
	buttonText,
	children,
}: FormCardProps) {
	const { isExpanded, toggleExpand } = useExpandable()
	const contentRef = useRef<HTMLDivElement>(null)

	return (
		<Card className="mx-auto w-full max-w-6xl transition-all duration-300 hover:shadow-lg">
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
						<h3 className="text-xl font-semibold">{title}</h3>
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
					<div className="space-y-2">
						<div className="flex justify-between">
							<Badge
								variant="secondary"
								className={
									progress === 100
										? 'bg-green-100 text-emerald-600'
										: 'bg-blue-100 text-sky-600'
								}
							>
								{progress === 100 ? 'Completed' : 'In Progress'}
							</Badge>
							<span className="text-sm text-muted-foreground">
								{progress} %
							</span>
						</div>
						<ProgressBar value={progress} className="h-2" />
					</div>

					<motion.div
						initial={false}
						animate={{ height: isExpanded ? 'auto' : 0 }}
						transition={{ type: 'spring', stiffness: 300, damping: 30 }}
						className="overflow-hidden"
					>
						<div ref={contentRef} className="pb-4">
							<AnimatePresence mode="wait">
								{isExpanded && (
									<motion.div
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										className="space-y-4 pt-2"
									>
										<div className="space-y-2">{children}</div>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</motion.div>
				</div>
			</CardContent>

			<CardFooter>
				<div className="flex items-center justify-between w-full text-sm text-muted-foreground">
					<span>
						Last updated by {contributor.name}: {updatedDate}
					</span>
					<span>{openIssues} open issues</span>
				</div>
			</CardFooter>
		</Card>
	)
}
