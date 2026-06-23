export type PageRotation = 0 | 90 | 180 | 270

export type PageSource = {
  id: string
  sourceBytes: ArrayBuffer
  sourcePageIndex: number
  rotation: PageRotation
}

export type EditorStatus = {
  message: string | null
  error: string | null
  isBusy: boolean
}

export const ROTATION_STEPS: PageRotation[] = [0, 90, 180, 270]

export function normalizeRotation(value: number): PageRotation {
  const normalized = ((value % 360) + 360) % 360
  if (normalized === 90 || normalized === 180 || normalized === 270) {
    return normalized
  }
  return 0
}

export function rotateLeft(rotation: PageRotation): PageRotation {
  const index = ROTATION_STEPS.indexOf(rotation)
  return ROTATION_STEPS[(index + 3) % ROTATION_STEPS.length]
}

export function rotateRight(rotation: PageRotation): PageRotation {
  const index = ROTATION_STEPS.indexOf(rotation)
  return ROTATION_STEPS[(index + 1) % ROTATION_STEPS.length]
}

export function createPageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function createPagesFromPdf(bytes: ArrayBuffer, pageCount: number): PageSource[] {
  return Array.from({ length: pageCount }, (_, sourcePageIndex) => ({
    id: createPageId(),
    sourceBytes: bytes,
    sourcePageIndex,
    rotation: 0,
  }))
}
