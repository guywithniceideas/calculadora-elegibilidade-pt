import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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

  it('clicking objetivo option calls onChange with objetivo set', () => {
    const onChange = vi.fn()
    render(<ScreeningPanel answers={empty} onChange={onChange} onNext={vi.fn()} />)
    fireEvent.click(screen.getByText('Trabalhar remotamente para empresa fora de Portugal'))
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ objetivo: 'remoto' }))
  })

  it('selected option has bg-[#1A1A1A] class', () => {
    const answers: ScreeningAnswers = { objetivo: 'remoto', situacao: null, familia: null }
    render(<ScreeningPanel answers={answers} onChange={vi.fn()} onNext={vi.fn()} />)
    const selectedOption = screen.getByText('Trabalhar remotamente para empresa fora de Portugal')
    expect(selectedOption.closest('button')).toHaveClass('bg-[#1A1A1A]')
  })

  it('auto-advances to the next question after selecting an option', async () => {
    render(<ScreeningPanel answers={empty} onChange={vi.fn()} onNext={vi.fn()} />)
    fireEvent.click(screen.getByText('Trabalhar remotamente para empresa fora de Portugal'))
    expect(await screen.findByText('Pergunta 2 de 3', {}, { timeout: 1500 })).toBeInTheDocument()
  })

  it('calls onNext automatically after answering the last question, with no button to click', async () => {
    const onNext = vi.fn()
    render(<ScreeningPanel answers={empty} onChange={vi.fn()} onNext={onNext} />)

    fireEvent.click(screen.getByText('Trabalhar remotamente para empresa fora de Portugal'))
    await screen.findByText('Pergunta 2 de 3', {}, { timeout: 1500 })

    fireEvent.click(screen.getByText('Freelancer / prestador de serviços independente'))
    await screen.findByText('Pergunta 3 de 3', {}, { timeout: 1500 })

    fireEvent.click(screen.getByText('Vou sozinho'))
    await waitFor(() => expect(onNext).toHaveBeenCalledTimes(1), { timeout: 1500 })
  })

  it('never renders a manual "Ver Resultado" confirmation button', () => {
    const full: ScreeningAnswers = { objetivo: 'remoto', situacao: 'freelancer', familia: 'sozinho' }
    render(<ScreeningPanel answers={full} onChange={vi.fn()} onNext={vi.fn()} />)
    expect(screen.queryByText('Ver Resultado →')).not.toBeInTheDocument()
  })
})
