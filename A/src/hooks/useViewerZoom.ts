import { useCallback, useState, type RefObject } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { getPageDimensions } from '../lib/pdfjs/getPageDimensions'
import {
  clampZoomScale,
  computeFitPageScale,
  computeFitWidthScale,
  DEFAULT_ZOOM_SCALE,
  VIEWER_CANVAS_PADDING_PX,
  zoomIn,
  zoomOut,
  zoomScaleToPercent,
} from '../lib/viewport/zoom'

type UseViewerZoomOptions = {
  canvasAreaRef: RefObject<HTMLDivElement | null>
  pdfDoc: PDFDocumentProxy | null
  currentPage: number
  hasDocument: boolean
}

export function useViewerZoom({
  canvasAreaRef,
  pdfDoc,
  currentPage,
  hasDocument,
}: UseViewerZoomOptions) {
  const [zoomScale, setZoomScale] = useState(DEFAULT_ZOOM_SCALE)

  const resetZoom = useCallback(() => {
    setZoomScale(DEFAULT_ZOOM_SCALE)
  }, [])

  const handleZoomIn = useCallback(() => {
    if (!hasDocument) {
      return
    }

    setZoomScale((current) => zoomIn(current))
  }, [hasDocument])

  const handleZoomOut = useCallback(() => {
    if (!hasDocument) {
      return
    }

    setZoomScale((current) => zoomOut(current))
  }, [hasDocument])

  const getAvailableViewerSize = useCallback(() => {
    const container = canvasAreaRef.current
    if (!container) {
      return null
    }

    return {
      width: Math.max(container.clientWidth - VIEWER_CANVAS_PADDING_PX, 1),
      height: Math.max(container.clientHeight - VIEWER_CANVAS_PADDING_PX, 1),
    }
  }, [canvasAreaRef])

  const handleFitWidth = useCallback(async () => {
    if (!hasDocument || !pdfDoc) {
      return
    }

    const available = getAvailableViewerSize()
    if (!available) {
      return
    }

    const { width } = await getPageDimensions(pdfDoc, currentPage)
    setZoomScale(computeFitWidthScale(width, available.width))
  }, [currentPage, getAvailableViewerSize, hasDocument, pdfDoc])

  const handleFitPage = useCallback(async () => {
    if (!hasDocument || !pdfDoc) {
      return
    }

    const available = getAvailableViewerSize()
    if (!available) {
      return
    }

    const { width, height } = await getPageDimensions(pdfDoc, currentPage)
    setZoomScale(computeFitPageScale(width, height, available.width, available.height))
  }, [currentPage, getAvailableViewerSize, hasDocument, pdfDoc])

  return {
    zoomScale: clampZoomScale(zoomScale),
    zoomPercent: zoomScaleToPercent(zoomScale),
    resetZoom,
    handleZoomIn,
    handleZoomOut,
    handleFitWidth,
    handleFitPage,
  }
}
