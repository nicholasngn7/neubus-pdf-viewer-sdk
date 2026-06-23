import { describe, expect, it } from 'vitest'
import { normalizeRotation, rotateLeft, rotateRight } from './edits'

describe('rotation helpers', () => {
  it('normalizes rotation values to supported quarter turns', () => {
    expect(normalizeRotation(450)).toBe(90)
    expect(normalizeRotation(180)).toBe(180)
    expect(normalizeRotation(45)).toBe(0)
  })

  it('rotates left and right through 90 degree steps', () => {
    expect(rotateLeft(0)).toBe(270)
    expect(rotateRight(270)).toBe(0)
    expect(rotateRight(90)).toBe(180)
  })
})
