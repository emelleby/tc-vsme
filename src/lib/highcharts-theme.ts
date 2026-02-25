// Must import from @highcharts/react — it uses 'highcharts/esm/highcharts.src.js'
// internally, which is a different module instance than bare 'highcharts'.
// Calling setOptions on the wrong instance has no effect on rendered charts.
import { Highcharts } from '@highcharts/react'

// We replicate the adaptive theme's setOptions manually to avoid its SSR crash.
// adaptive.js accesses window._Highcharts.Chart at module eval time, which fails
// on the server. Our CSS variables in styles.css handle light/dark switching.
Highcharts.setOptions({
	credits: { enabled: false },
	colors: [
		'var(--highcharts-color-0)',
		'var(--highcharts-color-1)',
		'var(--highcharts-color-2)',
		'var(--highcharts-color-3)',
		'var(--highcharts-color-4)',
		'var(--highcharts-color-5)',
	],
	chart: {
		backgroundColor: 'var(--highcharts-background-color)',
		style: { fontFamily: 'Nunito, ui-sans-serif, sans-serif' },
	},
	title: {
		style: {
			color: 'var(--highcharts-neutral-color-100)',
			fontFamily: "'Maven Pro', ui-sans-serif, sans-serif",
			fontWeight: '600',
		},
	},
	subtitle: {
		style: { color: 'var(--highcharts-neutral-color-60)' },
	},
	xAxis: {
		gridLineColor: 'var(--highcharts-neutral-color-10)',
		labels: { style: { color: 'var(--highcharts-neutral-color-80)' } },
		lineColor: 'var(--highcharts-neutral-color-10)',
		tickColor: 'var(--highcharts-neutral-color-10)',
		title: { style: { color: 'var(--highcharts-neutral-color-60)' } },
	},
	yAxis: {
		gridLineColor: 'var(--highcharts-neutral-color-10)',
		labels: { style: { color: 'var(--highcharts-neutral-color-80)' } },
		lineColor: 'var(--highcharts-neutral-color-10)',
		tickColor: 'var(--highcharts-neutral-color-10)',
		title: { style: { color: 'var(--highcharts-neutral-color-60)' } },
	},
	legend: {
		itemStyle: { color: 'var(--highcharts-neutral-color-80)' },
		itemHoverStyle: { color: 'var(--highcharts-neutral-color-100)' },
	},
	tooltip: {
		backgroundColor: 'var(--highcharts-neutral-color-3)',
		borderColor: 'var(--highcharts-neutral-color-10)',
		style: { color: 'var(--highcharts-neutral-color-80)' },
	},
})
