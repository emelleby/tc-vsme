import { createFileRoute } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { api } from 'convex/_generated/api'
import { useQuery } from 'convex/react'
import { B3EnergyEmissionsForm } from '@/components/forms/b3-energy-emissions'
import { B4PollutionForm } from '@/components/forms/b4-pollution-form'
import { B5BiodiversityForm } from '@/components/forms/b5-biodiversity-form'
import { B6WaterManagementForm } from '@/components/forms/b6-water-form'
import { B7ResourceUseCircularEconomyForm } from '@/components/forms/b7-resource-use-circular-economy-form'
import { C2Scope3EmissionsForm } from '@/components/forms/c2-scope3-emissions-form'
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
	const pollution = formSections?.pollution
	const biodiversity = formSections?.biodiversity
	const waterManagement = formSections?.waterManagement
	const resourceUseCircularEconomy = formSections?.resourceUseCircularEconomy
	const scope3Emissions = formSections?.scope3Emissions

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
				code="B3"
				version={
					energyEmissions?.versions?.length
						? energyEmissions.versions[energyEmissions.versions.length - 1]
								?.version
						: undefined
				}
			>
				<B3EnergyEmissionsForm />
			</FormCard>

			<FormCard
				title="Air, Water and Soil Pollution"
				updatedDate={formatDate(pollution?.lastModifiedAt)}
				toolTip="Document your organization's emissions to air, water, and soil, including types and quantities of pollutants."
				status={pollution?.status ?? 'draft'}
				contributor={pollution?.contributor || { name: 'Unknown' }}
				code="B4"
				version={
					pollution?.versions?.length
						? pollution.versions[pollution.versions.length - 1]?.version
						: undefined
				}
			>
				<B4PollutionForm />
			</FormCard>

			<FormCard
				title="Biodiversity"
				updatedDate={formatDate(biodiversity?.lastModifiedAt)}
				toolTip="Click to expand"
				status={biodiversity?.status ?? 'draft'}
				contributor={biodiversity?.contributor || { name: 'Unknown' }}
				code="B5"
				module="Grunnmodul"
				version={
					biodiversity?.versions?.length
						? biodiversity.versions[biodiversity.versions.length - 1]?.version
						: undefined
				}
			>
				<B5BiodiversityForm />
			</FormCard>

			<FormCard
				title="Water Management"
				updatedDate={formatDate(waterManagement?.lastModifiedAt)}
				toolTip="Click to expand"
				status={waterManagement?.status ?? 'draft'}
				contributor={waterManagement?.contributor || { name: 'Unknown' }}
				code="B6"
				module="Grunnmodul"
				version={
					waterManagement?.versions?.length
						? waterManagement.versions[waterManagement.versions.length - 1]
								?.version
						: undefined
				}
			>
				<B6WaterManagementForm />
			</FormCard>

			<FormCard
				title="Resource Use and Circular Economy"
				updatedDate={formatDate(resourceUseCircularEconomy?.lastModifiedAt)}
				toolTip="Click to expand"
				status={resourceUseCircularEconomy?.status ?? 'draft'}
				contributor={resourceUseCircularEconomy?.contributor || { name: 'Unknown' }}
				code="B7"
				module="Grunnmodul"
				version={
					resourceUseCircularEconomy?.versions?.length
						? resourceUseCircularEconomy.versions[
								resourceUseCircularEconomy.versions.length - 1
							]?.version
						: undefined
				}
			>
				<B7ResourceUseCircularEconomyForm />
			</FormCard>

			<FormCard
				title="Scope 3 Emissions"
				updatedDate={formatDate(scope3Emissions?.lastModifiedAt)}
				toolTip="Click to expand"
				status={scope3Emissions?.status ?? 'draft'}
				contributor={scope3Emissions?.contributor || { name: 'Unknown' }}
				code="C2"
				module="Utvidet modul"
				version={
					scope3Emissions?.versions?.length
						? scope3Emissions.versions[scope3Emissions.versions.length - 1]
								?.version
						: undefined
				}
			>
				<C2Scope3EmissionsForm />
			</FormCard>
		</div>
	)
}