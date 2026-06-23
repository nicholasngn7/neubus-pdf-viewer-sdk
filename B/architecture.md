# Neubus PDF Viewer SDK — Architecture

## 1. Overview

This repository contains a timeboxed, client-only PDF viewer/editor MVP built with React, TypeScript, and Vite. The app under `A/` lets a user open a local PDF, view it in the browser, perform basic page-level edits, and print or download the result.

Rendering uses **pdfjs-dist** (PDF.js). Editing and export use **pdf-lib**. The MVP is designed as an embeddable module that a larger records or document-management application could host, not as a full records product.

## 2. Inferred Requirements from the Incomplete Demo Video

The provided demo appears to show a PDF viewer embedded inside a larger application. From that context, the following requirements were inferred:

| Inferred from demo | MVP status |
| --- | --- |
| Open/view a PDF attachment | Implemented (local file upload) |
| Page navigation and thumbnails | Implemented |
| Zoom and fit controls | Implemented (see limitations for manual validation) |
| Continuous and single-page viewing | Implemented |
| Edit mode with page manipulation | Implemented |
| Rotate, reorder, delete pages | Implemented |
| Import/merge another document | Implemented |
| Extract pages | Implemented |
| Download/export edited PDF | Implemented |
| Print | Implemented (browser print via iframe/blob) |
| Search within records application | Out of scope (host app) |
| Attachment metadata, upload history | Out of scope (host app) |
| Authentication and backend persistence | Out of scope |

## 3. System Boundary

### Host records / document-management application

The surrounding product (not built in this repo) would typically own:

- Search and search results
- Records and record detail views
- Attachment metadata and upload history
- Authentication and authorization
- Backend storage and APIs
- OCR, scan workflows, redaction, signatures, and bookmark persistence (if required at the platform level)

### Viewer/editor module (`A/`)

This MVP owns:

- Local PDF open/upload (client-only)
- PDF rendering and navigation
- Thumbnail page rail
- Continuous and single-page view modes
- Edit mode with page selection
- Page rotation, reorder (Move Up/Down), delete
- Import/merge (append pages from another local PDF)
- Extract selected pages to a new PDF
- Export/download edited PDF
- Quick Download and Print
- User-visible success and error messaging for common failures

**Save handoff:** Export and Quick Download produce a local file the host app could upload in a future integration. No server upload API is implemented here.

## 4. Architecture Diagram

```text
+------------------------------------------------------------------+
|                         Browser (client-only)                     |
+------------------------------------------------------------------+
|  App.tsx                                                          |
|    |-- Header: Open PDF | Print | Quick Download                 |
|    |-- StatusToast / error banners                                 |
|    |-- usePdfEditor() ............... pdf-lib edit + export state |
|    |-- PdfViewer ── usePdfFromBytes() pdfjs-dist load/render     |
|    |-- PageThumbnailList ── PageCanvas (thumbnails)               |
|    |-- ViewerToolbar (navigation, view mode, edit toggle)          |
|    |-- EditorToolbar + EditorPanel (page ops, export, print)       |
+------------------------------------------------------------------+
         |                              |
         v                              v
+-------------------+          +-------------------+
|   pdfjs-dist      |          |     pdf-lib       |
|   (read/render)   |          | (edit/export)     |
+-------------------+          +-------------------+
| - Web Worker      |          | - buildPdfBytes   |
| - getDocument     |          | - page copy       |
| - page.render     |          | - rotation        |
| - canvas output   |          | - save/download   |
+-------------------+          +-------------------+

Future host app (not in repo):
+------------------------------------------+
| Records UI | Auth | API | DB | Metadata  |
+------------------------------------------+
        | embeds / receives exported PDF
        v
   [ Viewer/editor module ]
```

## 5. Component and Module Responsibilities

| Module | Responsibility |
| --- | --- |
| `App.tsx` | Shell layout, file inputs, coordinates viewer + editor state, success/error banners |
| `PdfViewer.tsx` | Empty/loading/error states; continuous vs single layout; delegates render to `PageCanvas` |
| `PageCanvas.tsx` | Renders one PDF page to `<canvas>` via PDF.js; manages render task cancellation |
| `PageThumbnailList.tsx` | Page rail; selection in edit mode; thumbnail previews |
| `ViewerToolbar.tsx` | Page nav, zoom/fit controls (UI), continuous/single toggle, edit mode toggle |
| `EditorToolbar.tsx` | Rotate, delete, import, extract actions |
| `EditorPanel.tsx` | Move Up/Down, export, print; selection summary and status |
| `StatusToast.tsx` | Dismissible success confirmation |
| `usePdfFromBytes.ts` | Loads PDF.js document from `ArrayBuffer`; exposes load status and page count |
| `usePdfEditor.ts` | Edit session state; applies page ops; rebuilds bytes with pdf-lib |
| `lib/pdfjs/*` | Worker setup, document load, page render helper |
| `lib/pdfLib/buildDocument.ts` | Builds exportable PDF bytes from page model |
| `lib/editor/pageOperations.ts` | Pure functions: rotate, delete, move, extract page lists |
| `lib/editor/selection.ts` | Pure functions: toggle/sort page selection |
| `lib/validation/isPdfFile.ts` | Client-side PDF file validation |
| `lib/fileIO.ts` | Download and print helpers |

## 6. State Management Approach

### What state exists

| State | Examples | Owner |
| --- | --- | --- |
| Document/view | `currentPage`, `viewMode`, `scale`, PDF.js `loadStatus` | `App.tsx` + `usePdfFromBytes` |
| File/edit session | `fileName`, `originalBytes`, `pdfBytes`, `pages[]`, `selectedPages`, `isDirty`, `status` | `usePdfEditor` |
| UI | `isEditMode`, toast message, file read errors | `App.tsx` |

### Where it lives

- **`usePdfEditor`**: authoritative edit model (`PageSource[]` with source bytes, page index, rotation). After each edit, pdf-lib rebuilds `pdfBytes`, which feeds the viewer.
- **`usePdfFromBytes`**: PDF.js `PDFDocumentProxy`, page count, loading/error state derived from `pdfBytes`.
- **`App.tsx`**: wires hooks together, passes props to presentational components.

### Why simple React state is enough for the MVP

- Single user, single document, no concurrent sessions
- No global store or server sync required
- Edit operations are sequential and rebuild the document bytes in one place
- Component tree is shallow; prop drilling is manageable
- Avoids extra dependencies and keeps the timeboxed scope maintainable

A production embed might later add context, Zustand, or host-app-provided state for attachment IDs and save callbacks.

## 7. Key Tradeoffs

| Decision | Choice | Rationale | Cost |
| --- | --- | --- | --- |
| Framework | React + TypeScript + Vite | Fast dev experience, strong typing, familiar hiring stack | No SSR; not relevant for this embed |
| Rendering | pdfjs-dist | Mature browser PDF rendering, canvas-based | Worker setup; render lifecycle must cancel tasks; not WYSIWYG edit of original text |
| Editing/export | pdf-lib | Pure JS, works client-side, good for page ops | Separate parse from PDF.js; rebuild on edit; not a full Acrobat-class editor |
| Deployment | Client-only MVP | Matches exercise scope; no infra | No auth, persistence, or server-side validation |
| Upload | Local `File` / drag-drop only | Simple, demo-ready | No upload history, virus scan, or storage |
| WebAssembly | **Not used** | pdfjs-dist and pdf-lib run without WASM claims in this repo | Less performance headroom for huge docs vs native/WASM SDKs |
| Linearized loading | **Not demonstrated** | Local files use full `ArrayBuffer`; true byte-range streaming needs HTTP range requests + server-hosted linearized PDF | Documented as production consideration only |
| Zoom/fit | `useViewerZoom` + container ref + page viewport math | Fit uses current page dimensions; scale clamped 25%–300% | Fit accuracy depends on container layout (manual check) |
| Reorder | Move Up/Down buttons | Stable MVP without drag-and-drop complexity | Slower UX for large reorder jobs |
| Testing | Vitest + RTL for logic/shell; manual for canvas/print | Automated tests avoid claiming render fidelity | PDF.js canvas and print dialog require manual checks |

### Performance

- Continuous mode renders all pages (acceptable for small/medium docs; large docs would need virtualization).
- Thumbnails render each page at low scale (extra PDF.js work per page).
- Each edit rebuilds the full PDF via pdf-lib and reloads PDF.js.

### Accessibility

- Basic labels and roles on toolbars; page input supports keyboard commit.
- Not audited for WCAG compliance; keyboard shortcuts and focus management are minimal.

## 8. Known Limitations

- **No text search** within the PDF viewer.
- **No annotation or redaction** tools.
- **No form filling, signatures, or bookmarks**.
- **No undo/redo** for edit operations.
- **No backend** upload, authentication, database, or OCR.
- **No WebAssembly** PDF engine in this implementation.
- **No true linearized / byte-range loading** demo (local files only).
- **Reorder** moves one step at a time (edge of selection block), not drag-and-drop.
- **Import** appends all pages from the chosen PDF (no page-range picker).
- **Automated tests** do not validate PDF.js rendering fidelity or the native print dialog.

## 9. If I Had One More Day

1. Add undo/redo for page operations (snapshot `pages[]` or operation log).
2. Virtualize page list and thumbnails for large documents.
3. Improve keyboard navigation and toolbar accessibility (ARIA, focus traps, shortcuts).
4. Add a host-app save callback contract (e.g. `onExport(bytes, fileName)`) for integration testing.
5. Server-hosted PDF loading with HTTP range requests to demonstrate linearized streaming.
6. Expand automated tests around `usePdfEditor` integration (mocked pdf-lib) without claiming canvas fidelity.
7. Evaluate drag-and-drop reorder in the page rail.
