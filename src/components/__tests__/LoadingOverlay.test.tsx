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

  it('success message hidden before 3s', () => {
    render(<LoadingOverlay onClose={vi.fn()} />)
    expect(screen.queryByText(/Relatório Preliminar enviado/i)).not.toBeInTheDocument()
  })

  it('success message and upsell appear after 3s', () => {
    render(<LoadingOverlay onClose={vi.fn()} />)
    act(() => { vi.advanceTimersByTime(3000) })
    expect(screen.getByText('Relatório Preliminar enviado por email!')).toBeInTheDocument()
    expect(screen.getByText(/quanto vai gastar/i)).toBeInTheDocument()
  })

  it('close button hidden before 5s', () => {
    render(<LoadingOverlay onClose={vi.fn()} />)
    act(() => { vi.advanceTimersByTime(3000) })
    expect(screen.queryByText('Fechar e voltar à calculadora')).not.toBeInTheDocument()
  })

  it('close button appears after 5s', () => {
    render(<LoadingOverlay onClose={vi.fn()} />)
    act(() => { vi.advanceTimersByTime(5000) })
    expect(screen.getByText('Fechar e voltar à calculadora')).toBeInTheDocument()
  })
})
