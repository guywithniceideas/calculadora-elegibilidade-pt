import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/components/DownloadPdfButton', () => ({
  default: () => <button>Baixar Relatório de Elegibilidade (PDF)</button>,
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

const partialResult: CalculatorResult = {
  ...eligibleResult,
  savingsStatus: 'warning',
  savingsPercent: 80,
  overallStatus: 'partial',
  alerts: [{ type: 'warning', title: 'Poupança insuficiente', message: 'Precisa de mais €2.000' }],
}

describe('ResultPanel', () => {
  it('shows required income value', () => {
    render(<ResultPanel result={eligibleResult} input={defaultInput} />)
    expect(screen.getByText('€ 920,00')).toBeInTheDocument()
  })

  it('shows required savings value', () => {
    render(<ResultPanel result={eligibleResult} input={defaultInput} />)
    expect(screen.getByText('€ 11.040,00')).toBeInTheDocument()
  })

  it('shows alert title when alerts exist', () => {
    render(<ResultPanel result={partialResult} input={defaultInput} />)
    expect(screen.getByText('Poupança insuficiente')).toBeInTheDocument()
  })

  it('PDF button is present', () => {
    render(<ResultPanel result={eligibleResult} input={defaultInput} />)
    expect(screen.getByText(/Baixar Relatório/)).toBeInTheDocument()
  })
})
