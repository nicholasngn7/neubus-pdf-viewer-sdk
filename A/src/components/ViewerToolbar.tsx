import { useEffect, useState } from 'react'
import type { ViewMode } from '../types/pdf'

type ViewerToolbarProps = {
  disabled?: boolean
  currentPage?: number
  pageCount?: number
  zoomPercent?: number
  viewMode?: ViewMode
  isEditMode?: boolean
  onPreviousPage?: () => void
  onNextPage?: () => void
  onPageChange?: (page: number) => void
  onViewModeChange?: (mode: ViewMode) => void
  onToggleEditMode?: () => void
  onZoomIn?: () => void
  onZoomOut?: () => void
  onFitWidth?: () => void
  onFitPage?: () => void
}

export default function ViewerToolbar({
  disabled = true,
  currentPage = 1,
  pageCount = 0,
  zoomPercent = 100,
  viewMode = 'continuous',
  isEditMode = false,
  onPreviousPage,
  onNextPage,
  onPageChange,
  onViewModeChange,
  onToggleEditMode,
  onZoomIn,
  onZoomOut,
  onFitWidth,
  onFitPage,
}: ViewerToolbarProps) {
  const [pageInput, setPageInput] = useState(String(currentPage))

  useEffect(() => {
    setPageInput(String(currentPage))
  }, [currentPage])

  const commitPageInput = () => {
    const parsed = Number.parseInt(pageInput, 10)
    if (Number.isNaN(parsed)) {
      setPageInput(String(currentPage))
      return
    }
    onPageChange?.(parsed)
  }

  return (
    <div className="viewer-toolbar" role="toolbar" aria-label="Viewer controls">
      <div className="toolbar-group" aria-label="Page navigation">
        <button
          type="button"
          className="toolbar-btn"
          disabled={disabled || currentPage <= 1}
          title="Previous page"
          onClick={onPreviousPage}
        >
          ‹
        </button>
        <label className="toolbar-page-input-wrap">
          <span className="visually-hidden">Current page</span>
          <input
            type="number"
            className="toolbar-page-input"
            min={1}
            max={pageCount || 1}
            value={disabled ? '' : pageInput}
            disabled={disabled}
            onChange={(event) => setPageInput(event.target.value)}
            onBlur={commitPageInput}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                commitPageInput()
              }
            }}
            aria-label="Current page"
          />
        </label>
        <span className="toolbar-label">
          {disabled ? '— / —' : `/ ${pageCount}`}
        </span>
        <button
          type="button"
          className="toolbar-btn"
          disabled={disabled || currentPage >= pageCount}
          title="Next page"
          onClick={onNextPage}
        >
          ›
        </button>
      </div>

      <div className="toolbar-group" aria-label="Zoom controls">
        <button
          type="button"
          className="toolbar-btn"
          disabled={disabled}
          title="Zoom out"
          onClick={onZoomOut}
        >
          −
        </button>
        <span className="toolbar-label">{disabled ? '—%' : `${zoomPercent}%`}</span>
        <button
          type="button"
          className="toolbar-btn"
          disabled={disabled}
          title="Zoom in"
          onClick={onZoomIn}
        >
          +
        </button>
        <button
          type="button"
          className="toolbar-btn"
          disabled={disabled}
          title="Fit to width"
          onClick={onFitWidth}
        >
          Fit width
        </button>
        <button
          type="button"
          className="toolbar-btn"
          disabled={disabled}
          title="Fit page (fit to viewport)"
          onClick={onFitPage}
        >
          Fit page
        </button>
      </div>

      <div className="toolbar-group" aria-label="View mode">
        <button
          type="button"
          className={`toolbar-btn${viewMode === 'continuous' ? ' is-active' : ''}`}
          disabled={disabled}
          title="Continuous scroll"
          onClick={() => onViewModeChange?.('continuous')}
        >
          Continuous
        </button>
        <button
          type="button"
          className={`toolbar-btn${viewMode === 'single' ? ' is-active' : ''}`}
          disabled={disabled}
          title="Single page"
          onClick={() => onViewModeChange?.('single')}
        >
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
