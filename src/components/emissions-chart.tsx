import {
	Chart,
	Legend,
	Series,
	Title,
	Tooltip,
	XAxis,
	YAxis,
} from '@highcharts/react'
import { useMemo } from 'react'

interface EmissionProjection {
	year: number
	scope1: number
	scope2: number
	scope3: number
	total: number
	isBaseYear?: boolean
	isTargetYear?: boolean
	isLongTermTargetYear?: boolean
}

interface EmissionsChartProps {
	projections: EmissionProjection[]
	title?: string
}

export function EmissionsChart({
	projections,
	title = 'Emissions Reduction Trajectory',
}: EmissionsChartProps) {
	const years = useMemo(
		() => projections.map((p) => p.year.toString()),
		[projections],
	)
	const scope1Data = useMemo(
		() => projections.map((p) => p.scope1),
		[projections],
	)
	const scope2Data = useMemo(
		() => projections.map((p) => p.scope2),
		[projections],
	)
	const scope3Data = useMemo(
		() => projections.map((p) => p.scope3),
		[projections],
	)
	const totalData = useMemo(
		() => projections.map((p) => p.total),
		[projections],
	)

	if (!projections || projections.length === 0) {
		return null
	}

	return (
		<Chart
			containerProps={{
				style: { width: '100%', height: '400px' },
			}}
		>
			<Title>{title}</Title>
			<XAxis categories={years} title={{ text: 'Year' }} />
			<YAxis title={{ text: 'Emissions (tCO₂e)' }} min={0} />
			<Series
				type="line"
				data={scope1Data}
				options={{
					name: 'Scope 1',
					color: 'var(--highcharts-color-3)',
					marker: { symbol: 'circle' },
				}}
			/>
			<Series
				type="line"
				data={scope2Data}
				options={{
					name: 'Scope 2',
					color: 'var(--highcharts-color-4)',
					marker: { symbol: 'square' },
				}}
			/>
			<Series
				type="line"
				data={scope3Data}
				options={{
					name: 'Scope 3',
					color: 'var(--highcharts-color-0)',
					marker: { symbol: 'diamond' },
				}}
			/>
			<Series
				type="line"
				data={totalData}
				options={{
					name: 'Total',
					color: 'var(--highcharts-color-1)',
					lineWidth: 3,
					marker: { symbol: 'triangle' },
				}}
			/>
			<Legend layout="horizontal" align="center" verticalAlign="bottom" />
			<Tooltip shared valueDecimals={2} valueSuffix=" tCO₂e" />
		</Chart>
	)
}
