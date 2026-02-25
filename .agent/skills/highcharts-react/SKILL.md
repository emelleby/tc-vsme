---
name: highcharts-react
description: Rules and best practices for creating and theming charts with Highcharts using the @highcharts/react component library. Use this skill when asked to build, modify, or theme charts.
---

# Highcharts React Component Guidelines

This skill defines the standard approach for implementing charts in this project using Highcharts.

## Core Component Usage

We use the `@highcharts/react` package which provides declarative React components for building charts, rather than passing a traditional large `options` object.

**Required Imports:**
```tsx
import { Chart, Series, Title, Tooltip, XAxis, YAxis, Legend } from '@highcharts/react'
```

**Key Principles:**
1. **Declarative Structure**: Build charts using the wrapper components (`<Chart>`, `<XAxis>`, `<Series>`, etc.).
2. **Memoize Data**: Always wrap data arrays that are passed to the chart (e.g. for `<Series data={...}>` or `<XAxis categories={...}>`) in `useMemo` to prevent unnecessary chart re-renders.

## Theming and Styling (Adaptive Theme)

The application uses an automatic global Adaptive theme wrapper that handles light and dark mode switching automatically based on site-wide CSS variables.

**CRITICAL RULES:**
1. **NO HARDCODED COLORS**: Never use hex codes, RGB values, or manual dark mode checks (like `isDarkMode ? '#fff' : '#000'`) for chart colors.
2. **USE CSS VARIABLES**: To style specific series, always use the predefined CSS variables mapped to the Highcharts adaptive theme.

Available CSS variables for chart elements:
- `var(--highcharts-color-0)`
- `var(--highcharts-color-1)`
- `var(--highcharts-color-2)`
- `var(--highcharts-color-3)`
- `var(--highcharts-color-4)`

*(These map directly to the global theme colors and automatically adjust for light/dark mode).*

## Example Implementation

```tsx
import { Chart, Legend, Series, Title, Tooltip, XAxis, YAxis } from '@highcharts/react'
import { useMemo } from 'react'

export function ExampleChart({ data, title = 'Data Overview' }) {
	// 1. Always memoize chart data mapping
	const labels = useMemo(() => data.map((d) => d.label), [data])
	const series1Data = useMemo(() => data.map((d) => d.value1), [data])
	const series2Data = useMemo(() => data.map((d) => d.value2), [data])

	if (!data || data.length === 0) return null

	// 2. Build declaratively
	return (
		<Chart
			containerProps={{
				style: { width: '100%', height: '400px' },
			}}
		>
			<Title>{title}</Title>
			<XAxis categories={labels} title={{ text: 'Category' }} />
			<YAxis title={{ text: 'Values' }} min={0} />
			
			{/* 3. Use CSS variables for series colors! */}
			<Series
				type="line"
				data={series1Data}
				options={{
					name: 'Series 1',
					color: 'var(--highcharts-color-0)', // <-- Correct themed color
					marker: { symbol: 'circle' },
				}}
			/>
			<Series
				type="line"
				data={series2Data}
				options={{
					name: 'Series 2',
					color: 'var(--highcharts-color-1)', // <-- Correct themed color
					marker: { symbol: 'square' },
				}}
			/>
			<Legend layout="horizontal" align="center" verticalAlign="bottom" />
			<Tooltip shared valueDecimals={2} />
		</Chart>
	)
}
```
