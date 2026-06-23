import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type RefObject,
} from 'react'
import { usePdfFromBytes, type PdfDocumentState } from '../hooks/usePdfFromBytes'
import type { ViewMode } from '../types/pdf'
import PageCanvas from './PageCanvas'

type PdfViewerProps = {
  fileName: string | null
  pdfBytes: ArrayBuffer | null
  currentPage: number
  viewMode: ViewMode
  scale: number
  canvasAreaRef?: RefObject<HTMLDivElement | null>
  onFileSelect: (file: File) => void
  onDocumentStateChange: (state: PdfDocumentState) => void
}

export default function PdfViewer({
  fileName,
  pdfBytes,
  currentPage,
  viewMode,
  scale,
  canvasAreaRef: externalCanvasAreaRef,
  onFileSelect,
  onDocumentStateChange,
}: PdfViewerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const internalCanvasAreaRef = useRef<HTMLDivElement>(null)
  const canvasAreaRef = externalCanvasAreaRef ?? internalCanvasAreaRef
  const [isDragging, setIsDragging] = useState(false)

  const { pdfDoc, pageCount, loadStatus, loadError } = usePdfFromBytes(pdfBytes)

  useEffect(() => {
    onDocumentStateChange({ pdfDoc, pageCount, loadStatus, loadError })
  }, [pdfDoc, pageCount, loadStatus, loadError, onDocumentStateChange])

  useEffect(() => {
    if (viewMode !== 'continuous' || !pdfDoc) {
      return
    }

    const pageElement = document.getElementById(`pdf-page-${currentPage}`)
    pageElement?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [currentPage, viewMode, pdfDoc])

  useEffect(() => {
    if (viewMode !== 'single' || !pdfDoc) {
      return
    }

    canvasAreaRef.current?.scrollTo({ top: 0, behavior: 'auto' })
  }, [currentPage, viewMode, pdfDoc])

  const openFilePicker = () => {
    inputRef.current?.click()
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onFileSelect(file)
    }
    event.target.value = ''
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)

    const file = event.dataTransfer.files?.[0]
    if (file) {
      onFileSelect(file)
    }
  }

  const hasPdfBytes = pdfBytes !== null

  return (
    <section className="pdf-viewer" aria-label="Document viewer">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="app-header__file-input"
        onChange={handleInputChange}
        aria-hidden="true"
        tabIndex={-1}
      />

      {loadStatus === 'loading' && (
        <div className="pdf-viewer__status pdf-viewer__status--loading" role="status">
          Loading PDF…
        </div>
      )}

      {loadStatus === 'error' && loadError && (
        <div className="pdf-viewer__status pdf-viewer__status--error" role="alert">
          {loadError}
        </div>
      )}

      <div ref={canvasAreaRef} className="pdf-viewer__canvas-area">
        {!hasPdfBytes ? (
          <div
            className={`pdf-viewer__empty${isDragging ? ' is-dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="pdf-viewer__empty-icon" aria-hidden="true">
              PDF
            </div>
            <h2 className="pdf-viewer__empty-title">Open a PDF to begin</h2>
            <p className="pdf-viewer__empty-text">
              Drag and drop a local PDF here, or use Open PDF in the header to
              select a file from your computer.
            </p>
            <button type="button" className="btn btn--primary" onClick={openFilePicker}>
              Choose PDF
            </button>
          </div>
        ) : loadStatus === 'loading' ? (
          <div className="pdf-viewer__loading-panel" role="status">
            <p className="pdf-viewer__loading-title">Loading {fileName ?? 'PDF'}…</p>
            <p className="pdf-viewer__loading-text">Parsing document pages in the browser.</p>
          </div>
        ) : loadStatus === 'error' ? (
          <div className="pdf-viewer__error-panel" role="alert">
            <p className="pdf-viewer__error-title">Could not open PDF</p>
            <p className="pdf-viewer__error-text">{loadError ?? 'Unknown error.'}</p>
            <button type="button" className="btn btn--primary" onClick={openFilePicker}>
              Choose another PDF
            </button>
          </div>
        ) : pdfDoc && loadStatus === 'ready' ? (
          <div className="pdf-viewer__pages">
            {viewMode === 'single' ? (
              <PageCanvas
                key={`single-${currentPage}-${scale}`}
                pdfDoc={pdfDoc}
                pageNumber={currentPage}
                scale={scale}
              />
            ) : (
              Array.from({ length: pageCount }, (_, index) => {
                const pageNumber = index + 1
                return (
                  <PageCanvas
                    key={`continuous-${pageNumber}-${scale}`}
                    id={`pdf-page-${pageNumber}`}
                    pdfDoc={pdfDoc}
                    pageNumber={pageNumber}
                    scale={scale}
                  />
                )
              })
            )}
          </div>
        ) : null}
      </div>

      {fileName && loadStatus === 'ready' && (
        <div className="pdf-viewer__footer" aria-live="polite">
          Viewing {fileName}
        </div>
      )}
    </section>
  )
}
