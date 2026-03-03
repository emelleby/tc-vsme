import { createFileRoute } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { api } from 'convex/_generated/api'
import { useQuery } from 'convex/react'
import { B11FinesPenaltiesForm } from '@/components/forms/governance/B11FinesPenaltiesForm'
import { C8SectorInvolvementForm } from '@/components/forms/governance/C8SectorInvolvementForm'
import { C9BoardCompositionForm } from '@/components/forms/governance/C9BoardCompositionForm'
import { FormCard } from '@/components/ui/expandable-card-simple'
import { useOrgGuard } from '@/hooks/use-org-guard'
import { yearStore } from '@/lib/year-store'

export const Route = createFileRoute('/_appLayout/app/governance/')({
	component: GovernancePage,
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

function GovernancePage() {
	const reportingYear = useStore(yearStore, (state) => state.selectedYear)

	// Guard against race conditions during org switching
	const { skipQuery, isLoading: isOrgLoading } = useOrgGuard()

	// Fetch all form sections with contributor names resolved
	const formSections = useQuery(
		api.forms.get.getFormAllSectionsWithContributors,
		skipQuery || {
			table: 'formGovernance',
			reportingYear,
		},
	)

	// Extract section-specific data
	const finesPenalties = formSections?.finesPenalties
	const sectorInvolvement = formSections?.sectorInvolvement
	const boardComposition = formSections?.boardComposition

	// Show loading state
	if (isOrgLoading || formSections === undefined) {
		return <div>Loading...</div>
	}

	return (
		<div className="flex flex-col gap-4 mt-4 max-w-6xl w-full mx-auto pb-10">
			<h1 className="text-2xl font-bold">Governance Data</h1>
			<h3 className="text-lg text-muted-foreground">
				Report your governance metrics
			</h3>

			<FormCard
				title="Fines and Penalties"
				updatedDate={formatDate(finesPenalties?.lastModifiedAt)}
				toolTip="Report fines or penalties related to violations of anti-corruption or anti-bribery laws."
				status={finesPenalties?.status ?? 'draft'}
				contributor={finesPenalties?.contributor || { name: 'Unknown' }}
				code="B11"
				module="Grunnmodul"
				version={
					finesPenalties?.versions?.length
						? finesPenalties.versions[finesPenalties.versions.length - 1]?.version
						: undefined
				}
			>
				<B11FinesPenaltiesForm />
			</FormCard>

			<FormCard
				title="Sector Involvement"
				updatedDate={formatDate(sectorInvolvement?.lastModifiedAt)}
				toolTip="Report revenue from specific sectors like controversial weapons, fossil fuels, and agricultural chemicals."
				status={sectorInvolvement?.status ?? 'draft'}
				contributor={sectorInvolvement?.contributor || { name: 'Unknown' }}
				code="C8"
				module="Utvidet modul"
				version={
					sectorInvolvement?.versions?.length
						? sectorInvolvement.versions[sectorInvolvement.versions.length - 1]?.version
						: undefined
				}
			>
				<C8SectorInvolvementForm />
			</FormCard>

			<FormCard
				title="Board Composition"
				updatedDate={formatDate(boardComposition?.lastModifiedAt)}
				toolTip="Report the gender balance and total composition of the board."
				status={boardComposition?.status ?? 'draft'}
				contributor={boardComposition?.contributor || { name: 'Unknown' }}
				code="C9"
				module="Utvidet modul"
				version={
					boardComposition?.versions?.length
						? boardComposition.versions[boardComposition.versions.length - 1]?.version
						: undefined
				}
			>
				<C9BoardCompositionForm />
			</FormCard>
		</div>
	)
}
