import { describe, expect, it } from 'vitest'
import { isPdfFile } from './isPdfFile'

describe('isPdfFile', () => {
  it('accepts files with a pdf mime type', () => {
    const file = new File(['content'], 'document.pdf', { type: 'application/pdf' })
    expect(isPdfFile(file)).toBe(true)
  })

  it('accepts files with a .pdf extension even when mime type is missing', () => {
    const file = new File(['content'], 'scan.PDF', { type: '' })
    expect(isPdfFile(file)).toBe(true)
  })

  it('rejects non-pdf files', () => {
    const file = new File(['content'], 'notes.txt', { type: 'text/plain' })
    expect(isPdfFile(file)).toBe(false)
  })
})
