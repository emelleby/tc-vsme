import { createFileRoute } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { api } from 'convex/_generated/api'
import { useQuery } from 'convex/react'
import { B8WorkforceForm } from '@/components/forms/social/B8Form'
import { FormCard } from '@/components/ui/expandable-card-simple'
import { useOrgGuard } from '@/hooks/use-org-guard'
import { yearStore } from '@/lib/year-store'

export const Route = createFileRoute('/_appLayout/app/social/')({
	component: SocialPage,
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

function SocialPage() {
	const reportingYear = useStore(yearStore, (state) => state.selectedYear)

	// Guard against race conditions during org switching
	const { skipQuery, isLoading: isOrgLoading } = useOrgGuard()

	// Fetch all form sections with contributor names resolved
	const formSections = useQuery(
		api.forms.get.getFormAllSectionsWithContributors,
		skipQuery || {
			table: 'formSocial',
			reportingYear,
		},
	)

	// Extract section-specific data with contributor already resolved
	const workforce = formSections?.workforce

	// Show loading state
	if (isOrgLoading || formSections === undefined) {
		return <div>Loading...</div>
	}

	return (
		<div className="flex flex-col gap-4 md:grid-cols-1 mt-4 max-w-6xl w-full mx-auto">
			<h1 className="text-2xl font-bold">Social Reporting</h1>
			<h3 className="text-lg text-muted-foreground">
				Workforce and social impact metrics
			</h3>

			<FormCard
				title="Arbeidsstyrke"
				updatedDate={formatDate(workforce?.lastModifiedAt)}
				toolTip="Rapporter ansettelsesforhold, kjønnsfordeling og geografisk fordeling av arbeidsstyrken."
				status={workforce?.status ?? 'draft'}
				contributor={workforce?.contributor || { name: 'Unknown' }}
				code="B8"
				module="Grunnmodul"
				version={
					workforce?.versions?.length
						? workforce.versions[workforce.versions.length - 1]?.version
						: undefined
				}
			>
				<B8WorkforceForm />
			</FormCard>
		</div>
	)
}

