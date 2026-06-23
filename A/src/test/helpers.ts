import type { PageSource } from '../types/edits'

export function createMockPage(
  id: string,
  sourcePageIndex: number,
  sourceBytes: ArrayBuffer = new ArrayBuffer(8),
  rotation: PageSource['rotation'] = 0,
): PageSource {
  return {
    id,
    sourceBytes,
    sourcePageIndex,
    rotation,
  }
}

export function createMockPages(count: number, bytes: ArrayBuffer = new ArrayBuffer(8)): PageSource[] {
  return Array.from({ length: count }, (_, index) =>
    createMockPage(`page-${index + 1}`, index, bytes),
  )
}
