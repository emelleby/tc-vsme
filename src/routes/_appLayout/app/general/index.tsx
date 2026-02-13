import { createFileRoute } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { api } from 'convex/_generated/api'
import { useQuery } from 'convex/react'
import { useState } from 'react'
import { B1GeneralForm } from '@/components/forms/b1-general-form'
import { GeneralHelp } from '@/components/general-help'
import { HelpSheet } from '@/components/sheet'
import { FormCard } from '@/components/ui/expandable-card-simple'
import { useOrgGuard } from '@/hooks/use-org-guard'
import { yearStore } from '@/lib/year-store'

export const Route = createFileRoute('/_appLayout/app/general/')({
	component: GeneralPage,
})

/**
 * Format a timestamp to a human-readable date string
 */
function formatDate(timestamp: number | undefined): string {
	if (!timestamp) return 'Never'
	return new Date(timestamp).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	})
}

function GeneralPage() {
	const [isSheetOpen, setIsSheetOpen] = useState(false)
	const reportingYear = useStore(yearStore, (state) => state.selectedYear)

	// Guard against race conditions during org switching
	const { skipQuery, isLoading: isOrgLoading } = useOrgGuard()

	// Fetch all form sections with contributor names resolved
	const formSections = useQuery(
		api.forms.get.getFormAllSectionsWithContributors,
		skipQuery || {
			table: 'formGeneral',
			reportingYear,
		},
	)

	// Extract section-specific data
	const companyInfo = formSections?.companyInfo
	const sustainability = formSections?.sustainabilityInitiatives

	// Show loading state during organization switching
	if (isOrgLoading) {
		return (
			<div className="flex items-center justify-center p-8 text-muted-foreground">
				Loading organization...
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-4 md:grid-cols-1 mt-4 max-w-6xl w-full mx-auto">
			<h1 className="text-2xl font-bold">General information</h1>
			<h3 className="text-lg text-muted-foreground">
				Grunnleggende informasjon om din organisasjon
			</h3>
			<FormCard
				title="Company information"
				updatedDate={formatDate(companyInfo?.lastModifiedAt)}
				status={companyInfo?.status ?? 'draft'}
				toolTip="Click to learn more"
				contributor={companyInfo?.contributor || { name: 'Unknown' }}
			>
				<B1GeneralForm />
			</FormCard>
			<FormCard
				title="Sustainability initiatives"
				updatedDate={formatDate(sustainability?.lastModifiedAt)}
				toolTip="Hover to learn more"
				status={sustainability?.status ?? 'draft'}
				contributor={sustainability?.contributor || { name: 'Unknown' }}
				onClick={() => setIsSheetOpen(true)}
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
