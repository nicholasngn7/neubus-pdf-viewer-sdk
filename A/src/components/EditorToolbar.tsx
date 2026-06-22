type EditorToolbarProps = {
  disabled?: boolean
}

export default function EditorToolbar({ disabled = true }: EditorToolbarProps) {
  return (
    <div className="editor-toolbar" role="toolbar" aria-label="Editor controls">
      <div className="toolbar-group" aria-label="Page operations">
        <button type="button" className="toolbar-btn" disabled={disabled} title="Rotate left">
          ↺
        </button>
        <button type="button" className="toolbar-btn" disabled={disabled} title="Rotate right">
          ↻
        </button>
        <button type="button" className="toolbar-btn" disabled={disabled} title="Delete page">
          Delete
        </button>
      </div>

      <div className="toolbar-group" aria-label="Document operations">
        <button type="button" className="toolbar-btn" disabled={disabled} title="Import pages">
          Import
        </button>
        <button type="button" className="toolbar-btn" disabled={disabled} title="Extract pages">
          Extract
        </button>
      </div>
    </div>
  )
}
