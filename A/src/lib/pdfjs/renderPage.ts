import type { PDFDocumentProxy } from 'pdfjs-dist'

export async function renderPageToCanvas(
  pdfDoc: PDFDocumentProxy,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  scale: number,
): Promise<void> {
  const page = await pdfDoc.getPage(pageNumber)
  const viewport = page.getViewport({ scale })
  const outputScale = window.devicePixelRatio || 1

  canvas.width = Math.floor(viewport.width * outputScale)
  canvas.height = Math.floor(viewport.height * outputScale)
  canvas.style.width = `${Math.floor(viewport.width)}px`
  canvas.style.height = `${Math.floor(viewport.height)}px`

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Unable to acquire canvas rendering context.')
  }

  context.setTransform(outputScale, 0, 0, outputScale, 0, 0)
  context.clearRect(0, 0, canvas.width, canvas.height)

  const renderTask = page.render({
    canvasContext: context,
    viewport,
    canvas,
  })

  await renderTask.promise
}
