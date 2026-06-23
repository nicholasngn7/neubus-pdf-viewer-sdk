import { useEffect, useRef, useState } from 'react'
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist'

type PageCanvasProps = {
  pdfDoc: PDFDocumentProxy
  pageNumber: number
  scale: number
  className?: string
  id?: string
}

function isRenderCancelled(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false
  }

  return error.name === 'RenderingCancelledException' || /cancel/i.test(error.message)
}

export default function PageCanvas({
  pdfDoc,
  pageNumber,
  scale,
  className,
  id,
}: PageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const renderTaskRef = useRef<RenderTask | null>(null)
  const [renderError, setRenderError] = useState<string | null>(null)
  const [isRendering, setIsRendering] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    let cancelled = false

    setRenderError(null)
    setIsRendering(true)

    if (renderTaskRef.current) {
      renderTaskRef.current.cancel()
      renderTaskRef.current = null
    }

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(pageNumber)

        if (cancelled) {
          return
        }

        const viewport = page.getViewport({ scale })
        const outputScale = window.devicePixelRatio || 1

        canvas.width = Math.floor(viewport.width * outputScale)
        canvas.height = Math.floor(viewport.height * outputScale)
        canvas.style.width = `${Math.floor(viewport.width)}px`
        canvas.style.height = `${Math.floor(viewport.height)}px`

        const canvasContext = canvas.getContext('2d')
        if (!canvasContext) {
          throw new Error('Unable to acquire canvas rendering context.')
        }

        canvasContext.setTransform(outputScale, 0, 0, outputScale, 0, 0)
        canvasContext.clearRect(0, 0, canvas.width, canvas.height)

        if (cancelled) {
          return
        }

        const renderTask = page.render({
          canvasContext,
          viewport,
          canvas,
        })

        renderTaskRef.current = renderTask
        await renderTask.promise

        if (!cancelled) {
          setIsRendering(false)
        }
      } catch (error) {
        if (cancelled || isRenderCancelled(error)) {
          return
        }

        const message = error instanceof Error ? error.message : 'Failed to render page.'
        setRenderError(message)
        setIsRendering(false)
      }
    }

    void renderPage()

    return () => {
      cancelled = true

      if (renderTaskRef.current) {
        renderTaskRef.current.cancel()
        renderTaskRef.current = null
      }
    }
  }, [pdfDoc, pageNumber, scale])

  if (renderError) {
    return (
      <div className="pdf-page-canvas pdf-page-canvas--error" id={id} role="alert">
        <p className="pdf-page-canvas__error-title">Unable to render page {pageNumber}</p>
        <p className="pdf-page-canvas__error-text">{renderError}</p>
      </div>
    )
  }

  return (
    <div className="pdf-page-canvas-wrap">
      {isRendering && (
        <div className="pdf-page-canvas__loading" aria-hidden={!isRendering}>
          Rendering page {pageNumber}…
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={className ?? 'pdf-page-canvas'}
        id={id}
        aria-label={`Page ${pageNumber}`}
      />
    </div>
  )
}
