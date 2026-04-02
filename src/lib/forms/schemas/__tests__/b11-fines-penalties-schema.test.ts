import { describe, expect, it } from 'vitest'
import { b11FinesPenaltiesSchema } from '../b11-fines-penalties-schema'

describe('b11FinesPenaltiesSchema', () => {
	it('accepts valid input without fines', () => {
		const result = b11FinesPenaltiesSchema.safeParse({
			reportingYear: '2025',
			hasCorruptionFines: false,
		})
		expect(result.success).toBe(true)
	})

	it('accepts valid input with fines and description', () => {
		const result = b11FinesPenaltiesSchema.safeParse({
			reportingYear: '2025',
			hasCorruptionFines: true,
			corruptionFinesDescription: 'Minor fine for late submission of documents.',
		})
		expect(result.success).toBe(true)
	})

	it('rejects fines without description', () => {
		const result = b11FinesPenaltiesSchema.safeParse({
			reportingYear: '2025',
			hasCorruptionFines: true,
		})
		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error.issues[0].path).toContain('corruptionFinesDescription')
		}
	})

	it('rejects invalid reporting years', () => {
		const result = b11FinesPenaltiesSchema.safeParse({
			reportingYear: '25',
			hasCorruptionFines: false,
		})
		expect(result.success).toBe(false)
	})
})
