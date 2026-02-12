import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { B1GeneralForm } from '@/components/forms/b1-general-form'
import { GeneralHelp } from '@/components/general-help'
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
				title="Company information"
				progress={45}
				updatedDate="Mar 1, 2024"
				toolTip="Click to learn more"
				contributor={{ name: 'Ana' }}
				openIssues={8}
			>
				<B1GeneralForm />
			</FormCard>
			<FormCard
				title="Sustainability initiatives"
				progress={65}
				updatedDate="Dec 31, 2023"
				toolTip="Hover to learn more"
				contributor={{ name: 'Emma' }}
				onClick={() => setIsSheetOpen(true)}
				openIssues={0}
				buttonText="Hjelp"
			/>

			{/* Shared Help Sheet */}
			<HelpSheet
				open={isSheetOpen}
				onOpenChange={setIsSheetOpen}
				title="Hva er bærekraftsinitiativ?"
				description="Bærekraftsinitiativ er konkrete tiltak og programmer som virksomheten
					gjennomfører for å forbedre sin miljømessige, sosiale og økonomiske
					påvirkning. Velg de områdene hvor virksomheten aktivt jobber med
					forbedringer."
			>
				<GeneralHelp />
			</HelpSheet>
		</div>
	)
}
