import { createFileRoute } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { api } from 'convex/_generated/api'
import { useQuery } from 'convex/react'
import { useState } from 'react'
import { B3EnergyEmissionsForm } from '@/components/forms/b3-energy-emissions'
import { B4PollutionForm } from '@/components/forms/b4-pollution-form'
import { B5BiodiversityForm } from '@/components/forms/b5-biodiversity-form'
import { B6WaterManagementForm } from '@/components/forms/b6-water-form'
import { B7ResourceUseCircularEconomyForm } from '@/components/forms/b7-resource-use-circular-economy-form'
import { C2Scope3EmissionsForm } from '@/components/forms/c2-scope3-emissions-form'
import { C4ClimateRiskForm } from '@/components/forms/c4-climate-risk-form'
import { HelpSheet } from '@/components/sheet'
import { FormCard } from '@/components/ui/expandable-card-simple'
import { useOrgGuard } from '@/hooks/use-org-guard'
import { yearStore } from '@/lib/year-store'
import { BiodiversityHelp } from './-biodiversity-help'
import { C3TargetsForm } from './-c3-targets-card'
import { CircularHelp } from './-circular-help'
import { EnergyHelp } from './-energy-help'
import { PollutionHelp } from './-pollution-help'
import { WaterHelp } from './-water-help'

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
	const [isCircularHelpOpen, setCircularHelpOpen] = useState(false)
	const [isWaterHelpOpen, setWaterHelpOpen] = useState(false)
	const [isBiodiversityHelpOpen, setBiodiversityHelpOpen] = useState(false)
	const [isEnergyHelpOpen, setEnergyHelpOpen] = useState(false)
	const [isPollutionHelpOpen, setPollutionHelpOpen] = useState(false)

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

	// Fetch targets data for C3 card
	const targetsData = useQuery(api.targets.getTargets, skipQuery ? 'skip' : {})

	// Extract section-specific data with contributor already resolved
	const energyEmissions = formSections?.energyEmissions
	const pollution = formSections?.pollution
	const biodiversity = formSections?.biodiversity
	const waterManagement = formSections?.waterManagement
	const resourceUseCircularEconomy = formSections?.resourceUseCircularEconomy
	const scope3Emissions = formSections?.scope3Emissions
	const climateRiskAnalysis = formSections?.climateRiskAnalysis

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
				status={energyEmissions?.status ?? 'not_started'}
				contributor={energyEmissions?.contributor || { name: 'Unknown' }}
				code="B3"
				buttonText="Hjelp"
				onClick={() => setEnergyHelpOpen(true)}
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
				status={pollution?.status ?? 'not_started'}
				contributor={pollution?.contributor || { name: 'Unknown' }}
				code="B4"
				buttonText="Hjelp"
				onClick={() => setPollutionHelpOpen(true)}
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
				status={biodiversity?.status ?? 'not_started'}
				contributor={biodiversity?.contributor || { name: 'Unknown' }}
				code="B5"
				module="Basic Module"
				buttonText="Hjelp"
				onClick={() => setBiodiversityHelpOpen(true)}
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
				status={waterManagement?.status ?? 'not_started'}
				contributor={waterManagement?.contributor || { name: 'Unknown' }}
				code="B6"
				module="Basic Module"
				buttonText="Hjelp"
				onClick={() => setWaterHelpOpen(true)}
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
				status={resourceUseCircularEconomy?.status ?? 'not_started'}
				contributor={
					resourceUseCircularEconomy?.contributor || { name: 'Unknown' }
				}
				code="B7"
				module="Basic Module"
				buttonText="Hjelp"
				onClick={() => setCircularHelpOpen(true)}
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

			<HelpSheet
				open={isCircularHelpOpen}
				onOpenChange={setCircularHelpOpen}
				title="Veiledning for sirkulærøkonomi"
				description="Informasjon om sirkulærøkonomiske prinsipper og praktisk veiledning for avfallshåndtering."
			>
				<CircularHelp />
			</HelpSheet>

			<HelpSheet
				open={isEnergyHelpOpen}
				onOpenChange={setEnergyHelpOpen}
				title="Veiledning for energiforbruk og utslipp"
				description="Informasjon om energiforbruk, utslippsberegninger og energikilder."
			>
				<EnergyHelp />
			</HelpSheet>

			<HelpSheet
				open={isPollutionHelpOpen}
				onOpenChange={setPollutionHelpOpen}
				title="Veiledning for forurensningsrapportering"
				description="Informasjon om rapporteringsplikt for forurensende stoffer."
			>
				<PollutionHelp />
			</HelpSheet>

			<HelpSheet
				open={isWaterHelpOpen}
				onOpenChange={setWaterHelpOpen}
				title="Veiledning for vannforvaltning"
				description="Informasjon om vannforvaltning og praktisk veiledning for vannuttak og utslipp."
			>
				<WaterHelp />
			</HelpSheet>

			<HelpSheet
				open={isBiodiversityHelpOpen}
				onOpenChange={setBiodiversityHelpOpen}
				title="Veiledning for arealbeslag og biologisk mangfold"
				description="Informasjon om arealbeslag, forseglet areal og naturmangfold."
			>
				<BiodiversityHelp />
			</HelpSheet>

			<FormCard
				title="Scope 3 Emissions"
				updatedDate={formatDate(scope3Emissions?.lastModifiedAt)}
				toolTip="Click to expand"
				status={scope3Emissions?.status ?? 'not_started'}
				contributor={scope3Emissions?.contributor || { name: 'Unknown' }}
				code="C2"
				module="Comprehensive Module"
				version={
					scope3Emissions?.versions?.length
						? scope3Emissions.versions[scope3Emissions.versions.length - 1]
								?.version
						: undefined
				}
			>
				<C2Scope3EmissionsForm />
			</FormCard>

			<FormCard
				title="Emission reduction targets"
				updatedDate={formatDate(targetsData?.lastModifiedAt)}
				toolTip="View and manage your organization's emission reduction targets."
				status={targetsData ? 'submitted' : 'not_started'}
				contributor={targetsData?.contributor || { name: 'Unknown' }}
				code="C3"
				module="Comprehensive Module"
			>
				<C3TargetsForm
					targets={targetsData}
					isLoading={targetsData === undefined}
				/>
			</FormCard>

			<FormCard
				title="Climate Risk Analysis"
				updatedDate={formatDate(climateRiskAnalysis?.lastModifiedAt)}
				toolTip="Describe climate-related risks that may affect the business."
				status={climateRiskAnalysis?.status ?? 'not_started'}
				contributor={climateRiskAnalysis?.contributor || { name: 'Unknown' }}
				code="C4"
				module="Comprehensive Module"
				version={
					climateRiskAnalysis?.versions?.length
						? climateRiskAnalysis.versions[
								climateRiskAnalysis.versions.length - 1
							]?.version
						: undefined
				}
			>
				<C4ClimateRiskForm />
			</FormCard>
		</div>
	)
}
