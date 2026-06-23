import { describe, expect, it } from 'vitest'
import { createMockPage, createMockPages } from '../../test/helpers'
import {
  deleteSelectedPages,
  getPagesForExtraction,
  moveSelectedPages,
  rotateSelectedPages,
} from './pageOperations'

describe('pageOperations', () => {
  const pages = createMockPages(4)

  it('rotates only selected pages', () => {
    const next = rotateSelectedPages(pages, new Set([2, 4]), 'right')

    expect(next[0].rotation).toBe(0)
    expect(next[1].rotation).toBe(90)
    expect(next[2].rotation).toBe(0)
    expect(next[3].rotation).toBe(90)
  })

  it('deletes selected pages while keeping at least one page', () => {
    const result = deleteSelectedPages(pages, new Set([2, 4]))

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.pages).toHaveLength(2)
      expect(result.pages.map((page) => page.id)).toEqual(['page-1', 'page-3'])
    }
  })

  it('rejects deleting every page', () => {
    const result = deleteSelectedPages(pages, new Set([1, 2, 3, 4]))
    expect(result).toEqual({ ok: false, error: 'delete-all' })
  })

  it('moves the selected block up and updates selection indices', () => {
    const result = moveSelectedPages(pages, new Set([2, 3]), 'up')

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.pages.map((page) => page.id)).toEqual(['page-2', 'page-1', 'page-3', 'page-4'])
      expect(result.selectedPages).toEqual(new Set([1, 2]))
    }
  })

  it('keeps page order stable when move up is invalid', () => {
    const result = moveSelectedPages(pages, new Set([1]), 'up')
    expect(result).toEqual({ ok: false, error: 'at-top' })
  })

  it('keeps page order stable when move down is invalid', () => {
    const result = moveSelectedPages(pages, new Set([4]), 'down')
    expect(result).toEqual({ ok: false, error: 'at-bottom' })
  })

  it('extracts selected pages in ascending page order', () => {
    const extracted = getPagesForExtraction(pages, new Set([3, 1]))

    expect(extracted?.map((page) => page.id)).toEqual(['page-1', 'page-3'])
  })

  it('returns null when nothing is selected for extraction', () => {
    expect(getPagesForExtraction(pages, new Set())).toBeNull()
  })

  it('preserves page-specific rotation during extraction', () => {
    const rotated = [
      createMockPage('a', 0),
      createMockPage('b', 1, new ArrayBuffer(8), 90),
    ]

    const extracted = getPagesForExtraction(rotated, new Set([2]))
    expect(extracted?.[0].rotation).toBe(90)
  })
})
