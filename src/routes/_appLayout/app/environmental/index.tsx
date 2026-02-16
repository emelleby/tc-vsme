import { createFileRoute } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { api } from 'convex/_generated/api'
import { useQuery } from 'convex/react'
import { B3EnergyEmissionsForm } from '@/components/forms/b3-energy-emissions'
import { FormCard } from '@/components/ui/expandable-card-simple'
import { useOrgGuard } from '@/hooks/use-org-guard'
import { yearStore } from '@/lib/year-store'

export const Route = createFileRoute('/_appLayout/app/environmental/')({
	component: EnvironmentalPage,
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

function EnvironmentalPage() {
	const reportingYear = useStore(yearStore, (state) => state.selectedYear)

	// Guard against race conditions during org switching
	const { skipQuery, isLoading: isOrgLoading } = useOrgGuard()

	// Fetch all form sections with contributor names resolved
	const formSections = useQuery(
		api.forms.get.getFormAllSectionsWithContributors,
		skipQuery || {
			table: 'formEnvironmental',
			reportingYear,
		},
	)

	// Extract section-specific data with contributor already resolved
	const energyEmissions = formSections?.energyEmissions
	const section2 = formSections?.section2
	const section3 = formSections?.section3

	// Show loading state
	if (isOrgLoading || formSections === undefined) {
		return <div>Loading...</div>
	}

	return (
		<div className="flex flex-col gap-4 md:grid-cols-1 mt-4 max-w-6xl w-full mx-auto">
			<h1 className="text-2xl font-bold">Environmental Reporting</h1>
			<h3 className="text-lg text-muted-foreground">
				Environmental impact and sustainability metrics
			</h3>
			<FormCard
				title="Energy and climate emissions"
				updatedDate={formatDate(energyEmissions?.lastModifiedAt)}
				toolTip="Click to expand"
				status={energyEmissions?.status ?? 'draft'}
				contributor={energyEmissions?.contributor || { name: 'Unknown' }}
			>
				<B3EnergyEmissionsForm />
			</FormCard>

			<FormCard
				title="Environmental Section 2"
				updatedDate={formatDate(section2?.lastModifiedAt)}
				toolTip="Click to expand"
				status={section2?.status ?? 'draft'}
				contributor={section2?.contributor || { name: 'Unknown' }}
			>
				{/* Content will be added later */}
			</FormCard>
			<FormCard
				title="Environmental Section 3"
				updatedDate={formatDate(section3?.lastModifiedAt)}
				toolTip="Click to expand"
				status={section3?.status ?? 'draft'}
				contributor={section3?.contributor || { name: 'Unknown' }}
			>
				{/* Content will be added later */}
			</FormCard>
		</div>
	)
}
