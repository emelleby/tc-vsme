import { useNavigate } from '@tanstack/react-router'
import { ArrowRightIcon, TargetIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'

// ============================================================================
// Types
// ============================================================================

interface Projection {
	year: number
	scope1: number
	scope2: number
	scope3: number
	total: number
	isBaseYear?: boolean
	isTargetYear?: boolean
	isLongTermTargetYear?: boolean
}

interface TargetsData {
	_id: string
	targetYear: number
	longTermTargetYear?: number
	projections?: Projection[]
	lastModifiedAt?: number
	contributor?: { name: string }
}

// ============================================================================
// Data Extraction Utilities
// ============================================================================

function findProjectionByFlag(
	projections: Projection[] | undefined,
	flag: 'isBaseYear' | 'isTargetYear' | 'isLongTermTargetYear',
): Projection | null {
	if (!projections || projections.length === 0) return null
	return projections.find((p) => p[flag] === true) ?? null
}

function calculateReductionPercentage(
	baseEmission: number,
	targetEmission: number,
): string {
	if (baseEmission === 0) return '0.0%'
	const reduction = ((baseEmission - targetEmission) / baseEmission) * 100
	return `${reduction.toFixed(1)}%`
}

function formatEmission(value: number | undefined): string {
	if (value === undefined || value === null) return '-'
	return value.toLocaleString('en-US', { maximumFractionDigits: 1 })
}

// ============================================================================
// Table Component
// ============================================================================

interface EmissionTargetTableProps {
	title: string
	targetYear: number
	baseYearProjection: Projection | null
	targetProjection: Projection | null
}

function EmissionTargetTable({
	title,
	targetYear,
	baseYearProjection,
	targetProjection,
}: EmissionTargetTableProps) {
	const baseYear = baseYearProjection?.year ?? '-'

	const rows = [
		{ label: 'Scope 1', baseKey: 'scope1' as const },
		{ label: 'Scope 2', baseKey: 'scope2' as const },
		{ label: 'Scope 3', baseKey: 'scope3' as const },
		{ label: 'Total', baseKey: 'total' as const },
	]

	return (
		<div className="space-y-2 mt-4">
			<h4 className="text-sm font-semibold text-foreground">
				{title} {targetYear}
			</h4>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-[100px]">Scope</TableHead>
						<TableHead className="text-center">Base Year</TableHead>
						<TableHead className="text-center">Base Emissions</TableHead>
						<TableHead className="text-center">Reduction Target (%)</TableHead>
						<TableHead className="text-center">
							Absolute Emission Target
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{rows.map((row) => {
						const baseEmission = baseYearProjection?.[row.baseKey] ?? 0
						const targetEmission = targetProjection?.[row.baseKey] ?? 0
						const reductionPct = calculateReductionPercentage(
							baseEmission,
							targetEmission,
						)

						return (
							<TableRow key={row.baseKey}>
								<TableCell className="font-medium">{row.label}</TableCell>
								<TableCell className="text-center text-muted-foreground">
									{baseYear}
								</TableCell>
								<TableCell className="text-center">
									{formatEmission(baseYearProjection?.[row.baseKey])}
								</TableCell>
								<TableCell className="text-center font-medium text-emerald-600 dark:text-emerald-400">
									{reductionPct}
								</TableCell>
								<TableCell className="text-center font-medium">
									{formatEmission(targetProjection?.[row.baseKey])}
								</TableCell>
							</TableRow>
						)
					})}
				</TableBody>
			</Table>
		</div>
	)
}

// ============================================================================
// Placeholder Component (No Targets)
// ============================================================================

function TargetsPlaceholder() {
	const navigate = useNavigate()

	return (
		<div className="flex flex-col items-center justify-center py-8 px-4 text-center">
			<div className="rounded-full bg-muted p-4 mb-4">
				<TargetIcon className="h-8 w-8 text-muted-foreground" />
			</div>
			<h4 className="text-lg font-semibold mb-2">No Emission Targets Set</h4>
			<p className="text-sm text-muted-foreground mb-6 max-w-md">
				Define your organization's emission reduction targets to track progress
				towards sustainability goals.
			</p>
			<Button onClick={() => navigate({ to: '/app/targets' })}>
				Set Targets
				<ArrowRightIcon className="ml-2 h-4 w-4" />
			</Button>
		</div>
	)
}

// ============================================================================
// Targets Content Component (Has Targets)
// ============================================================================

interface TargetsContentProps {
	targets: TargetsData
}

function TargetsContent({ targets }: TargetsContentProps) {
	const navigate = useNavigate()

	const baseYearProjection = findProjectionByFlag(
		targets.projections,
		'isBaseYear',
	)
	const targetYearProjection = findProjectionByFlag(
		targets.projections,
		'isTargetYear',
	)
	const longTermProjection = findProjectionByFlag(
		targets.projections,
		'isLongTermTargetYear',
	)

	// Check if we have the minimum required data
	const hasTargetYearData = baseYearProjection && targetYearProjection
	const hasLongTermData = baseYearProjection && longTermProjection

	return (
		<div className="space-y-6">
			{hasTargetYearData && (
				<EmissionTargetTable
					title="Target Year"
					targetYear={targets.targetYear}
					baseYearProjection={baseYearProjection}
					targetProjection={targetYearProjection}
				/>
			)}

			{hasLongTermData && (
				<EmissionTargetTable
					title="Long Term Targets"
					targetYear={targets.longTermTargetYear ?? targets.targetYear}
					baseYearProjection={baseYearProjection}
					targetProjection={longTermProjection}
				/>
			)}

			{!hasTargetYearData && !hasLongTermData && (
				<div className="text-center py-4 text-muted-foreground">
					<p>Incomplete target data. Please update your targets.</p>
				</div>
			)}

			<div className="flex justify-end pt-2">
				<Button
					variant="outline"
					onClick={() => navigate({ to: '/app/targets' })}
				>
					Edit Targets
					<ArrowRightIcon className="ml-2 h-4 w-4" />
				</Button>
			</div>
		</div>
	)
}

// ============================================================================
// Main C3 Form Component (for use inside FormCard)
// ============================================================================

interface C3TargetsFormProps {
	targets: TargetsData | null | undefined
	isLoading?: boolean
}

export function C3TargetsForm({ targets, isLoading }: C3TargetsFormProps) {
	const hasTargets = targets !== null && targets !== undefined

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-8">
				<div className="animate-pulse text-muted-foreground">
					Loading targets...
				</div>
			</div>
		)
	}

	if (!hasTargets) {
		return <TargetsPlaceholder />
	}

	return <TargetsContent targets={targets} />
}

// ============================================================================
// Exports for parent component
// ============================================================================

export type { TargetsData }
