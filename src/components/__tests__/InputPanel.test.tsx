import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import InputPanel from '@/components/InputPanel'
import type { CalculatorInput } from '@/lib/types'

const defaultInput: CalculatorInput = {
  visaType: 'D7',
  monthlyIncome: 0,
  savingsInPortugal: 0,
  family: { spouses: 0, children: 0, adultDependents: 0 },
  hasCPLPTerm: false,
  conservativeMode: false,
  businessCapital: 0,
}

const defaultExtraProps = {
  exchangeRate: 5.85,
  incomeBRL: 0,
  onIncomeBRLChange: vi.fn(),
  savingsBRL: 0,
  savingsEUR: 0,
  savingsCurrency: null as 'BRL' | 'EUR' | null,
  onSavingsBRLChange: vi.fn(),
  onSavingsEURChange: vi.fn(),
}

describe('InputPanel', () => {
  it('renders poupança label', () => {
    render(<InputPanel input={defaultInput} onChange={vi.fn()} {...defaultExtraProps} />)
    expect(screen.getByText(/Poupança em conta PT/)).toBeInTheDocument()
  })

  it('renders renda mensal label', () => {
    render(<InputPanel input={defaultInput} onChange={vi.fn()} {...defaultExtraProps} />)
    expect(screen.getByText('Renda mensal comprovável')).toBeInTheDocument()
  })

  it('Capital da empresa field only visible for D2', () => {
    const { rerender } = render(<InputPanel input={defaultInput} onChange={vi.fn()} {...defaultExtraProps} />)
    expect(screen.queryByLabelText('Capital alocado à empresa (€)')).not.toBeInTheDocument()
    rerender(<InputPanel input={{ ...defaultInput, visaType: 'D2' }} onChange={vi.fn()} {...defaultExtraProps} />)
    expect(screen.getByLabelText('Capital alocado à empresa (€)')).toBeInTheDocument()
  })

  it('shows EUR value in the savings input when savingsCurrency is EUR', () => {
    render(
      <InputPanel
        input={defaultInput}
        onChange={vi.fn()}
        {...defaultExtraProps}
        savingsCurrency="EUR"
        savingsEUR={5000}
      />
    )
    expect(screen.getByDisplayValue('5000')).toBeInTheDocument()
  })

  it('shows BRL value in the savings input when savingsCurrency is BRL', () => {
    render(
      <InputPanel
        input={defaultInput}
        onChange={vi.fn()}
        {...defaultExtraProps}
        savingsCurrency="BRL"
        savingsBRL={15000}
      />
    )
    expect(screen.getByDisplayValue('15000')).toBeInTheDocument()
  })

  it('clicking the EUR pill clears an existing BRL value', () => {
    const onSavingsBRLChange = vi.fn()
    render(
      <InputPanel
        input={defaultInput}
        onChange={vi.fn()}
        {...defaultExtraProps}
        onSavingsBRLChange={onSavingsBRLChange}
        savingsCurrency="BRL"
        savingsBRL={15000}
      />
    )
    fireEvent.click(screen.getByText('EUR'))
    expect(onSavingsBRLChange).toHaveBeenCalledWith(0)
  })
})
