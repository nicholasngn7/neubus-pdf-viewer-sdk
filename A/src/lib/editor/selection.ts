export function sortSelectedPages(selectedPages: Set<number>): number[] {
  return [...selectedPages].sort((left, right) => left - right)
}

export function togglePageInSelection(
  selectedPages: Set<number>,
  pageNumber: number,
): Set<number> {
  const next = new Set(selectedPages)

  if (next.has(pageNumber)) {
    next.delete(pageNumber)
  } else {
    next.add(pageNumber)
  }

  return next
}

export function clearPageSelection(): Set<number> {
  return new Set()
}

export function selectSinglePage(pageNumber: number): Set<number> {
  return new Set([pageNumber])
}
