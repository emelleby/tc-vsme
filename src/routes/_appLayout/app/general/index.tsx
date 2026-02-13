import { createFileRoute } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { api } from 'convex/_generated/api'
import { useQuery } from 'convex/react'
import { B1GeneralForm } from '@/components/forms/b1-general-form'
import { B2SustainabilityInitiativesForm } from '@/components/forms/b2-sustainability-initiatives-form'
import { C1BusinessModelForm } from '@/components/forms/c1-business-model-form'
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
	const businessModel = formSections?.businessModel

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
				toolTip="Click to expand"
				status={sustainability?.status ?? 'draft'}
				contributor={sustainability?.contributor || { name: 'Unknown' }}
			>
				<B2SustainabilityInitiativesForm />
			</FormCard>
			<hr />
			<FormCard
				title="Business model"
				updatedDate={formatDate(businessModel?.lastModifiedAt)}
				toolTip="Click to expand"
				status={businessModel?.status ?? 'draft'}
				contributor={businessModel?.contributor || { name: 'Unknown' }}
				module="Utvidet modul"
			>
				<C1BusinessModelForm />
			</FormCard>
		</div>
	)
}
