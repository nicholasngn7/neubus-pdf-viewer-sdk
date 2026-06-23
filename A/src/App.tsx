import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import EditorPanel from './components/EditorPanel'
import EditorToolbar from './components/EditorToolbar'
import PageThumbnailList from './components/PageThumbnailList'
import PdfViewer from './components/PdfViewer'
import StatusToast from './components/StatusToast'
import ViewerToolbar from './components/ViewerToolbar'
import { usePdfEditor } from './hooks/usePdfEditor'
import { useViewerZoom } from './hooks/useViewerZoom'
import type { PdfDocumentState } from './hooks/usePdfFromBytes'
import { MESSAGES } from './lib/messages'
import { isPdfFile } from './lib/validation/isPdfFile'
import type { ViewMode } from './types/pdf'
import './App.css'

const initialDocumentState: PdfDocumentState = {
  pdfDoc: null,
  pageCount: 0,
  loadStatus: 'idle',
  loadError: null,
}

function App() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const importInputRef = useRef<HTMLInputElement>(null)
  const canvasAreaRef = useRef<HTMLDivElement>(null)

  const editor = usePdfEditor()
  const {
    fileName,
    pdfBytes,
    pageCount: editorPageCount,
    selectedPages,
    status: editorStatus,
    isDirty,
    openFile,
    resetEditor,
    clearSelection,
    togglePageSelection,
    rotateSelected,
    deleteSelected,
    moveSelected,
    importPdf,
    extractSelected,
    exportEdited,
    downloadCurrent,
    printCurrent,
    clampPage,
  } = editor

  const [fileReadError, setFileReadError] = useState<string | null>(null)
  const [appError, setAppError] = useState<string | null>(null)
  const [successToast, setSuccessToast] = useState<string | null>(null)
  const [documentState, setDocumentState] = useState<PdfDocumentState>(initialDocumentState)
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<ViewMode>('continuous')
  const [isEditMode, setIsEditMode] = useState(false)

  const { pdfDoc, pageCount: viewerPageCount, loadStatus, loadError } = documentState
  const pageCount = viewerPageCount || editorPageCount
  const hasDocument = editorPageCount > 0 && (loadStatus === 'ready' || loadStatus === 'loading')

  const {
    zoomScale,
    zoomPercent,
    resetZoom,
    handleZoomIn,
    handleZoomOut,
    handleFitWidth,
    handleFitPage,
  } = useViewerZoom({
    canvasAreaRef,
    pdfDoc,
    currentPage,
    hasDocument,
  })
  const editorDisabled = !hasDocument || !isEditMode || editorStatus.isBusy
  const selectionRequired = selectedPages.size === 0

  useEffect(() => {
    setCurrentPage((page) => clampPage(page, editorPageCount))
  }, [clampPage, editorPageCount])

  useEffect(() => {
    if (editorStatus.message && !editorStatus.error) {
      setSuccessToast(editorStatus.message)
    }
  }, [editorStatus.message, editorStatus.error])

  const clearTransientErrors = () => {
    setFileReadError(null)
    setAppError(null)
  }

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (!isPdfFile(file)) {
        clearTransientErrors()
        setFileReadError(MESSAGES.invalidFile(file.name))
        return
      }

      clearTransientErrors()
      setDocumentState(initialDocumentState)
      setIsEditMode(false)
      resetZoom()

      try {
        const bytes = await file.arrayBuffer()
        await openFile(file.name, bytes)
        setCurrentPage(1)
      } catch (error) {
        const message =
          error instanceof Error ? error.message : MESSAGES.readFailed
        resetEditor()
        setFileReadError(MESSAGES.loadFailed(message))
        setDocumentState({
          pdfDoc: null,
          pageCount: 0,
          loadStatus: 'error',
          loadError: MESSAGES.loadFailed(message),
        })
      }
    },
    [openFile, resetEditor, resetZoom],
  )

  const handleDocumentStateChange = useCallback(
    (state: PdfDocumentState) => {
      setDocumentState(state)
      setCurrentPage((page) => clampPage(page, state.pageCount || editorPageCount))
    },
    [clampPage, editorPageCount],
  )

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  const openImportPicker = () => {
    importInputRef.current?.click()
  }

  const handleHeaderFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      void handleFileSelect(file)
    }
    event.target.value = ''
  }

  const handleImportFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    if (!isPdfFile(file)) {
      setAppError(MESSAGES.invalidFile(file.name))
      event.target.value = ''
      return
    }

    clearTransientErrors()
    void file.arrayBuffer().then((bytes) => importPdf(bytes))
    event.target.value = ''
  }

  const handleToggleEditMode = () => {
    setIsEditMode((value) => {
      if (value) {
        clearSelection()
      }
      return !value
    })
  }

  const handlePageSelect = (page: number) => {
    setCurrentPage(clampPage(page, pageCount))
  }

  const handlePageToggleSelect = (page: number) => {
    togglePageSelection(page)
  }

  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(clampPage(page, pageCount))
    },
    [clampPage, pageCount],
  )

  const goToPreviousPage = () => {
    goToPage(currentPage - 1)
  }

  const goToNextPage = () => {
    goToPage(currentPage + 1)
  }

  const runEditorAction = (action: () => Promise<void>) => {
    void action().catch(() => {
      // Errors are surfaced through editor status state.
    })
  }

  const activeError = fileReadError ?? loadError ?? editorStatus.error ?? appError

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
            {isDirty ? ' (edited)' : ''}
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
          <input
            ref={importInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="app-header__file-input"
            onChange={handleImportFileChange}
            aria-label="Import PDF file"
          />
          <button type="button" className="btn btn--ghost" onClick={openFilePicker}>
            Open PDF
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            disabled={!hasDocument || editorStatus.isBusy}
            onClick={() => runEditorAction(printCurrent)}
          >
            Print
          </button>
          <button
            type="button"
            className="btn btn--primary"
            disabled={!hasDocument || editorStatus.isBusy}
            onClick={() => runEditorAction(downloadCurrent)}
          >
            Quick Download
          </button>
        </div>
      </header>

      {successToast && (
        <StatusToast
          message={successToast}
          variant="success"
          onDismiss={() => setSuccessToast(null)}
        />
      )}

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
            selectedPages={selectedPages}
            isEditMode={isEditMode}
            onPageSelect={handlePageSelect}
            onPageToggleSelect={handlePageToggleSelect}
          />
        </div>

        <main className="app-main">
          <ViewerToolbar
            disabled={!hasDocument}
            currentPage={currentPage}
            pageCount={pageCount}
            zoomPercent={zoomPercent}
            viewMode={viewMode}
            isEditMode={isEditMode}
            onPreviousPage={goToPreviousPage}
            onNextPage={goToNextPage}
            onPageChange={goToPage}
            onViewModeChange={setViewMode}
            onToggleEditMode={handleToggleEditMode}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onFitWidth={() => void handleFitWidth()}
            onFitPage={() => void handleFitPage()}
          />
          <PdfViewer
            fileName={fileName}
            pdfBytes={pdfBytes}
            currentPage={currentPage}
            viewMode={viewMode}
            scale={zoomScale}
            canvasAreaRef={canvasAreaRef}
            onFileSelect={handleFileSelect}
            onDocumentStateChange={handleDocumentStateChange}
          />
        </main>

        <aside className="app-edit-panel" aria-label="Edit mode panel">
          <EditorToolbar
            disabled={editorDisabled}
            disableSelectionActions={selectionRequired}
            onRotateLeft={() => runEditorAction(() => rotateSelected('left'))}
            onRotateRight={() => runEditorAction(() => rotateSelected('right'))}
            onDelete={() => runEditorAction(deleteSelected)}
            onImport={openImportPicker}
            onExtract={() => runEditorAction(extractSelected)}
          />

          <EditorPanel
            disabled={editorDisabled}
            disableSelectionActions={selectionRequired}
            isEditMode={isEditMode}
            selectedCount={selectedPages.size}
            pageCount={pageCount}
            isDirty={isDirty}
            isBusy={editorStatus.isBusy}
            statusMessage={editorStatus.message}
            statusError={editorStatus.error}
            onMoveUp={() => runEditorAction(() => moveSelected('up'))}
            onMoveDown={() => runEditorAction(() => moveSelected('down'))}
            onExport={() => runEditorAction(exportEdited)}
            onPrint={() => runEditorAction(printCurrent)}
          />
        </aside>
      </div>
    </div>
  )
}

export default App
