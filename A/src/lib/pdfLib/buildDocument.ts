import { PDFDocument, degrees } from 'pdf-lib'
import type { PageSource } from '../../types/edits'

export async function buildPdfBytes(pages: PageSource[]): Promise<Uint8Array> {
  if (pages.length === 0) {
    throw new Error('Cannot build a PDF with no pages.')
  }

  const output = await PDFDocument.create()
  const cache = new Map<ArrayBuffer, PDFDocument>()

  for (const page of pages) {
    let sourceDocument = cache.get(page.sourceBytes)

    if (!sourceDocument) {
      sourceDocument = await PDFDocument.load(page.sourceBytes.slice(0))
      cache.set(page.sourceBytes, sourceDocument)
    }

    const [copiedPage] = await output.copyPages(sourceDocument, [page.sourcePageIndex])

    if (page.rotation !== 0) {
      copiedPage.setRotation(degrees(page.rotation))
    }

    output.addPage(copiedPage)
  }

  return output.save()
}

export async function getPdfPageCount(bytes: ArrayBuffer): Promise<number> {
  const document = await PDFDocument.load(bytes.slice(0))
  return document.getPageCount()
}

export function uint8ArrayToArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.slice().buffer
}
