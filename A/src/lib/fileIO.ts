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

export function printPdfBytes(bytes: Uint8Array): Promise<void> {
  return new Promise((resolve, reject) => {
    const copy = new Uint8Array(bytes)
    const blob = new Blob([copy], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)

    const cleanup = (iframe: HTMLIFrameElement | null, tab: Window | null) => {
      window.setTimeout(() => {
        URL.revokeObjectURL(url)
        iframe?.remove()
        if (tab && !tab.closed) {
          tab.close()
        }
      }, 60_000)
    }

    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = '0'
    iframe.src = url

    iframe.onload = () => {
      try {
        iframe.contentWindow?.focus()
        iframe.contentWindow?.print()
        resolve()
        cleanup(iframe, null)
      } catch {
        iframe.remove()
        const tab = window.open(url, '_blank')
        if (!tab) {
          URL.revokeObjectURL(url)
          reject(new Error('Print blocked'))
          return
        }

        tab.addEventListener('load', () => {
          try {
            tab.focus()
            tab.print()
            resolve()
          } catch (error) {
            reject(error instanceof Error ? error : new Error('Print failed'))
          } finally {
            cleanup(null, tab)
          }
        })
      }
    }

    iframe.onerror = () => {
      iframe.remove()
      URL.revokeObjectURL(url)
      reject(new Error('Print failed'))
    }

    document.body.appendChild(iframe)
  })
}
