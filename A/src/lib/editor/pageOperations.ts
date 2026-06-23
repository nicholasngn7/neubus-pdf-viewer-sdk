import { rotateLeft, rotateRight, type PageSource } from '../../types/edits'
import { sortSelectedPages } from './selection'

export type PageOperationError =
  | 'no-selection'
  | 'delete-all'
  | 'at-top'
  | 'at-bottom'

export type MoveSelectedResult =
  | {
      ok: true
      pages: PageSource[]
      selectedPages: Set<number>
    }
  | {
      ok: false
      error: PageOperationError
    }

export function rotateSelectedPages(
  pages: PageSource[],
  selectedPages: Set<number>,
  direction: 'left' | 'right',
): PageSource[] {
  const selected = new Set(selectedPages)
  const rotate = direction === 'left' ? rotateLeft : rotateRight

  return pages.map((page, index) => {
    if (!selected.has(index + 1)) {
      return page
    }

    return {
      ...page,
      rotation: rotate(page.rotation),
    }
  })
}

export function deleteSelectedPages(
  pages: PageSource[],
  selectedPages: Set<number>,
): { ok: true; pages: PageSource[] } | { ok: false; error: PageOperationError } {
  if (selectedPages.size === 0) {
    return { ok: false, error: 'no-selection' }
  }

  if (selectedPages.size >= pages.length) {
    return { ok: false, error: 'delete-all' }
  }

  const selected = new Set(selectedPages)
  return {
    ok: true,
    pages: pages.filter((_, index) => !selected.has(index + 1)),
  }
}

export function moveSelectedPages(
  pages: PageSource[],
  selectedPages: Set<number>,
  direction: 'up' | 'down',
): MoveSelectedResult {
  if (selectedPages.size === 0) {
    return { ok: false, error: 'no-selection' }
  }

  const selected = sortSelectedPages(selectedPages)
  const nextPages = [...pages]

  if (direction === 'up') {
    const firstIndex = selected[0] - 1
    if (firstIndex <= 0) {
      return { ok: false, error: 'at-top' }
    }

    const swapIndex = firstIndex - 1
    ;[nextPages[swapIndex], nextPages[firstIndex]] = [nextPages[firstIndex], nextPages[swapIndex]]

    return {
      ok: true,
      pages: nextPages,
      selectedPages: new Set(selected.map((page) => page - 1)),
    }
  }

  const lastIndex = selected[selected.length - 1] - 1
  if (lastIndex >= nextPages.length - 1) {
    return { ok: false, error: 'at-bottom' }
  }

  const swapIndex = lastIndex + 1
  ;[nextPages[lastIndex], nextPages[swapIndex]] = [nextPages[swapIndex], nextPages[lastIndex]]

  return {
    ok: true,
    pages: nextPages,
    selectedPages: new Set(selected.map((page) => page + 1)),
  }
}

export function getPagesForExtraction(
  pages: PageSource[],
  selectedPages: Set<number>,
): PageSource[] | null {
  if (selectedPages.size === 0) {
    return null
  }

  const selected = sortSelectedPages(selectedPages)
  return selected.map((pageNumber) => pages[pageNumber - 1])
}

export function createImportedPages(
  bytes: ArrayBuffer,
  pageCount: number,
  createId: () => string,
): PageSource[] {
  return Array.from({ length: pageCount }, (_, sourcePageIndex) => ({
    id: createId(),
    sourceBytes: bytes,
    sourcePageIndex,
    rotation: 0 as const,
  }))
}
