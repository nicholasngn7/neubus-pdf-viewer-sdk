import { useCallback, useRef, useState, type ChangeEvent } from 'react'
import EditorToolbar from './components/EditorToolbar'
import PageThumbnailList from './components/PageThumbnailList'
import PdfViewer from './components/PdfViewer'
import ViewerToolbar from './components/ViewerToolbar'
import type { PdfDocumentState } from './hooks/usePdfFromBytes'
import type { ViewMode } from './types/pdf'
import './App.css'

const DEFAULT_SCALE = 1.25

const initialDocumentState: PdfDocumentState = {
  pdfDoc: null,
  pageCount: 0,
  loadStatus: 'idle',
  loadError: null,
}

function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

function clampPage(page: number, pageCount: number): number {
  if (pageCount <= 0) {
    return 1
  }
  return Math.min(Math.max(page, 1), pageCount)
}

function App() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null)
  const [fileReadError, setFileReadError] = useState<string | null>(null)
  const [documentState, setDocumentState] = useState<PdfDocumentState>(initialDocumentState)

  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<ViewMode>('continuous')
  const [scale] = useState(DEFAULT_SCALE)
  const [isEditMode, setIsEditMode] = useState(false)

  const { pdfDoc, pageCount, loadStatus, loadError } = documentState
  const hasDocument = loadStatus === 'ready' && pdfDoc !== null

  const handleFileSelect = useCallback(async (file: File) => {
    if (!isPdfFile(file)) {
      window.alert('Please select a PDF file.')
      return
    }

    setFileReadError(null)
    setDocumentState(initialDocumentState)

    try {
      const bytes = await file.arrayBuffer()
      setFileName(file.name)
      setPdfBytes(bytes.slice(0))
      setCurrentPage(1)
      setIsEditMode(false)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to read the selected PDF file.'
      setFileName(null)
      setPdfBytes(null)
      setFileReadError(message)
      setDocumentState({
        pdfDoc: null,
        pageCount: 0,
        loadStatus: 'error',
        loadError: message,
      })
    }
  }, [])

  const handleDocumentStateChange = useCallback((state: PdfDocumentState) => {
    setDocumentState(state)
    setCurrentPage((page) => clampPage(page, state.pageCount))
  }, [])

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  const handleHeaderFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      void handleFileSelect(file)
    }
    event.target.value = ''
  }

  const handleQuickDownload = () => {
    if (!pdfBytes || !fileName) {
      return
    }

    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = fileName
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(clampPage(page, pageCount))
    },
    [pageCount],
  )

  const goToPreviousPage = () => {
    goToPage(currentPage - 1)
  }

  const goToNextPage = () => {
    goToPage(currentPage + 1)
  }

  const activeError = fileReadError ?? loadError

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__brand">
          <div className="app-header__logo" aria-hidden="true">
            N
          </div>
          <h1 className="app-header__title">Neubus PDF Viewer</h1>
        </div>

        <div className="app-header__file-area">
          <span className="app-header__file-label">Document</span>
          <span
            className={`app-header__file-name${fileName ? '' : ' app-header__file-name--empty'}`}
            title={fileName ?? undefined}
          >
            {fileName ?? 'No file selected'}
          </span>
        </div>

        <div className="app-header__actions">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="app-header__file-input"
            onChange={handleHeaderFileChange}
            aria-label="Open PDF file"
          />
          <button type="button" className="btn btn--ghost" onClick={openFilePicker}>
            Open PDF
          </button>
          <button
            type="button"
            className="btn btn--primary"
            disabled={!hasDocument}
            onClick={handleQuickDownload}
          >
            Quick Download
          </button>
        </div>
      </header>

      {activeError && (
        <div className="app-error-banner" role="alert">
          {activeError}
        </div>
      )}

      <div className="app-workspace">
        <div className="app-sidebar">
          <PageThumbnailList
            pdfDoc={pdfDoc}
            pageCount={pageCount}
            currentPage={currentPage}
            onPageSelect={goToPage}
          />
        </div>

        <main className="app-main">
          <ViewerToolbar
            disabled={!hasDocument}
            currentPage={currentPage}
            pageCount={pageCount}
            zoomPercent={Math.round(scale * 100)}
            viewMode={viewMode}
            isEditMode={isEditMode}
            onPreviousPage={goToPreviousPage}
            onNextPage={goToNextPage}
            onPageChange={goToPage}
            onViewModeChange={setViewMode}
            onToggleEditMode={() => setIsEditMode((value) => !value)}
          />
          <PdfViewer
            fileName={fileName}
            pdfBytes={pdfBytes}
            currentPage={currentPage}
            viewMode={viewMode}
            scale={scale}
            onFileSelect={handleFileSelect}
            onDocumentStateChange={handleDocumentStateChange}
          />
        </main>

        <aside className="app-edit-panel" aria-label="Edit mode panel">
          <EditorToolbar disabled={!hasDocument || !isEditMode} />

          <div className="edit-panel__header">
            <h2 className="edit-panel__title">Edit mode</h2>
            <p className="edit-panel__subtitle">
              {isEditMode
                ? 'Page editing tools will appear here.'
                : 'Enable edit mode from the viewer toolbar to modify pages.'}
            </p>
          </div>

          <div className="edit-panel__body">
            <div className="edit-panel__placeholder">
              <p className="edit-panel__placeholder-title">Editor panel placeholder</p>
              <p className="edit-panel__placeholder-text">
                This area will host page operations such as rotate, reorder, delete,
                import, extract, and export once editing is implemented.
              </p>
              <ul className="edit-panel__tool-list">
                <li>Rotate selected pages</li>
                <li>Reorder and delete pages</li>
                <li>Import or extract pages</li>
                <li>Export edited PDF</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default App
