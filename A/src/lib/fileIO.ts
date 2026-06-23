export function downloadPdfBytes(bytes: Uint8Array, fileName: string): void {
  const copy = new Uint8Array(bytes)
  const blob = new Blob([copy], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

export function buildEditedFileName(fileName: string, suffix: string): string {
  const trimmed = fileName.trim()
  if (!trimmed) {
    return `${suffix}.pdf`
  }

  return trimmed.toLowerCase().endsWith('.pdf')
    ? trimmed.replace(/\.pdf$/i, `-${suffix}.pdf`)
    : `${trimmed}-${suffix}.pdf`
}
