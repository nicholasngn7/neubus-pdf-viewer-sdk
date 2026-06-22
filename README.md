# Neubus PDF Viewer SDK MVP

A timeboxed browser-based PDF viewer/editor MVP built for the Neubus Staff Software Engineer exercise.

This project is inspired by the provided demo video, which appears to show a document/PDF viewer embedded inside a larger records or document-management application. For this MVP, I focused on the reusable PDF viewer/editor boundary rather than rebuilding the full parent records application.

## Repository Structure

```text
.
├── A/   # Working MVP web app
├── B/   # Architecture and design documentation
└── C/   # Cursor AI usage log and validation notes
```

## Tech Stack

* React
* TypeScript
* Vite
* PDF.js / `pdfjs-dist` for browser PDF rendering
* `pdf-lib` for PDF editing/export operations

## Run Locally

```bash
cd A
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Implemented Features

### PDF Viewing and Navigation

* Upload/open a local PDF
* Render PDF pages in the browser
* Page navigation
* Zoom in / zoom out
* Fit-to-width
* Fit-to-viewport
* Continuous viewing mode
* Single-page viewing mode

### PDF Editing

* Edit mode with document/page controls
* Page selection
* Rotate selected pages left/right
* Reorder pages
* Delete selected pages
* Import/merge another PDF
* Extract selected pages
* Export/download edited PDF

### Printing and Export

* Browser print action
* Download current/edited PDF locally
* Download extracted pages as a new PDF

## Inferred Requirements from Demo

The provided demo appears to show a PDF/document viewer integrated into a larger client application. The surrounding application owns search results, records, attachments, metadata, upload history, authentication, and backend persistence.

This MVP focuses on the viewer/editor module that such a host application could embed. The viewer/editor owns document rendering, navigation, page-level editing, print, download/export, and save handoff.

## Intentional Scope Boundaries

This MVP does not implement:

* Full records/search application
* Backend upload API
* Authentication or authorization
* Database persistence
* OCR
* Scan integration
* Production redaction workflow
* Signature form fields
* Bookmark read/write
* True WebAssembly-backed PDF SDK rendering
* Full linearized PDF byte-range streaming demo

Linearized loading is documented as a production consideration. Because this MVP loads local files in the browser, true HTTP byte-range streaming is not fully demonstrable without a server-hosted linearized PDF and range-request support.

## Documentation

Additional documentation is included in:

```text
B/architecture.md
C/cursor-plan.md
C/cursor-transcript.md
C/ai-change-log.md
C/validation.md
```

## Validation

Validation notes are documented in:

```text
C/validation.md
```

The validation checklist covers local setup, PDF upload, rendering, navigation, zoom controls, view modes, edit mode, page operations, export/download, print, and error handling.

## If I Had One More Day

With one additional day, I would focus on:

* Improving thumbnail rendering and selection performance for large documents
* Adding undo/redo for page operations
* Improving accessibility for toolbar actions and keyboard navigation
* Adding better drag-and-drop page reordering
* Adding server-backed PDF loading to demonstrate linearized/range-based loading
* Adding automated tests for document operations
* Evaluating a WebAssembly-backed PDF SDK for higher-fidelity rendering and advanced annotation support
* Expanding the save/upload handoff contract for integration with a host records application
