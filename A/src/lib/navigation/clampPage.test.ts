import { describe, expect, it } from 'vitest'
import { clampPage } from './clampPage'

describe('clampPage', () => {
  it('clamps page numbers into the valid range', () => {
    expect(clampPage(0, 5)).toBe(1)
    expect(clampPage(3, 5)).toBe(3)
    expect(clampPage(9, 5)).toBe(5)
  })

  it('returns 1 when there are no pages', () => {
    expect(clampPage(4, 0)).toBe(1)
  })
})
