import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ScreeningPanel from '@/components/ScreeningPanel'
import type { ScreeningAnswers } from '@/lib/types'

const empty: ScreeningAnswers = { objetivo: null, situacao: null, familia: null }

describe('ScreeningPanel', () => {
  it('renders all 3 section labels', () => {
    render(<ScreeningPanel answers={empty} onChange={vi.fn()} onNext={vi.fn()} />)
    expect(screen.getByText(/Qual seu objetivo/i)).toBeInTheDocument()
    expect(screen.getByText(/situação profissional/i)).toBeInTheDocument()
    expect(screen.getByText(/Quem vem com você/i)).toBeInTheDocument()
  })

  it('"Próxima Etapa" button is disabled when no answers', () => {
    render(<ScreeningPanel answers={empty} onChange={vi.fn()} onNext={vi.fn()} />)
    expect(screen.getByText('Próxima Etapa →')).toBeDisabled()
  })

  it('"Próxima Etapa" button is enabled when all 3 answered', () => {
    const full: ScreeningAnswers = { objetivo: 'remoto', situacao: 'freelancer', familia: 'sozinho' }
    render(<ScreeningPanel answers={full} onChange={vi.fn()} onNext={vi.fn()} />)
    expect(screen.getByText('Próxima Etapa →')).not.toBeDisabled()
  })

  it('clicking objetivo chip calls onChange with objetivo set', () => {
    const onChange = vi.fn()
    render(<ScreeningPanel answers={empty} onChange={onChange} onNext={vi.fn()} />)
    fireEvent.click(screen.getByText('Trabalhar remotamente para empresa fora de Portugal'))
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ objetivo: 'remoto' }))
  })

  it('clicking "Próxima Etapa" when enabled calls onNext', () => {
    const onNext = vi.fn()
    const full: ScreeningAnswers = { objetivo: 'remoto', situacao: 'freelancer', familia: 'sozinho' }
    render(<ScreeningPanel answers={full} onChange={vi.fn()} onNext={onNext} />)
    fireEvent.click(screen.getByText('Próxima Etapa →'))
    expect(onNext).toHaveBeenCalled()
  })

  it('selected chip has bg-[#1A1A1A] class', () => {
    const answers: ScreeningAnswers = { objetivo: 'remoto', situacao: null, familia: null }
    render(<ScreeningPanel answers={answers} onChange={vi.fn()} onNext={vi.fn()} />)
    const selectedChip = screen.getByText('Trabalhar remotamente para empresa fora de Portugal')
    expect(selectedChip.closest('button')).toHaveClass('bg-[#1A1A1A]')
  })
})
