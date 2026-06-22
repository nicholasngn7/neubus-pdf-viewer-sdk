type ViewerToolbarProps = {
  disabled?: boolean
  currentPage?: number
  pageCount?: number
  zoomPercent?: number
  isEditMode?: boolean
  onToggleEditMode?: () => void
}

export default function ViewerToolbar({
  disabled = true,
  currentPage = 1,
  pageCount = 0,
  zoomPercent = 100,
  isEditMode = false,
  onToggleEditMode,
}: ViewerToolbarProps) {
  return (
    <div className="viewer-toolbar" role="toolbar" aria-label="Viewer controls">
      <div className="toolbar-group" aria-label="Page navigation">
        <button type="button" className="toolbar-btn" disabled={disabled} title="Previous page">
          ‹
        </button>
        <span className="toolbar-label">
          {disabled ? '— / —' : `${currentPage} / ${pageCount}`}
        </span>
        <button type="button" className="toolbar-btn" disabled={disabled} title="Next page">
          ›
        </button>
      </div>

      <div className="toolbar-group" aria-label="Zoom controls">
        <button type="button" className="toolbar-btn" disabled={disabled} title="Zoom out">
          −
        </button>
        <span className="toolbar-label">{disabled ? '—%' : `${zoomPercent}%`}</span>
        <button type="button" className="toolbar-btn" disabled={disabled} title="Zoom in">
          +
        </button>
        <button type="button" className="toolbar-btn" disabled={disabled} title="Fit to width">
          Fit width
        </button>
        <button type="button" className="toolbar-btn" disabled={disabled} title="Fit to page">
          Fit page
        </button>
      </div>

      <div className="toolbar-group" aria-label="View mode">
        <button
          type="button"
          className="toolbar-btn is-active"
          disabled={disabled}
          title="Continuous scroll"
        >
          Continuous
        </button>
        <button type="button" className="toolbar-btn" disabled={disabled} title="Single page">
          Single
        </button>
      </div>

      <div className="toolbar-spacer" />

      <div className="toolbar-group">
        <button
          type="button"
          className={`toolbar-btn${isEditMode ? ' is-active' : ''}`}
          disabled={disabled}
          onClick={onToggleEditMode}
          title="Toggle edit mode"
        >
          {isEditMode ? 'View mode' : 'Edit mode'}
        </button>
      </div>
    </div>
  )
}
