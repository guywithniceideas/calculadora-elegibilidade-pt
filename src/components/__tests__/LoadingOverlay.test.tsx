import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import LoadingOverlay from '@/components/LoadingOverlay'

beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers() })

describe('LoadingOverlay', () => {
  it('shows loading text immediately', () => {
    render(<LoadingOverlay onClose={vi.fn()} />)
    expect(screen.getByText('Preparando seu relatório preliminar...')).toBeInTheDocument()
  })

  it('upsell text hidden before 1.5s', () => {
    render(<LoadingOverlay onClose={vi.fn()} />)
    expect(screen.queryByText(/quanto vai gastar/i)).not.toBeInTheDocument()
  })

  it('upsell appears after 1.5s', () => {
    render(<LoadingOverlay onClose={vi.fn()} />)
    act(() => { vi.advanceTimersByTime(1500) })
    expect(screen.getByText(/quanto vai gastar/i)).toBeInTheDocument()
  })

  it('close button hidden before 4s', () => {
    render(<LoadingOverlay onClose={vi.fn()} />)
    act(() => { vi.advanceTimersByTime(1500) })
    expect(screen.queryByText('Fechar e voltar à calculadora')).not.toBeInTheDocument()
  })

  it('close button appears after 4s', () => {
    render(<LoadingOverlay onClose={vi.fn()} />)
    act(() => { vi.advanceTimersByTime(4000) })
    expect(screen.getByText('Fechar e voltar à calculadora')).toBeInTheDocument()
  })
})
