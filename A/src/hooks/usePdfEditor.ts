import { useCallback, useState } from 'react'
import { buildEditedFileName, downloadPdfBytes, printPdfBytes } from '../lib/fileIO'
import { MESSAGES, normalizeEditorError } from '../lib/messages'
import {
  buildPdfBytes,
  getPdfPageCount,
  uint8ArrayToArrayBuffer,
} from '../lib/pdfLib/buildDocument'
import {
  createPageId,
  createPagesFromPdf,
  rotateLeft,
  rotateRight,
  type EditorStatus,
  type PageSource,
} from '../types/edits'

function cloneBytes(bytes: ArrayBuffer): ArrayBuffer {
  return bytes.slice(0)
}

function sortSelectedPages(selectedPages: Set<number>): number[] {
  return [...selectedPages].sort((left, right) => left - right)
}

function clampPage(page: number, pageCount: number): number {
  if (pageCount <= 0) {
    return 1
  }
  return Math.min(Math.max(page, 1), pageCount)
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
    setSelectedPages(new Set())
  }, [])

  const togglePageSelection = useCallback((pageNumber: number) => {
    setSelectedPages((current) => {
      const next = new Set(current)
      if (next.has(pageNumber)) {
        next.delete(pageNumber)
      } else {
        next.add(pageNumber)
      }
      return next
    })
  }, [])

  const selectPage = useCallback((pageNumber: number) => {
    setSelectedPages(new Set([pageNumber]))
  }, [])

  const rotateSelected = useCallback(
    async (direction: 'left' | 'right') => {
      if (selectedPages.size === 0) {
        setStatus({ message: null, error: MESSAGES.noSelection, isBusy: false })
        return
      }

      const rotate = direction === 'left' ? rotateLeft : rotateRight
      const selected = new Set(selectedPages)

      const nextPages = pages.map((page, index) => {
        if (!selected.has(index + 1)) {
          return page
        }

        return {
          ...page,
          rotation: rotate(page.rotation),
        }
      })

      await applyPages(
        nextPages,
        `Rotated ${selected.size} page${selected.size === 1 ? '' : 's'} ${direction}.`,
      )
    },
    [applyPages, pages, selectedPages],
  )

  const deleteSelected = useCallback(async () => {
    if (selectedPages.size === 0) {
      setStatus({ message: null, error: MESSAGES.noSelection, isBusy: false })
      return
    }

    if (selectedPages.size >= pages.length) {
      setStatus({
        message: null,
        error: 'At least one page must remain in the document.',
        isBusy: false,
      })
      return
    }

    const selected = new Set(selectedPages)
    const nextPages = pages.filter((_, index) => !selected.has(index + 1))

    setSelectedPages(new Set())
    await applyPages(
      nextPages,
      `Deleted ${selected.size} page${selected.size === 1 ? '' : 's'}.`,
    )
  }, [applyPages, pages, selectedPages])

  const moveSelected = useCallback(
    async (direction: 'up' | 'down') => {
      if (selectedPages.size === 0) {
        setStatus({ message: null, error: MESSAGES.noSelection, isBusy: false })
        return
      }

      const selected = sortSelectedPages(selectedPages)
      const nextPages = [...pages]

      if (direction === 'up') {
        const firstIndex = selected[0] - 1
        if (firstIndex <= 0) {
          setStatus({ message: 'Selected pages are already at the top.', error: null, isBusy: false })
          return
        }

        const swapIndex = firstIndex - 1
        ;[nextPages[swapIndex], nextPages[firstIndex]] = [nextPages[firstIndex], nextPages[swapIndex]]
        setSelectedPages(new Set(selected.map((page) => page - 1)))
      } else {
        const lastIndex = selected[selected.length - 1] - 1
        if (lastIndex >= nextPages.length - 1) {
          setStatus({
            message: 'Selected pages are already at the bottom.',
            error: null,
            isBusy: false,
          })
          return
        }

        const swapIndex = lastIndex + 1
        ;[nextPages[lastIndex], nextPages[swapIndex]] = [nextPages[swapIndex], nextPages[lastIndex]]
        setSelectedPages(new Set(selected.map((page) => page + 1)))
      }

      await applyPages(
        nextPages,
        `Moved ${selected.length} page${selected.length === 1 ? '' : 's'} ${direction}.`,
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
        const importedPages: PageSource[] = Array.from({ length: importPageCount }, (_, index) => ({
          id: createPageId(),
          sourceBytes: copiedBytes,
          sourcePageIndex: index,
          rotation: 0,
        }))

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
      const selected = sortSelectedPages(selectedPages)
      const extractedPages = selected.map((pageNumber) => pages[pageNumber - 1])
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
