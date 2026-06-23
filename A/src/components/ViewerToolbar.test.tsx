import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ViewerToolbar from './ViewerToolbar'

describe('ViewerToolbar', () => {
  it('renders navigation, zoom, and view mode controls', () => {
    render(
      <ViewerToolbar
        disabled={false}
        currentPage={2}
        pageCount={5}
        zoomPercent={125}
        viewMode="continuous"
      />,
    )

    expect(screen.getByTitle('Previous page')).toBeEnabled()
    expect(screen.getByTitle('Next page')).toBeEnabled()
    expect(screen.getByLabelText('Current page')).toHaveValue(2)
    expect(screen.getByText('/ 5')).toBeInTheDocument()
    expect(screen.getByText('125%')).toBeInTheDocument()
    expect(screen.getByTitle('Continuous scroll')).toBeInTheDocument()
    expect(screen.getByTitle('Single page')).toBeInTheDocument()
  })

  it('disables controls when no document is loaded', () => {
    render(<ViewerToolbar disabled />)

    expect(screen.getByTitle('Previous page')).toBeDisabled()
    expect(screen.getByTitle('Next page')).toBeDisabled()
    expect(screen.getByLabelText('Current page')).toBeDisabled()
    expect(screen.getByText('— / —')).toBeInTheDocument()
    expect(screen.getByText('—%')).toBeInTheDocument()
  })

  it('calls navigation handlers when enabled', async () => {
    const user = userEvent.setup()
    const onNextPage = vi.fn()
    const onToggleEditMode = vi.fn()

    render(
      <ViewerToolbar
        disabled={false}
        currentPage={1}
        pageCount={3}
        onNextPage={onNextPage}
        onToggleEditMode={onToggleEditMode}
      />,
    )

    await user.click(screen.getByTitle('Next page'))
    await user.click(screen.getByTitle('Toggle edit mode'))

    expect(onNextPage).toHaveBeenCalledOnce()
    expect(onToggleEditMode).toHaveBeenCalledOnce()
  })

  it('calls zoom and fit handlers when enabled', async () => {
    const user = userEvent.setup()
    const onZoomIn = vi.fn()
    const onZoomOut = vi.fn()
    const onFitWidth = vi.fn()
    const onFitPage = vi.fn()

    render(
      <ViewerToolbar
        disabled={false}
        currentPage={1}
        pageCount={3}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onFitWidth={onFitWidth}
        onFitPage={onFitPage}
      />,
    )

    await user.click(screen.getByTitle('Zoom in'))
    await user.click(screen.getByTitle('Zoom out'))
    await user.click(screen.getByTitle('Fit to width'))
    await user.click(screen.getByTitle('Fit page (fit to viewport)'))

    expect(onZoomIn).toHaveBeenCalledOnce()
    expect(onZoomOut).toHaveBeenCalledOnce()
    expect(onFitWidth).toHaveBeenCalledOnce()
    expect(onFitPage).toHaveBeenCalledOnce()
  })

  it('disables zoom and fit controls when no document is loaded', () => {
    render(<ViewerToolbar disabled />)

    expect(screen.getByTitle('Zoom in')).toBeDisabled()
    expect(screen.getByTitle('Zoom out')).toBeDisabled()
    expect(screen.getByTitle('Fit to width')).toBeDisabled()
    expect(screen.getByTitle('Fit page (fit to viewport)')).toBeDisabled()
  })
})
