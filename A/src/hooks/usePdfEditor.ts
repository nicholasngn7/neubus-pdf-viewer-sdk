import { useCallback, useState } from 'react'
import {
  deleteSelectedPages,
  getPagesForExtraction,
  moveSelectedPages,
  rotateSelectedPages,
  createImportedPages,
} from '../lib/editor/pageOperations'
import {
  clearPageSelection,
  selectSinglePage,
  togglePageInSelection,
} from '../lib/editor/selection'
import { buildEditedFileName, downloadPdfBytes, printPdfBytes } from '../lib/fileIO'
import { clampPage } from '../lib/navigation/clampPage'
import { MESSAGES, normalizeEditorError } from '../lib/messages'
import {
  buildPdfBytes,
  getPdfPageCount,
  uint8ArrayToArrayBuffer,
} from '../lib/pdfLib/buildDocument'
import {
  createPageId,
  createPagesFromPdf,
  type EditorStatus,
  type PageSource,
} from '../types/edits'

function cloneBytes(bytes: ArrayBuffer): ArrayBuffer {
  return bytes.slice(0)
}

const idleStatus: EditorStatus = {
  message: null,
  error: null,
  isBusy: false,
}

export function usePdfEditor() {
  const [fileName, setFileName] = useState<string | null>(null)
  const [originalBytes, setOriginalBytes] = useState<ArrayBuffer | null>(null)
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null)
  const [pages, setPages] = useState<PageSource[]>([])
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set())
  const [status, setStatus] = useState<EditorStatus>(idleStatus)
  const [isDirty, setIsDirty] = useState(false)

  const pageCount = pages.length

  const applyPages = useCallback(async (nextPages: PageSource[], message: string) => {
    setStatus({ message: null, error: null, isBusy: true })

    try {
      const output = await buildPdfBytes(nextPages)
      setPages(nextPages)
      setPdfBytes(uint8ArrayToArrayBuffer(output))
      setIsDirty(true)
      setStatus({ message, error: null, isBusy: false })
    } catch (error) {
      const errorMessage = normalizeEditorError(error, MESSAGES.exportFailed)
      setStatus({ message: null, error: errorMessage, isBusy: false })
      throw error
    }
  }, [])

  const openFile = useCallback(async (name: string, bytes: ArrayBuffer) => {
    setStatus({ message: null, error: null, isBusy: true })

    try {
      const copiedBytes = cloneBytes(bytes)
      const count = await getPdfPageCount(copiedBytes)
      const initialPages = createPagesFromPdf(copiedBytes, count)

      setFileName(name)
      setOriginalBytes(copiedBytes)
      setPages(initialPages)
      setPdfBytes(copiedBytes)
      setSelectedPages(new Set())
      setIsDirty(false)
      setStatus({ message: MESSAGES.opened(name), error: null, isBusy: false })
    } catch (error) {
      const errorMessage = normalizeEditorError(error, MESSAGES.loadFailed())
      setFileName(null)
      setOriginalBytes(null)
      setPages([])
      setPdfBytes(null)
      setSelectedPages(new Set())
      setIsDirty(false)
      setStatus({ message: null, error: errorMessage, isBusy: false })
      throw error
    }
  }, [])

  const resetEditor = useCallback(() => {
    setFileName(null)
    setOriginalBytes(null)
    setPdfBytes(null)
    setPages([])
    setSelectedPages(new Set())
    setIsDirty(false)
    setStatus(idleStatus)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedPages(clearPageSelection())
  }, [])

  const togglePageSelection = useCallback((pageNumber: number) => {
    setSelectedPages((current) => togglePageInSelection(current, pageNumber))
  }, [])

  const selectPage = useCallback((pageNumber: number) => {
    setSelectedPages(selectSinglePage(pageNumber))
  }, [])

  const rotateSelected = useCallback(
    async (direction: 'left' | 'right') => {
      if (selectedPages.size === 0) {
        setStatus({ message: null, error: MESSAGES.noSelection, isBusy: false })
        return
      }

      const selected = new Set(selectedPages)
      const nextPages = rotateSelectedPages(pages, selected, direction)

      await applyPages(
        nextPages,
        `Rotated ${selected.size} page${selected.size === 1 ? '' : 's'} ${direction}.`,
      )
    },
    [applyPages, pages, selectedPages],
  )

  const deleteSelected = useCallback(async () => {
    const result = deleteSelectedPages(pages, selectedPages)

    if (!result.ok) {
      if (result.error === 'no-selection') {
        setStatus({ message: null, error: MESSAGES.noSelection, isBusy: false })
        return
      }

      setStatus({
        message: null,
        error: 'At least one page must remain in the document.',
        isBusy: false,
      })
      return
    }

    setSelectedPages(clearPageSelection())
    await applyPages(
      result.pages,
      `Deleted ${selectedPages.size} page${selectedPages.size === 1 ? '' : 's'}.`,
    )
  }, [applyPages, pages, selectedPages])

  const moveSelected = useCallback(
    async (direction: 'up' | 'down') => {
      const result = moveSelectedPages(pages, selectedPages, direction)

      if (!result.ok) {
        if (result.error === 'no-selection') {
          setStatus({ message: null, error: MESSAGES.noSelection, isBusy: false })
          return
        }

        if (result.error === 'at-top') {
          setStatus({ message: 'Selected pages are already at the top.', error: null, isBusy: false })
          return
        }

        setStatus({
          message: 'Selected pages are already at the bottom.',
          error: null,
          isBusy: false,
        })
        return
      }

      setSelectedPages(result.selectedPages)
      await applyPages(
        result.pages,
        `Moved ${selectedPages.size} page${selectedPages.size === 1 ? '' : 's'} ${direction}.`,
      )
    },
    [applyPages, pages, selectedPages],
  )

  const importPdf = useCallback(
    async (bytes: ArrayBuffer) => {
      if (pages.length === 0) {
        setStatus({ message: null, error: MESSAGES.noDocument, isBusy: false })
        return
      }

      setStatus({ message: null, error: null, isBusy: true })

      try {
        const copiedBytes = cloneBytes(bytes)
        const importPageCount = await getPdfPageCount(copiedBytes)
        const importedPages = createImportedPages(copiedBytes, importPageCount, createPageId)

        await applyPages(
          [...pages, ...importedPages],
          MESSAGES.imported(importPageCount),
        )
      } catch (error) {
        const errorMessage = normalizeEditorError(error, MESSAGES.exportFailed)
        setStatus({ message: null, error: errorMessage, isBusy: false })
      }
    },
    [applyPages, pages],
  )

  const extractSelected = useCallback(async () => {
    if (selectedPages.size === 0) {
      setStatus({ message: null, error: MESSAGES.noSelection, isBusy: false })
      return
    }

    setStatus({ message: null, error: null, isBusy: true })

    try {
      const extractedPages = getPagesForExtraction(pages, selectedPages)
      if (!extractedPages) {
        setStatus({ message: null, error: MESSAGES.noSelection, isBusy: false })
        return
      }

      const selected = [...selectedPages].sort((left, right) => left - right)
      const output = await buildPdfBytes(extractedPages)
      const downloadName = buildEditedFileName(fileName ?? 'document', 'extract')
      downloadPdfBytes(output, downloadName)
      setStatus({
        message: MESSAGES.extracted(downloadName, selected.length),
        error: null,
        isBusy: false,
      })
    } catch (error) {
      const errorMessage = normalizeEditorError(error, MESSAGES.exportFailed)
      setStatus({ message: null, error: errorMessage, isBusy: false })
    }
  }, [fileName, pages, selectedPages])

  const exportEdited = useCallback(async () => {
    if (pages.length === 0 || !pdfBytes || !fileName) {
      setStatus({ message: null, error: MESSAGES.noDocument, isBusy: false })
      return
    }

    setStatus({ message: null, error: null, isBusy: true })

    try {
      const output = await buildPdfBytes(pages)
      const downloadName = isDirty
        ? buildEditedFileName(fileName, 'edited')
        : fileName
      downloadPdfBytes(output, downloadName)
      setStatus({
        message: isDirty ? MESSAGES.savedEdited(downloadName) : MESSAGES.exported(downloadName),
        error: null,
        isBusy: false,
      })
    } catch (error) {
      const errorMessage = normalizeEditorError(error, MESSAGES.exportFailed)
      setStatus({ message: null, error: errorMessage, isBusy: false })
    }
  }, [fileName, isDirty, pages, pdfBytes])

  const downloadCurrent = useCallback(async () => {
    if (!fileName || !originalBytes) {
      setStatus({ message: null, error: MESSAGES.noDocument, isBusy: false })
      return
    }

    setStatus({ message: null, error: null, isBusy: true })

    try {
      if (isDirty) {
        const output = await buildPdfBytes(pages)
        const downloadName = buildEditedFileName(fileName, 'edited')
        downloadPdfBytes(output, downloadName)
        setStatus({
          message: MESSAGES.savedEdited(downloadName),
          error: null,
          isBusy: false,
        })
      } else {
        downloadPdfBytes(new Uint8Array(originalBytes), fileName)
        setStatus({
          message: MESSAGES.savedOriginal(fileName),
          error: null,
          isBusy: false,
        })
      }
    } catch (error) {
      const errorMessage = normalizeEditorError(error, MESSAGES.exportFailed)
      setStatus({ message: null, error: errorMessage, isBusy: false })
    }
  }, [fileName, isDirty, originalBytes, pages])

  const printCurrent = useCallback(async () => {
    if (!fileName || !originalBytes) {
      setStatus({ message: null, error: MESSAGES.noDocument, isBusy: false })
      return
    }

    setStatus({ message: null, error: null, isBusy: true })

    try {
      const output = isDirty ? await buildPdfBytes(pages) : new Uint8Array(originalBytes)
      await printPdfBytes(output)
      setStatus({
        message: MESSAGES.printed(fileName),
        error: null,
        isBusy: false,
      })
    } catch (error) {
      const errorMessage = normalizeEditorError(error, MESSAGES.printFailed)
      setStatus({ message: null, error: errorMessage, isBusy: false })
    }
  }, [fileName, isDirty, originalBytes, pages])

  return {
    fileName,
    originalBytes,
    pdfBytes,
    pages,
    pageCount,
    selectedPages,
    status,
    isDirty,
    openFile,
    resetEditor,
    clearSelection,
    togglePageSelection,
    selectPage,
    rotateSelected,
    deleteSelected,
    moveSelected,
    importPdf,
    extractSelected,
    exportEdited,
    downloadCurrent,
    printCurrent,
    clampPage,
  }
}
