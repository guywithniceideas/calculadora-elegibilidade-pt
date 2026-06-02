import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import VisaCompatibilityCards from '@/components/VisaCompatibilityCards'
import type { VisaScore } from '@/lib/types'

const mockScores: VisaScore[] = [
  { visaId: 'D8', label: 'D8 — Nômade Digital', description: 'Trabalho remoto para o exterior', score: 70 },
  { visaId: 'D2', label: 'D2 — Empreendedor', description: 'Empresa própria ou autônomo', score: 45 },
  { visaId: 'D7', label: 'D7 — Renda Passiva', description: 'Aposentadoria, dividendos, aluguéis', score: 15 },
]

describe('VisaCompatibilityCards', () => {
  it('renders 3 visa labels', () => {
    render(<VisaCompatibilityCards scores={mockScores} step={1} />)
    expect(screen.getByText('D8 — Nômade Digital')).toBeInTheDocument()
    expect(screen.getByText('D2 — Empreendedor')).toBeInTheDocument()
    expect(screen.getByText('D7 — Renda Passiva')).toBeInTheDocument()
  })

  it('renders percentage for each visa', () => {
    render(<VisaCompatibilityCards scores={mockScores} step={1} />)
    expect(screen.getByText('70%')).toBeInTheDocument()
    expect(screen.getByText('45%')).toBeInTheDocument()
    expect(screen.getByText('15%')).toBeInTheDocument()
  })

  it('in step 2, active visa card has border-[#1A1A1A]', () => {
    const { container } = render(
      <VisaCompatibilityCards scores={mockScores} step={2} activeVisaId="D8" />
    )
    const cards = container.querySelectorAll('.border-\\[\\#1A1A1A\\]')
    expect(cards.length).toBe(1)
  })

  it('renders description', () => {
    render(<VisaCompatibilityCards scores={mockScores} step={1} />)
    expect(screen.getByText('Trabalho remoto para o exterior')).toBeInTheDocument()
  })
})
