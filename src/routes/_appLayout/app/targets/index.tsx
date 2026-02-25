import { useStore } from '@tanstack/react-form'
import { createFileRoute } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppForm } from '@/hooks/tanstack-form'
import { listVariants } from './-animations'
import {
	useScope1Form,
	useScope2Form,
	useScope3Form,
	useTargetsComputedValues,
	useTargetsData,
	useTargetsForm,
} from './-hooks'
import { MainTab } from './-main-tab'
import { Scope1Tab } from './-scope1-tab'
import { Scope2Tab } from './-scope2-tab'
import { Scope3Tab } from './-scope3-tab'

export const Route = createFileRoute('/_appLayout/app/targets/')({
	component: TargetsPage,
})

function TargetsPage() {
	const [selectedBaseYear, setSelectedBaseYear] = useState<number | null>(null)

	// Fetch all targets-related data
	const {
		organization,
		existingTargets,
		baseYearEmissionsData,
		saveTargets,
		yearOptions,
		companyName,
	} = useTargetsData(selectedBaseYear)

	// Main form setup
	const { form, isSaving } = useTargetsForm(
		existingTargets,
		baseYearEmissionsData,
		saveTargets,
		selectedBaseYear,
		setSelectedBaseYear,
		useAppForm,
	)

	// Scope 1 form setup
	const { form: scope1Form, isSaving: isSavingScope1 } = useScope1Form(
		existingTargets,
		saveTargets,
		useAppForm,
	)

	// Scope 2 form setup
	const { form: scope2Form, isSaving: isSavingScope2 } = useScope2Form(
		existingTargets,
		saveTargets,
		useAppForm,
	)

	// Scope 3 form setup
	const { form: scope3Form, isSaving: isSavingScope3 } = useScope3Form(
		existingTargets,
		baseYearEmissionsData,
		saveTargets,
		useAppForm,
	)

	// Watch form values for table generation
	const formValues = useStore(form.store, (state) => state.values)

	// Compute derived values
	const {
		baseScope1Value,
		baseScope2Value,
		baseScope3Value,
		tableData,
		hasSpecificTargetsActive,
	} = useTargetsComputedValues(
		existingTargets,
		baseYearEmissionsData,
		formValues,
	)

	// Show loading state
	if (!organization || existingTargets === undefined) {
		return <div className="p-6">Loading...</div>
	}

	return (
		<div className="p-6 space-y-8 max-w-4xl mx-auto">
			<div>
				<h1 className="text-3xl font-bold mb-2">
					Climate emissions targets for {companyName}
				</h1>
				<p className="text-muted-foreground">
					Page for setting climate targets
				</p>
			</div>

			<Tabs defaultValue="main" className="w-full">
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="main">Main</TabsTrigger>
					<TabsTrigger value="scope1">Scope 1</TabsTrigger>
					<TabsTrigger value="scope2">Scope 2</TabsTrigger>
					<TabsTrigger value="scope3">Scope 3</TabsTrigger>
				</TabsList>

				<div className="mt-6">
					<TabsContent value="main" className="mt-0">
						<AnimatePresence>
							<motion.div
								animate="visible"
								className="space-y-8"
								exit="hidden"
								initial="hidden"
								variants={listVariants}
							>
								<MainTab
									form={form}
									isSaving={isSaving}
									hasSpecificTargetsActive={hasSpecificTargetsActive}
									selectedBaseYear={selectedBaseYear}
									setSelectedBaseYear={setSelectedBaseYear}
									yearOptions={yearOptions}
									baseYearEmissionsData={baseYearEmissionsData}
									existingTargets={existingTargets}
									tableData={tableData}
									companyName={companyName}
								/>
							</motion.div>
						</AnimatePresence>
					</TabsContent>
					<TabsContent value="scope1" className="mt-0">
						<AnimatePresence>
							<motion.div
								animate="visible"
								exit="hidden"
								initial="hidden"
								variants={listVariants}
							>
								<Scope1Tab
									scope1Form={scope1Form}
									isSavingScope1={isSavingScope1}
									existingTargets={existingTargets}
									baseScope1Value={baseScope1Value}
								/>
							</motion.div>
						</AnimatePresence>
					</TabsContent>
					<TabsContent value="scope2" className="mt-0">
						<AnimatePresence>
							<motion.div
								animate="visible"
								exit="hidden"
								initial="hidden"
								variants={listVariants}
							>
								<Scope2Tab
									scope2Form={scope2Form}
									isSavingScope2={isSavingScope2}
									existingTargets={existingTargets}
									baseScope2Value={baseScope2Value}
								/>
							</motion.div>
						</AnimatePresence>
					</TabsContent>
					<TabsContent value="scope3" className="mt-0">
						<AnimatePresence>
							<motion.div
								animate="visible"
								exit="hidden"
								initial="hidden"
								variants={listVariants}
							>
								<Scope3Tab
									scope3Form={scope3Form}
									isSavingScope3={isSavingScope3}
									existingTargets={existingTargets}
									baseScope3Value={baseScope3Value}
									baseYearEmissionsData={baseYearEmissionsData}
								/>
							</motion.div>
						</AnimatePresence>
					</TabsContent>
				</div>
			</Tabs>
		</div>
	)
}
