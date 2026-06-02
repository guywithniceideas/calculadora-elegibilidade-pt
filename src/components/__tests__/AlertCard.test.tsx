import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import AlertCard from '@/components/AlertCard'

describe('AlertCard', () => {
  it('renders title and message', () => {
    render(<AlertCard type="warning" title="Título" message="Mensagem do alerta." />)
    expect(screen.getByText(/Título/)).toBeInTheDocument()
    expect(screen.getByText('Mensagem do alerta.')).toBeInTheDocument()
  })
  it('applies warning border for warning type', () => {
    const { container } = render(<AlertCard type="warning" title="T" message="M" />)
    expect(container.firstChild).toHaveClass('border-amber-500')
  })
  it('applies red border for error type', () => {
    const { container } = render(<AlertCard type="error" title="T" message="M" />)
    expect(container.firstChild).toHaveClass('border-red-500')
  })
})
