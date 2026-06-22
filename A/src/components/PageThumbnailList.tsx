type PageThumbnailListProps = {
  pageCount?: number
  currentPage?: number
  onPageSelect?: (page: number) => void
}

export default function PageThumbnailList({
  pageCount = 0,
  currentPage = 1,
  onPageSelect,
}: PageThumbnailListProps) {
  const hasDocument = pageCount > 0

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
                <div className="thumbnail-item__preview" aria-hidden="true" />
                <span className="thumbnail-item__label">{pageNumber}</span>
              </button>
            )
          })
        )}
      </div>
    </aside>
  )
}
