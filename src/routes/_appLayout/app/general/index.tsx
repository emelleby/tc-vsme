import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { HelpSheet } from '@/components/sheet'
import { FormCard } from '@/components/ui/expandable-card-simple'

export const Route = createFileRoute('/_appLayout/app/general/')({
	component: GeneralPage,
})

function GeneralPage() {
	const [isSheetOpen, setIsSheetOpen] = useState(false)

	return (
		<div className="grid gap-4 md:grid-cols-1 mt-4 max-w-6xl w-full mx-auto">
			<h1 className="text-2xl font-bold">General information</h1>
			<h3 className="text-lg text-muted-foreground">
				Grunnleggende informasjon om din organisasjon
			</h3>
			<FormCard
				title="Design System"
				progress={65}
				updatedDate="Dec 31, 2023"
				toolTip="Hover to learn more"
				contributor={{ name: 'Emma' }}
				onClick={() => {
					console.log('Opening HelpSheet...')
					setIsSheetOpen(true)
				}}
				openIssues={0}
				buttonText="Hjelp"
			/>

			<FormCard
				title="Analytics Dashboard"
				progress={45}
				updatedDate="Mar 1, 2024"
				toolTip="Click to learn more"
				contributor={{ name: 'Ana' }}
				openIssues={8}
			/>

			{/* Shared Help Sheet */}
			<HelpSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} />
		</div>
	)
}
