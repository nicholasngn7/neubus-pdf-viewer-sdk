import type { PDFDocumentProxy } from 'pdfjs-dist'
import PageCanvas from './PageCanvas'

type PageThumbnailListProps = {
  pdfDoc?: PDFDocumentProxy | null
  pageCount?: number
  currentPage?: number
  onPageSelect?: (page: number) => void
}

const THUMBNAIL_SCALE = 0.18

export default function PageThumbnailList({
  pdfDoc = null,
  pageCount = 0,
  currentPage = 1,
  onPageSelect,
}: PageThumbnailListProps) {
  const hasDocument = pageCount > 0 && pdfDoc !== null

  return (
    <aside className="thumbnail-list" aria-label="Page thumbnails">
      <div className="thumbnail-list__header">Pages</div>
      <div className="thumbnail-list__body">
        {!hasDocument ? (
          <p className="thumbnail-list__empty">
            Open a PDF to see page thumbnails.
          </p>
        ) : (
          Array.from({ length: pageCount }, (_, index) => {
            const pageNumber = index + 1
            const isActive = pageNumber === currentPage

            return (
              <button
                key={pageNumber}
                type="button"
                className={`thumbnail-item${isActive ? ' is-active' : ''}`}
                onClick={() => onPageSelect?.(pageNumber)}
                aria-label={`Page ${pageNumber}`}
                aria-current={isActive ? 'page' : undefined}
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
