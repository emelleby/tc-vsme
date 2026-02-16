import { describe, it, expect } from 'vitest'
import { detectChanges } from '../_utils'

describe('Form Utils: detectChanges', () => {
  it('should detect added fields', () => {
    const oldData = { a: 1 }
    const newData = { a: 1, b: 2 }
    const changes = detectChanges(oldData, newData)
    
    expect(changes).toHaveLength(1)
    expect(changes[0]).toEqual({
      field: 'b',
      oldValue: undefined,
      newValue: 2
    })
  })

  it('should detect modified fields', () => {
    const oldData = { a: 1 }
    const newData = { a: 2 }
    const changes = detectChanges(oldData, newData)
    
    expect(changes).toHaveLength(1)
    expect(changes[0]).toEqual({
      field: 'a',
      oldValue: 1,
      newValue: 2
    })
  })

  it('should detect deleted fields', () => {
    const oldData = { a: 1, b: 2 }
    const newData = { a: 1 }
    const changes = detectChanges(oldData, newData)
    
    expect(changes).toHaveLength(1)
    expect(changes[0]).toEqual({
      field: 'b',
      oldValue: 2,
      newValue: undefined
    })
  })

  it('should detect nested object changes', () => {
    const oldData = { settings: { theme: 'dark' } }
    const newData = { settings: { theme: 'light' } }
    const changes = detectChanges(oldData, newData)
    
    expect(changes).toHaveLength(1)
    expect(changes[0]).toEqual({
      field: 'settings',
      oldValue: { theme: 'dark' },
      newValue: { theme: 'light' }
    })
  })

  it('should return empty array if no changes', () => {
    const oldData = { a: 1, b: { c: 2 } }
    const newData = { a: 1, b: { c: 2 } }
    const changes = detectChanges(oldData, newData)
    
    expect(changes).toHaveLength(0)
  })

  it('should handle null/undefined oldData', () => {
    const oldData = null
    const newData = { a: 1 }
    // @ts-ignore
    const changes = detectChanges(oldData, newData)
    
    expect(changes).toHaveLength(1)
    expect(changes[0]).toEqual({
      field: 'a',
      oldValue: undefined,
      newValue: 1
    })
  })
})
