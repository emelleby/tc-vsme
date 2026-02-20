import { Chart, Series, XAxis, YAxis } from '@highcharts/react'
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
			options={{
				chart: {
					type: 'line',
					height: 400,
					style: {
						fontFamily: 'inherit',
					},
				},
				title: {
					text: title,
					style: {
						fontSize: '18px',
						fontWeight: '600',
					},
				},
				xAxis: {
					categories: years,
					title: {
						text: 'Year',
					},
				},
				yAxis: {
					title: {
						text: 'Emissions (tCO₂e)',
					},
					min: 0,
				},
				tooltip: {
					shared: true,
					valueDecimals: 2,
					valueSuffix: ' tCO₂e',
				},
				legend: {
					layout: 'horizontal',
					align: 'center',
					verticalAlign: 'bottom',
				},
				plotOptions: {
					line: {
						marker: {
							enabled: true,
							radius: 4,
						},
						lineWidth: 2,
					},
				},
				credits: {
					enabled: false,
				},
			}}
		>
			<XAxis categories={years} />
			<YAxis>
				<Series
					type="line"
					data={scope1Data}
					options={{
						name: 'Scope 1',
						color: '#ef4444',
						marker: { symbol: 'circle' },
					}}
				/>
				<Series
					type="line"
					data={scope2Data}
					options={{
						name: 'Scope 2',
						color: '#f59e0b',
						marker: { symbol: 'square' },
					}}
				/>
				<Series
					type="line"
					data={scope3Data}
					options={{
						name: 'Scope 3',
						color: '#10b981',
						marker: { symbol: 'diamond' },
					}}
				/>
				<Series
					type="line"
					data={totalData}
					options={{
						name: 'Total',
						color: '#6366f1',
						lineWidth: 3,
						marker: { symbol: 'triangle' },
					}}
				/>
			</YAxis>
		</Chart>
	)
}
