# Cursor AI Change Log — Neubus PDF Viewer SDK MVP

## How Cursor Was Used

Cursor was used throughout this exercise to plan and implement the MVP in the `A/` app, with supporting documentation in `B/` and `C/`.

Typical workflow:

1. **Plan mode** — Draft the MVP scope, file structure, state model, build sequence, and tradeoffs before writing application code.
2. **Agent mode** — Implement the app shell, PDF.js rendering, pdf-lib editing, UX polish, and tests in focused passes.
3. **Iteration** — Fix wiring bugs (e.g. PDF bytes not reaching the viewer), rendering lifecycle issues, and documentation accuracy based on what was actually shipped.

Cursor was not used to add backend services, authentication, or features explicitly excluded from scope.

## Plan Mode Before Build

Plan mode was used before implementation. The plan was saved as [`C/cursor-plan.md`](cursor-plan.md). That document defined:

- Phased delivery (scaffold → viewer → edit → export)
- Dual-library approach (pdfjs-dist + pdf-lib)
- Explicit out-of-scope items (OCR, auth, backend, signatures, etc.)

Implementation generally followed the plan for page-level editing and export, but several plan items were intentionally deferred (see below).

## Changes Made From AI Output (and Why)

| AI suggestion / default | What I kept or changed | Reason |
| --- | --- | --- |
| Zustand or global store | Simple React state + two hooks | Single-document MVP; less complexity |
| Full plan file tree (many subfolders) | Flatter structure under `A/src/` | Timeboxed; fewer moving parts |
| Text search and annotation overlay (plan phase 3–4) | **Deferred** | Page-level edit scope prioritized |
| Immediate pdf-lib sync on every keystroke | Rebuild bytes after discrete page ops | Simpler correctness for rotate/delete/reorder/import |
| Placeholder “PDF rendering will appear here” shell | Wired `pdfBytes` → PDF.js → `PageCanvas` | Required for a working demo |
| `usePdfDocument` loading inside hook only | `pdfBytes` in App + `usePdfFromBytes` in viewer | Clearer data flow and easier debugging |
| README claiming zoom/fit fully work | Documented as partial in architecture/validation | Toolbar buttons exist but are not wired |

## Manual Fixes After Cursor Output

### PDF.js canvas render lifecycle / cancellation

After PDF upload, the viewer sometimes showed:

> Cannot use the same canvas during multiple render() operations.

**Fix:** Rewrote [`A/src/components/PageCanvas.tsx`](../A/src/components/PageCanvas.tsx) to:

- Track the active PDF.js `RenderTask` in a ref
- Cancel any in-flight task before starting a new render
- Cancel on effect cleanup (React StrictMode and prop changes)
- Ignore cancellation errors so they are not shown as user-facing render failures

This was a manual correction after observing runtime behavior in the browser, not something the initial scaffold handled correctly.

### Edit/view synchronization

Ensured pdf-lib rebuilds update `pdfBytes` so PDF.js reloads the edited document, and that Quick Download respects `isDirty` (edited vs original bytes).

### Test suite stability

Added `@testing-library/react` cleanup in [`A/src/test/setup.ts`](../A/src/test/setup.ts) after tests leaked DOM nodes across files. Mocked `PageCanvas` and PDF.js load in app smoke tests so Vitest does not claim canvas rendering fidelity.

## Why Scope Was Constrained

The exercise is a **timeboxed MVP** of an embeddable viewer/editor module, not a full Neubus records application. Constraining scope:

- Kept delivery focused on demonstrable page ops + export
- Avoided backend/auth/infra that would not be evaluable without a host app
- Reduced risk of incomplete “half features” across too many areas

## Why Bonus Features Were Deferred

These were considered but **not implemented** in this repo:

| Feature | Reason deferred |
| --- | --- |
| In-PDF text search | Time; not required for page-level edit demo |
| Text annotations / redaction | Different product surface; out of MVP scope |
| Zoom/fit wiring | Toolbar placeholders shipped; behavior deferred |
| Undo/redo | Needs operation history; cut for time |
| Drag-and-drop reorder | Move Up/Down sufficient for MVP |
| Backend upload / auth / DB | Explicitly out of scope |
| WebAssembly PDF SDK | Not used; no WASM claim |
| Linearized byte-range loading | Requires server + HTTP ranges; local files only |
| OCR / scan / signatures / bookmarks | Explicitly out of scope |

## Features Actually Implemented (No Over-Claiming)

**Implemented:**

- Local PDF open/upload (header + viewer dropzone)
- PDF.js rendering to canvas (single + continuous modes)
- Page navigation and thumbnail rail
- Edit mode with multi-select pages
- Rotate, delete, Move Up/Down reorder
- Import/merge (append all pages from another PDF)
- Extract selected pages
- Export / Quick Download / Print
- Success toast and user-friendly error messages
- Vitest unit/integration tests for shell, utilities, and pdf-lib rebuild (not render fidelity)

**Not implemented (do not claim):**

- Working zoom in/out or fit-to-width / fit-to-page (UI only)
- Search, OCR, redaction, signatures, bookmarks
- Backend upload, authentication, database
- WebAssembly rendering
- True linearized HTTP byte-range streaming demo
