export const MESSAGES = {
  invalidFile: (fileName: string) =>
    `"${fileName}" is not a PDF. Please choose a file with the .pdf extension.`,

  loadFailed: (detail?: string) =>
    detail
      ? `We couldn't open this PDF. ${detail}`
      : "We couldn't open this PDF. The file may be corrupted or password-protected.",

  renderFailed: (pageNumber: number, detail?: string) =>
    detail
      ? `Page ${pageNumber} could not be displayed. ${detail}`
      : `Page ${pageNumber} could not be displayed. Try reopening the document.`,

  exportFailed: 'Export failed. Please try again or reopen the document.',

  printFailed: 'Print failed. Allow pop-ups for this site and try again.',

  readFailed: 'The file could not be read from your computer. Please try again.',

  noDocument: 'Open a PDF before using this action.',

  noSelection: 'Select one or more pages in the page rail first.',

  opened: (fileName: string) => `Successfully opened ${fileName}.`,

  savedOriginal: (fileName: string) => `Successfully saved ${fileName}.`,

  savedEdited: (fileName: string) => `Successfully saved edited PDF as ${fileName}.`,

  exported: (fileName: string) => `Successfully exported ${fileName}.`,

  extracted: (fileName: string, count: number) =>
    `Successfully extracted ${count} page${count === 1 ? '' : 's'} to ${fileName}.`,

  printed: (fileName: string) => `Print dialog opened for ${fileName}.`,

  imported: (count: number) =>
    `Successfully imported ${count} page${count === 1 ? '' : 's'}.`,
} as const

export function normalizeEditorError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }
  return fallback
}
