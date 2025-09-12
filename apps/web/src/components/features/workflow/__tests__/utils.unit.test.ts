import { buildDragRect, hasMatchingId, isPointInRect, nextStatusOnDrag } from '@/components/features/workflow/utils'
import { describe, expect, it } from 'vitest'

describe('workflow utils', () => {
  it('isPointInRect works with boundaries', () => {
    const rect: any = { left: 0, right: 10, top: 0, bottom: 10 }
    expect(isPointInRect({ x: 5, y: 5 }, rect)).toBe(true)
    expect(isPointInRect({ x: -1, y: 5 }, rect)).toBe(false)
  })

  it('buildDragRect uses element size', () => {
    const el: any = { getBoundingClientRect: () => ({ width: 20, height: 10 }) }
    const r = buildDragRect(el, { x: 1, y: 2 })
    expect(r).toEqual({ x: 1, y: 2, width: 20, height: 10 })
  })

  it('hasMatchingId returns membership', () => {
    expect(hasMatchingId([{ id: 'a' }], 'a')).toBe(true)
    expect(hasMatchingId([{ id: 'a' }], 'b')).toBe(false)
  })

  it('nextStatusOnDrag transitions correctly', () => {
    expect(nextStatusOnDrag('intersected', false)).toBe('default')
    expect(nextStatusOnDrag('default', true)).toBe('intersected')
    expect(nextStatusOnDrag(undefined, false)).toBe('default')
  })
})


