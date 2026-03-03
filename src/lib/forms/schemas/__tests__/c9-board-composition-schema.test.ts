import { describe, expect, it } from 'vitest'
import { c9BoardCompositionSchema } from '../c9-board-composition-schema'

describe('c9BoardCompositionSchema', () => {
	it('accepts valid board composition', () => {
		const result = c9BoardCompositionSchema.safeParse({
			reportingYear: '2025',
			totalMembers: 5,
			femaleMembers: 2,
			maleMembers: 3,
			otherMembers: 0,
		})
		expect(result.success).toBe(true)
	})

	it('rejects missing members', () => {
		const result = c9BoardCompositionSchema.safeParse({
			reportingYear: '2025',
			totalMembers: 5,
		})
		expect(result.success).toBe(false)
	})

	it('rejects negative members', () => {
		const result = c9BoardCompositionSchema.safeParse({
			reportingYear: '2025',
			totalMembers: 5,
			femaleMembers: -1,
			maleMembers: 6,
			otherMembers: 0,
		})
		expect(result.success).toBe(false)
	})
})
