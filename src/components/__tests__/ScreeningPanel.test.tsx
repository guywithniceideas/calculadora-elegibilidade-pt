import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ScreeningPanel from '@/components/ScreeningPanel'
import type { ScreeningAnswers } from '@/lib/types'

const empty: ScreeningAnswers = { objetivo: null, situacao: null, familia: null }

describe('ScreeningPanel', () => {
  it('renders the first question initially', () => {
    render(<ScreeningPanel answers={empty} onChange={vi.fn()} onNext={vi.fn()} />)
    expect(screen.getByText(/Qual seu objetivo/i)).toBeInTheDocument()
    expect(screen.getByText('Pergunta 1 de 3')).toBeInTheDocument()
  })

  it('"Ver Resultado" button is not shown when no answers', () => {
    render(<ScreeningPanel answers={empty} onChange={vi.fn()} onNext={vi.fn()} />)
    expect(screen.queryByText('Ver Resultado →')).not.toBeInTheDocument()
  })

  it('"Ver Resultado" button appears when all 3 answered', () => {
    const full: ScreeningAnswers = { objetivo: 'remoto', situacao: 'freelancer', familia: 'sozinho' }
    render(<ScreeningPanel answers={full} onChange={vi.fn()} onNext={vi.fn()} />)
    expect(screen.getByText('Ver Resultado →')).toBeInTheDocument()
  })

  it('clicking objetivo option calls onChange with objetivo set', () => {
    const onChange = vi.fn()
    render(<ScreeningPanel answers={empty} onChange={onChange} onNext={vi.fn()} />)
    fireEvent.click(screen.getByText('Trabalhar remotamente para empresa fora de Portugal'))
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ objetivo: 'remoto' }))
  })

  it('clicking "Ver Resultado" when enabled calls onNext', () => {
    const onNext = vi.fn()
    const full: ScreeningAnswers = { objetivo: 'remoto', situacao: 'freelancer', familia: 'sozinho' }
    render(<ScreeningPanel answers={full} onChange={vi.fn()} onNext={onNext} />)
    fireEvent.click(screen.getByText('Ver Resultado →'))
    expect(onNext).toHaveBeenCalled()
  })

  it('selected option has bg-[#1A1A1A] class', () => {
    const answers: ScreeningAnswers = { objetivo: 'remoto', situacao: null, familia: null }
    render(<ScreeningPanel answers={answers} onChange={vi.fn()} onNext={vi.fn()} />)
    const selectedOption = screen.getByText('Trabalhar remotamente para empresa fora de Portugal')
    expect(selectedOption.closest('button')).toHaveClass('bg-[#1A1A1A]')
  })

  it('shows recap chips with short labels once answered', () => {
    const full: ScreeningAnswers = { objetivo: 'remoto', situacao: 'freelancer', familia: 'sozinho' }
    render(<ScreeningPanel answers={full} onChange={vi.fn()} onNext={vi.fn()} />)
    expect(screen.getByText('Remoto')).toBeInTheDocument()
    expect(screen.getByText('Freelancer')).toBeInTheDocument()
    expect(screen.getByText('Sozinho')).toBeInTheDocument()
  })
})
