import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'

type PdfViewerProps = {
  fileName: string | null
  onFileSelect: (file: File) => void
}

export default function PdfViewer({ fileName, onFileSelect }: PdfViewerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

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

      <div className="pdf-viewer__canvas-area">
        {!fileName ? (
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
        ) : (
          <div className="pdf-viewer__page-shell" role="img" aria-label={`Preview of ${fileName}`}>
            PDF rendering will appear here
          </div>
        )}
      </div>
    </section>
  )
}
