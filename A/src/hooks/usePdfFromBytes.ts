import { useEffect, useRef, useState } from 'react'
import type { PDFDocumentLoadingTask, PDFDocumentProxy } from 'pdfjs-dist'
import { loadPdfDocument } from '../lib/pdfjs/loadDocument'
import type { LoadStatus } from '../types/pdf'

export type PdfDocumentState = {
  pdfDoc: PDFDocumentProxy | null
  pageCount: number
  loadStatus: LoadStatus
  loadError: string | null
}

const idleDocumentState: PdfDocumentState = {
  pdfDoc: null,
  pageCount: 0,
  loadStatus: 'idle',
  loadError: null,
}

export function usePdfFromBytes(pdfBytes: ArrayBuffer | null): PdfDocumentState {
  const loadingTaskRef = useRef<PDFDocumentLoadingTask | null>(null)
  const [state, setState] = useState<PdfDocumentState>(idleDocumentState)

  useEffect(() => {
    if (!pdfBytes) {
      setState(idleDocumentState)
      return
    }

    let cancelled = false

    setState({
      pdfDoc: null,
      pageCount: 0,
      loadStatus: 'loading',
      loadError: null,
    })

    const loadDocument = async () => {
      const previousTask = loadingTaskRef.current
      loadingTaskRef.current = null

      if (previousTask) {
        await previousTask.destroy()
      }

      try {
        const { doc, loadingTask } = await loadPdfDocument(pdfBytes)

        if (cancelled) {
          await loadingTask.destroy()
          return
        }

        loadingTaskRef.current = loadingTask
        setState({
          pdfDoc: doc,
          pageCount: doc.numPages,
          loadStatus: 'ready',
          loadError: null,
        })
      } catch (error) {
        if (cancelled) {
          return
        }

        const message =
          error instanceof Error ? error.message : 'Unable to load the selected PDF.'

        setState({
          pdfDoc: null,
          pageCount: 0,
          loadStatus: 'error',
          loadError: message,
        })
      }
    }

    void loadDocument()

    return () => {
      cancelled = true
      const activeTask = loadingTaskRef.current
      loadingTaskRef.current = null

      if (activeTask) {
        void activeTask.destroy()
      }
    }
  }, [pdfBytes])

  return state
}
