import type { PDFDocumentProxy } from 'pdfjs-dist'

export type PageDimensions = {
  width: number
  height: number
}

export async function getPageDimensions(
  pdfDoc: PDFDocumentProxy,
  pageNumber: number,
): Promise<PageDimensions> {
  const page = await pdfDoc.getPage(pageNumber)
  const viewport = page.getViewport({ scale: 1 })

  return {
    width: viewport.width,
    height: viewport.height,
  }
}
