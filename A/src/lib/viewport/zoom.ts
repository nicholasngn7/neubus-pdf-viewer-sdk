export const MIN_ZOOM_SCALE = 0.25
export const MAX_ZOOM_SCALE = 3
export const DEFAULT_ZOOM_SCALE = 1.25
export const ZOOM_STEP_FACTOR = 1.25
export const VIEWER_CANVAS_PADDING_PX = 48

export function clampZoomScale(scale: number): number {
  return Math.min(MAX_ZOOM_SCALE, Math.max(MIN_ZOOM_SCALE, scale))
}

export function zoomIn(scale: number, factor = ZOOM_STEP_FACTOR): number {
  return clampZoomScale(scale * factor)
}

export function zoomOut(scale: number, factor = ZOOM_STEP_FACTOR): number {
  return clampZoomScale(scale / factor)
}

export function computeFitWidthScale(pageWidth: number, containerWidth: number): number {
  if (pageWidth <= 0 || containerWidth <= 0) {
    return DEFAULT_ZOOM_SCALE
  }

  return clampZoomScale(containerWidth / pageWidth)
}

export function computeFitPageScale(
  pageWidth: number,
  pageHeight: number,
  containerWidth: number,
  containerHeight: number,
): number {
  if (pageWidth <= 0 || pageHeight <= 0 || containerWidth <= 0 || containerHeight <= 0) {
    return DEFAULT_ZOOM_SCALE
  }

  const widthScale = containerWidth / pageWidth
  const heightScale = containerHeight / pageHeight
  return clampZoomScale(Math.min(widthScale, heightScale))
}

export function zoomScaleToPercent(scale: number): number {
  return Math.round(scale * 100)
}
