import { PDFDocument } from 'pdf-lib'
import { describe, expect, it } from 'vitest'
import { createMockPages } from '../../test/helpers'
import { buildPdfBytes } from './buildDocument'

describe('buildPdfBytes', () => {
  it('builds a pdf with the requested number of pages', async () => {
    const source = await PDFDocument.create()
    source.addPage()
    source.addPage()
    const sourceBytes = (await source.save()).slice().buffer

    const pages = createMockPages(2, sourceBytes)
    const output = await buildPdfBytes(pages)
    const rebuilt = await PDFDocument.load(output)

    expect(rebuilt.getPageCount()).toBe(2)
  })

  it('preserves rotation metadata when rebuilding pages', async () => {
    const source = await PDFDocument.create()
    source.addPage()
    const sourceBytes = (await source.save()).slice().buffer

    const pages = createMockPages(1, sourceBytes)
    pages[0].rotation = 90

    const output = await buildPdfBytes(pages)
    const rebuilt = await PDFDocument.load(output)
    const page = rebuilt.getPage(0)

    expect(page.getRotation().angle).toBe(90)
  })
})
