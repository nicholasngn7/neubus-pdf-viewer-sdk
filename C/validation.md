# Validation — Neubus PDF Viewer SDK MVP

This checklist reflects the **actual** state of the MVP in `A/` as of the timeboxed delivery. Items marked **Partial** or **Manual** should not be treated as fully automated or complete product features.

## Commands

Run all commands from the `A/` directory:

```bash
cd A
npm install
npm run dev
npm run build
npm run test:run
```

| Check | Expected result | Status |
| --- | --- | --- |
| `npm install` | Dependencies install without error | Pass |
| `npm run dev` | Vite dev server starts; app loads in browser | Pass |
| `npm run build` | TypeScript + Vite production build succeeds | Pass |
| `npm run test:run` | Vitest suite passes (38 tests) | Pass |

---

## Functional Checklist

| Feature | How to validate | Status | Notes |
| --- | --- | --- | --- |
| PDF upload | Open PDF via header button or viewer dropzone | **Pass** | Local `.pdf` only |
| PDF rendering | Pages appear in viewer after upload | **Pass (manual)** | PDF.js canvas; not covered by automated render fidelity tests |
| Page navigation | Previous/next, page number input, thumbnail click | **Pass** | |
| Zoom in / out | Toolbar `+` / `−` | **Pass (manual)** | Updates PDF.js render scale (25%–300%); percentage reflects actual scale |
| Fit-to-width | Toolbar “Fit width” | **Pass (manual)** | Scales current page to viewer container width (minus padding) |
| Fit-to-page / viewport | Toolbar “Fit page” | **Pass (manual)** | UI label “Fit page”; scales current page to fit visible viewer area |
| Continuous mode | Toolbar “Continuous” | **Pass** | All pages stacked vertically |
| Single-page mode | Toolbar “Single” | **Pass** | Current page only |
| Edit mode | Toolbar “Edit mode” toggle | **Pass** | |
| Page selection | Click thumbnails in edit mode | **Pass** | Multi-select supported |
| Rotate | Editor toolbar ↺ / ↻ on selected pages | **Pass** | Viewer reloads after edit |
| Delete | Editor toolbar Delete | **Pass** | At least one page must remain |
| Reorder | Editor panel Move Up / Move Down | **Pass** | One step at a time; not drag-and-drop |
| Import / merge | Editor Import + choose PDF | **Pass** | Appends all pages from imported file |
| Extract | Editor Extract on selected pages | **Pass (manual)** | Downloads `{name}-extract.pdf`; open file externally |
| Export / download edited PDF | Editor “Download Edited PDF” | **Pass (manual)** | Downloads `{name}-edited.pdf` when dirty |
| Quick Download | Header button | **Pass (manual)** | Edited PDF if dirty; otherwise original upload |
| Print | Header Print or editor “Print Document” | **Pass (manual)** | Opens browser print flow via iframe/blob; dialog not automatable |
| Invalid file handling | Upload `.txt` or non-PDF | **Pass** | Error banner + message; no document loaded |

---

## Explicitly Out of Scope (Not Validated / Not Implemented)

Do **not** expect these in the MVP:

- WebAssembly PDF rendering
- Redaction workflow
- Digital signatures
- Bookmark read/write
- Backend upload API
- Authentication or authorization
- Database persistence
- OCR or scan integration
- True linearized PDF byte-range HTTP streaming
- In-document text search

---

## Validation Strategy

### Automated tests

The Vitest suite (`npm run test:run`) provides confidence for logic and UI shell behavior **without** claiming PDF rendering fidelity or print behavior.

| Area | Test location | What is covered |
| --- | --- | --- |
| App shell smoke | `A/src/App.test.tsx` | Title, Open PDF, Quick Download, invalid file error, valid upload updates filename |
| Toolbar UI | `A/src/components/ViewerToolbar.test.tsx` | Controls present, disabled when empty, handler wiring |
| File validation | `A/src/lib/validation/isPdfFile.test.ts` | PDF vs non-PDF detection |
| Page selection utilities | `A/src/lib/editor/selection.test.ts` | Toggle, sort, select, clear |
| Page operations | `A/src/lib/editor/pageOperations.test.ts` | Rotate, delete, move, extract, invalid moves |
| Rotation math | `A/src/types/edits.test.ts` | Quarter-turn helpers |
| Page clamping | `A/src/lib/navigation/clampPage.test.ts` | Navigation bounds |
| Zoom scale math | `A/src/lib/viewport/zoom.test.ts` | Clamp, step, fit-to-width/page calculations |
| Export naming | `A/src/lib/fileIO.test.ts` | Edited/extract filename helpers |
| pdf-lib rebuild | `A/src/lib/pdfLib/buildDocument.test.ts` | Page count and rotation in rebuilt PDF (in-memory) |

**Not automated:**

- PDF.js canvas pixel output
- Browser print dialog
- Visual zoom/fit sizing accuracy (manual spot check recommended)
- End-to-end edit-then-open-in-Preview verification (manual spot check recommended)

### Manual validation

Perform these in a browser after `npm run dev`:

1. **Rendering** — Open a multi-page PDF; confirm pages render in continuous and single modes.
2. **PDF.js canvas** — Rotate a page; confirm viewer updates without canvas reuse errors.
3. **Edit/export** — Delete or reorder pages, export, open downloaded PDF in Preview/Adobe/browser; confirm page count, order, and rotation.
4. **Extract** — Select pages, extract, open extracted file.
5. **Print** — Use Print; confirm browser print dialog appears (allow pop-ups if blocked).
6. **Quick Download** — Download before and after an edit; confirm filename and content match expectation.
7. **Errors** — Upload a non-PDF; confirm friendly error message.

---

## Suggested Manual Test Script (Short)

1. `cd A && npm run dev`
2. Open a 3+ page PDF → verify render + thumbnails
3. Toggle Single ↔ Continuous → verify layout
4. Use `+` / `−`, Fit width, and Fit page → verify rendered size and zoom percentage change
5. Enable Edit mode → select page 2 → rotate right → confirm visual change
5. Move page down → delete a page → Import a second PDF → Export edited PDF
6. Open exported file externally → confirm edits persisted
7. Extract one page → open extract file
8. Quick Download and Print once each
9. Try uploading `notes.txt` → confirm error banner

---

## Test Suite Summary

```bash
npm run test:run
# 10 test files, 38 tests (as of MVP delivery)
```

Automated tests pass in CI/local Node; they complement but do not replace manual PDF and print validation.
