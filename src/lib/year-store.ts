import { Store } from '@tanstack/store'

export type Year = 2022 | 2023 | 2024

export const AVAILABLE_YEARS: Year[] = [2022, 2023, 2024]

export const DEFAULT_YEAR: Year = 2024

export const yearStore = new Store({
	selectedYear: DEFAULT_YEAR as Year,
})

