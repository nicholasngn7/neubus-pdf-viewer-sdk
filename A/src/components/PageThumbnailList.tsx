import type { PDFDocumentProxy } from 'pdfjs-dist'
import PageCanvas from './PageCanvas'

type PageThumbnailListProps = {
  pdfDoc?: PDFDocumentProxy | null
  pageCount?: number
  currentPage?: number
  selectedPages?: Set<number>
  isEditMode?: boolean
  onPageSelect?: (page: number) => void
  onPageToggleSelect?: (page: number) => void
}

const THUMBNAIL_SCALE = 0.18

export default function PageThumbnailList({
  pdfDoc = null,
  pageCount = 0,
  currentPage = 1,
  selectedPages = new Set<number>(),
  isEditMode = false,
  onPageSelect,
  onPageToggleSelect,
}: PageThumbnailListProps) {
  const hasDocument = pageCount > 0 && pdfDoc !== null

  const handleClick = (pageNumber: number) => {
    onPageSelect?.(pageNumber)

    if (isEditMode) {
      onPageToggleSelect?.(pageNumber)
    }
  }

  return (
    <aside className="thumbnail-list" aria-label="Page thumbnails">
      <div className="thumbnail-list__header">
        Pages
        {isEditMode && hasDocument && (
          <span className="thumbnail-list__hint">Click to select</span>
        )}
      </div>
      <div className="thumbnail-list__body">
        {!hasDocument ? (
          <p className="thumbnail-list__empty">
            Open a PDF to see page thumbnails.
          </p>
        ) : (
          Array.from({ length: pageCount }, (_, index) => {
            const pageNumber = index + 1
            const isActive = pageNumber === currentPage
            const isSelected = selectedPages.has(pageNumber)

            return (
              <button
                key={`page-${pageNumber}`}
                type="button"
                className={`thumbnail-item${isActive ? ' is-active' : ''}${isSelected ? ' is-selected' : ''}`}
                onClick={() => handleClick(pageNumber)}
                aria-label={`Page ${pageNumber}${isSelected ? ', selected' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                aria-pressed={isEditMode ? isSelected : undefined}
              >
                <div className="thumbnail-item__preview">
                  <PageCanvas
                    pdfDoc={pdfDoc}
                    pageNumber={pageNumber}
                    scale={THUMBNAIL_SCALE}
                    className="thumbnail-item__canvas"
                  />
                </div>
                <span className="thumbnail-item__label">{pageNumber}</span>
              </button>
            )
          })
        )}
      </div>
    </aside>
  )
}
