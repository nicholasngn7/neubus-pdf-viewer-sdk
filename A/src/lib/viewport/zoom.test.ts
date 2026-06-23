import { describe, expect, it } from 'vitest'
import {
  clampZoomScale,
  computeFitPageScale,
  computeFitWidthScale,
  DEFAULT_ZOOM_SCALE,
  MAX_ZOOM_SCALE,
  MIN_ZOOM_SCALE,
  zoomIn,
  zoomOut,
  zoomScaleToPercent,
} from './zoom'

describe('zoom utilities', () => {
  it('clamps scale to configured bounds', () => {
    expect(clampZoomScale(0.1)).toBe(MIN_ZOOM_SCALE)
    expect(clampZoomScale(5)).toBe(MAX_ZOOM_SCALE)
    expect(clampZoomScale(1.5)).toBe(1.5)
  })

  it('steps zoom in and out', () => {
    expect(zoomIn(1)).toBeGreaterThan(1)
    expect(zoomOut(1)).toBeLessThan(1)
  })

  it('computes fit-to-width scale from page and container width', () => {
    expect(computeFitWidthScale(800, 400)).toBe(0.5)
    expect(computeFitWidthScale(400, 800)).toBe(2)
  })

  it('computes fit-to-page scale using the smaller of width and height ratios', () => {
    expect(computeFitPageScale(800, 1200, 400, 600)).toBe(0.5)
    expect(computeFitPageScale(400, 400, 800, 200)).toBe(0.5)
  })

  it('falls back to the default scale for invalid dimensions', () => {
    expect(computeFitWidthScale(0, 400)).toBe(DEFAULT_ZOOM_SCALE)
    expect(computeFitPageScale(0, 0, 400, 600)).toBe(DEFAULT_ZOOM_SCALE)
  })

  it('converts scale to a rounded percentage', () => {
    expect(zoomScaleToPercent(1.25)).toBe(125)
  })
})
