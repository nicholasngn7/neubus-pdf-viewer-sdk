import { getDocument, type PDFDocumentLoadingTask, type PDFDocumentProxy } from 'pdfjs-dist'

export type LoadedPdfDocument = {
  doc: PDFDocumentProxy
  loadingTask: PDFDocumentLoadingTask
}

export async function loadPdfDocument(data: ArrayBuffer): Promise<LoadedPdfDocument> {
  const loadingTask = getDocument({ data: data.slice(0) })
  const doc = await loadingTask.promise
  return { doc, loadingTask }
}
