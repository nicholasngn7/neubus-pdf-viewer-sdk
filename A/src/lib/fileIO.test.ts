import { describe, expect, it } from 'vitest'
import { buildEditedFileName } from './fileIO'

describe('buildEditedFileName', () => {
  it('appends a suffix before the pdf extension', () => {
    expect(buildEditedFileName('report.pdf', 'edited')).toBe('report-edited.pdf')
  })

  it('adds a pdf extension when the original name has no suffix', () => {
    expect(buildEditedFileName('report', 'extract')).toBe('report-extract.pdf')
  })

  it('returns a fallback name for blank input', () => {
    expect(buildEditedFileName('   ', 'edited')).toBe('edited.pdf')
  })
})
