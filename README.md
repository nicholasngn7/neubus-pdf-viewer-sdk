# Neubus PDF Viewer SDK MVP

A timeboxed browser-based PDF viewer/editor MVP built for the Neubus Staff Software Engineer exercise.

This project is inspired by the provided demo video, which appears to show a document/PDF viewer embedded inside a larger records or document-management application. For this MVP, I focused on the reusable PDF viewer/editor boundary rather than rebuilding the full parent records application.

## Repository Structure

```text
.
├── A/   # MVP app (React + TypeScript + Vite)
├── B/   # Architecture and design documentation
└── C/   # Cursor usage log and validation notes
```

## Tech Stack

- React, TypeScript, Vite
- `pdfjs-dist` (PDF.js) for browser PDF rendering
- `pdf-lib` for page-level editing and export

## Setup

```bash
cd A
npm install
npm run dev
```

Open the local Vite URL shown in the terminal.

## Build and Tests

From `A/`:

```bash
npm run build
npm run test:run
```

The Vitest suite (38 tests across 10 files) covers app shell behavior, toolbar wiring, editor helpers, zoom scale math, and in-memory pdf-lib rebuild logic. It does **not** validate PDF.js canvas output, exported file contents in an external viewer, or the browser print dialog.

## Implemented Features

These features are implemented in `A/` and documented in `C/validation.md`. PDF rendering, zoom/fit sizing, export file opening, and print require **manual** browser validation.

### Viewing

- Local PDF upload (header button or viewer dropzone)
- PDF.js canvas rendering in the browser
- Page navigation (previous/next, page input, thumbnail rail)
- Zoom in / out (25%–300%; toolbar percentage reflects render scale)
- Fit to width (scales current page to viewer width)
- Fit page (fit to viewport; toolbar label is “Fit page”)
- Continuous mode (all pages stacked)
- Single-page mode

### Editing

- Edit mode toggle
- Multi-select page thumbnails
- Rotate selected pages
- Reorder pages (Move Up / Move Down; not drag-and-drop)
- Delete selected pages
- Import / merge another PDF (appends all pages)
- Extract selected pages to a new PDF download

### Export and print

- Export / download edited PDF (editor panel)
- Quick Download (header; edited PDF when dirty, otherwise original)
- Browser print (iframe/blob print flow)

## Not Implemented

This MVP intentionally does **not** include:

- WebAssembly-backed PDF rendering
- True linearized byte-range HTTP loading demo (local `ArrayBuffer` only)
- Backend upload API
- Authentication or authorization
- Database persistence
- OCR or scan integration
- Redaction or text annotation workflows
- Digital signatures
- Bookmark read/write
- In-document text search
- Full records/search host application

Linearized loading is noted in `B/architecture.md` as a production consideration; demonstrating byte-range streaming would require a server-hosted PDF and range-request support.

## Documentation

| Path | Purpose |
| --- | --- |
| `B/architecture.md` | System design, tradeoffs, limitations |
| `C/cursor-plan.md` | Cursor planning notes |
| `C/ai-change-log.md` | AI-assisted change log |
| `C/validation.md` | Validation checklist and manual test script |

## Validation

See `C/validation.md` for the full checklist. Automated tests complement manual checks for rendering fidelity, zoom/fit appearance, exported PDFs opened externally, and the native print dialog.

## If I Had One More Day

- Undo/redo for page operations
- Virtualized thumbnails and continuous scroll for large documents
- Drag-and-drop page reordering
- Server-hosted PDF loading to demonstrate linearized/range-based streaming
- Stronger toolbar accessibility and keyboard navigation
- Host-app save/upload handoff contract for records integration
