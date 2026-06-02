import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/components/DownloadPdfButton', () => ({
  default: () => <button>PDF</button>,
}))

import ResultPanel from '@/components/ResultPanel'
import type { CalculatorInput, CalculatorResult } from '@/lib/types'

const defaultInput: CalculatorInput = {
  visaType: 'D7',
  monthlyIncome: 1000,
  savingsInPortugal: 12000,
  family: { spouses: 0, children: 0, adultDependents: 0 },
  hasCPLPTerm: false,
  conservativeMode: false,
  businessCapital: 0,
}

const eligibleResult: CalculatorResult = {
  requiredMonthlyIncome: 920,
  requiredSavings: 11040,
  incomeStatus: 'pass',
  savingsStatus: 'pass',
  incomePercent: 110,
  savingsPercent: 100,
  overallStatus: 'eligible',
  alerts: [],
}

describe('ResultPanel', () => {
  it('shows required income value', () => {
    render(<ResultPanel result={eligibleResult} input={defaultInput} topVisaScore={99} onRequestReport={vi.fn()} />)
    expect(screen.getByText('€ 920,00')).toBeInTheDocument()
  })

  it('shows required savings value', () => {
    render(<ResultPanel result={eligibleResult} input={defaultInput} topVisaScore={99} onRequestReport={vi.fn()} />)
    expect(screen.getByText('€ 11.040,00')).toBeInTheDocument()
  })

  it('score 99 shows Perfil Altamente Compatível badge', () => {
    render(<ResultPanel result={eligibleResult} input={defaultInput} topVisaScore={99} onRequestReport={vi.fn()} />)
    expect(screen.getByText('Perfil Altamente Compatível')).toBeInTheDocument()
  })

  it('score 80 shows Compatibilidade Moderada badge', () => {
    render(<ResultPanel result={eligibleResult} input={defaultInput} topVisaScore={80} onRequestReport={vi.fn()} />)
    expect(screen.getByText('Compatibilidade Moderada')).toBeInTheDocument()
  })

  it('PDF button shows correct copy', () => {
    render(<ResultPanel result={eligibleResult} input={defaultInput} topVisaScore={99} onRequestReport={vi.fn()} />)
    expect(screen.getByText('Receber Relatório Preliminar em PDF (Para mandar para Assessoria Jurídica)')).toBeInTheDocument()
  })

  it('disclaimer is visible', () => {
    render(<ResultPanel result={eligibleResult} input={defaultInput} topVisaScore={99} onRequestReport={vi.fn()} />)
    expect(screen.getByText(/não substitui uma consulta jurídica/i)).toBeInTheDocument()
  })

  it('clicking button calls onRequestReport', () => {
    const onRequestReport = vi.fn()
    render(<ResultPanel result={eligibleResult} input={defaultInput} topVisaScore={99} onRequestReport={onRequestReport} />)
    screen.getByText('Receber Relatório Preliminar em PDF (Para mandar para Assessoria Jurídica)').click()
    expect(onRequestReport).toHaveBeenCalled()
  })

  it('shows alert when present', () => {
    const resultWithAlert = {
      ...eligibleResult,
      alerts: [{ type: 'warning' as const, title: 'Poupança insuficiente', message: 'Falta R$ 1.000' }],
    }
    render(<ResultPanel result={resultWithAlert} input={defaultInput} topVisaScore={80} onRequestReport={vi.fn()} />)
    expect(screen.getByText('Poupança insuficiente')).toBeInTheDocument()
  })
})
