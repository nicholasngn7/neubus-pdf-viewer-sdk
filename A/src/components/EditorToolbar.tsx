type EditorToolbarProps = {
  disabled?: boolean
  disableSelectionActions?: boolean
  onRotateLeft?: () => void
  onRotateRight?: () => void
  onDelete?: () => void
  onImport?: () => void
  onExtract?: () => void
}

export default function EditorToolbar({
  disabled = true,
  disableSelectionActions = true,
  onRotateLeft,
  onRotateRight,
  onDelete,
  onImport,
  onExtract,
}: EditorToolbarProps) {
  const pageActionDisabled = disabled || disableSelectionActions

  return (
    <div className="editor-toolbar" role="toolbar" aria-label="Editor controls">
      <div className="toolbar-group" aria-label="Page operations">
        <button
          type="button"
          className="toolbar-btn"
          disabled={pageActionDisabled}
          title="Rotate left"
          onClick={onRotateLeft}
        >
          ↺
        </button>
        <button
          type="button"
          className="toolbar-btn"
          disabled={pageActionDisabled}
          title="Rotate right"
          onClick={onRotateRight}
        >
          ↻
        </button>
        <button
          type="button"
          className="toolbar-btn"
          disabled={pageActionDisabled}
          title="Delete selected pages"
          onClick={onDelete}
        >
          Delete
        </button>
      </div>

      <div className="toolbar-group" aria-label="Document operations">
        <button
          type="button"
          className="toolbar-btn"
          disabled={disabled}
          title="Import and append another PDF"
          onClick={onImport}
        >
          Import
        </button>
        <button
          type="button"
          className="toolbar-btn"
          disabled={pageActionDisabled}
          title="Extract selected pages"
          onClick={onExtract}
        >
          Extract
        </button>
      </div>
    </div>
  )
}
