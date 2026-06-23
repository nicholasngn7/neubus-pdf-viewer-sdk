import { describe, expect, it } from 'vitest'
import {
  clearPageSelection,
  selectSinglePage,
  sortSelectedPages,
  togglePageInSelection,
} from './selection'

describe('page selection helpers', () => {
  it('toggles pages in and out of the selection set', () => {
    const first = togglePageInSelection(new Set<number>(), 2)
    expect(first.has(2)).toBe(true)

    const second = togglePageInSelection(first, 2)
    expect(second.has(2)).toBe(false)
  })

  it('sorts selected page numbers ascending', () => {
    expect(sortSelectedPages(new Set([3, 1, 2]))).toEqual([1, 2, 3])
  })

  it('creates a single-page selection and clears selections', () => {
    expect(selectSinglePage(4)).toEqual(new Set([4]))
    expect(clearPageSelection()).toEqual(new Set())
  })
})
