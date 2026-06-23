type EditorPanelProps = {
  disabled?: boolean
  isEditMode?: boolean
  selectedCount?: number
  pageCount?: number
  isDirty?: boolean
  isBusy?: boolean
  statusMessage?: string | null
  statusError?: string | null
  onMoveUp?: () => void
  onMoveDown?: () => void
  onExport?: () => void
}

export default function EditorPanel({
  disabled = true,
  isEditMode = false,
  selectedCount = 0,
  pageCount = 0,
  isDirty = false,
  isBusy = false,
  statusMessage = null,
  statusError = null,
  onMoveUp,
  onMoveDown,
  onExport,
}: EditorPanelProps) {
  const canMove = !disabled && selectedCount > 0 && pageCount > 1

  return (
    <>
      <div className="edit-panel__header">
        <h2 className="edit-panel__title">Edit mode</h2>
        <p className="edit-panel__subtitle">
          {isEditMode
            ? 'Select pages in the rail, then use the toolbar or controls below.'
            : 'Enable edit mode from the viewer toolbar to modify pages.'}
        </p>
      </div>

      <div className="edit-panel__body">
        {!isEditMode ? (
          <div className="edit-panel__placeholder">
            <p className="edit-panel__placeholder-title">Page editor</p>
            <p className="edit-panel__placeholder-text">
              Turn on edit mode to rotate, reorder, delete, import, extract, and export pages.
            </p>
          </div>
        ) : (
          <>
            <div className="edit-panel__section">
              <p className="edit-panel__meta">
                {selectedCount} of {pageCount} page{pageCount === 1 ? '' : 's'} selected
                {isDirty ? ' · Unsaved edits' : ''}
              </p>
            </div>

            <div className="edit-panel__section">
              <h3 className="edit-panel__section-title">Reorder</h3>
              <div className="edit-panel__button-row">
                <button
                  type="button"
                  className="btn btn--secondary"
                  disabled={!canMove || isBusy}
                  onClick={onMoveUp}
                >
                  Move Up
                </button>
                <button
                  type="button"
                  className="btn btn--secondary"
                  disabled={!canMove || isBusy}
                  onClick={onMoveDown}
                >
                  Move Down
                </button>
              </div>
              <p className="edit-panel__hint">
                Moves the selected page block one position at a time.
              </p>
            </div>

            <div className="edit-panel__section">
              <h3 className="edit-panel__section-title">Export</h3>
              <button
                type="button"
                className="btn btn--primary edit-panel__export-btn"
                disabled={disabled || isBusy}
                onClick={onExport}
              >
                Download Edited PDF
              </button>
              <p className="edit-panel__hint">
                Exports the current page order, rotations, deletions, and imported pages.
              </p>
            </div>

            {(statusMessage || statusError) && (
              <div
                className={`edit-panel__status${statusError ? ' edit-panel__status--error' : ''}`}
                role={statusError ? 'alert' : 'status'}
              >
                {statusError ?? statusMessage}
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
