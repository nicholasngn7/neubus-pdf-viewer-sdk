import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { PDFDocument } from 'pdf-lib'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { MESSAGES } from './lib/messages'

vi.mock('./components/PageCanvas', () => ({
  default: () => <div data-testid="page-canvas-mock" />,
}))

vi.mock('./lib/pdfjs/loadDocument', () => ({
  loadPdfDocument: vi.fn(async () => ({
    doc: {
      numPages: 2,
      getPage: vi.fn(),
    },
    loadingTask: {
      destroy: vi.fn(),
    },
  })),
}))

async function createPdfFile(name = 'sample.pdf'): Promise<File> {
  const document = await PDFDocument.create()
  document.addPage()
  document.addPage()
  const bytes = await document.save()

  return new File([Uint8Array.from(bytes)], name, { type: 'application/pdf' })
}

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the main app shell', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Neubus PDF Viewer' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Open PDF' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Quick Download' })).toBeDisabled()
    expect(screen.getByText('No file selected')).toBeInTheDocument()
  })

  it('shows a user-friendly error for invalid non-pdf uploads', async () => {
    render(<App />)

    const input = document.querySelector('input[aria-label="Open PDF file"]') as HTMLInputElement
    const invalidFile = new File(['hello'], 'notes.txt', { type: 'text/plain' })

    fireEvent.change(input, { target: { files: [invalidFile] } })

    expect(screen.getByRole('alert')).toHaveTextContent(MESSAGES.invalidFile('notes.txt'))
    expect(within(screen.getByRole('banner')).getByText('No file selected')).toBeInTheDocument()
  })

  it('updates the header file name after a valid pdf is selected', async () => {
    render(<App />)

    const input = document.querySelector('input[aria-label="Open PDF file"]') as HTMLInputElement
    const pdfFile = await createPdfFile('letter.pdf')

    fireEvent.change(input, { target: { files: [pdfFile] } })

    await waitFor(() => {
      expect(within(screen.getByRole('banner')).getByText('letter.pdf')).toBeInTheDocument()
      expect(screen.getAllByRole('button', { name: 'Quick Download' })[0]).toBeEnabled()
    })
  })
})
