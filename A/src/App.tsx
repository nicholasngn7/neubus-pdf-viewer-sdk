import { useCallback, useRef, useState, type ChangeEvent } from 'react'
import EditorToolbar from './components/EditorToolbar'
import PageThumbnailList from './components/PageThumbnailList'
import PdfViewer from './components/PdfViewer'
import ViewerToolbar from './components/ViewerToolbar'
import './App.css'

function App() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [pageCount, setPageCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [isEditMode, setIsEditMode] = useState(false)

  const hasDocument = fileName !== null

  const handleFileSelect = useCallback((file: File) => {
    const isPdf =
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')

    if (!isPdf) {
      window.alert('Please select a PDF file.')
      return
    }

    setFileName(file.name)
    setPageCount(1)
    setCurrentPage(1)
    setIsEditMode(false)
  }, [])

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  const handleHeaderFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
    event.target.value = ''
  }

  const handleQuickDownload = () => {
    if (!hasDocument) {
      return
    }
    window.alert('Quick Download will be available once PDF export is implemented.')
  }

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
            className={`app-header__file-name${hasDocument ? '' : ' app-header__file-name--empty'}`}
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

      <div className="app-workspace">
        <div className="app-sidebar">
          <PageThumbnailList
            pageCount={pageCount}
            currentPage={currentPage}
            onPageSelect={setCurrentPage}
          />
        </div>

        <main className="app-main">
          <ViewerToolbar
            disabled={!hasDocument}
            currentPage={currentPage}
            pageCount={pageCount}
            isEditMode={isEditMode}
            onToggleEditMode={() => setIsEditMode((value) => !value)}
          />
          <PdfViewer fileName={fileName} onFileSelect={handleFileSelect} />
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
