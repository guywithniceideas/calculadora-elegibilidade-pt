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

  it('CPLP toggle calls onChange with hasCPLPTerm: true', () => {
    const onChange = vi.fn()
    render(<InputPanel input={defaultInput} onChange={onChange} {...defaultExtraProps} />)
    fireEvent.click(screen.getByLabelText('Cidadão CPLP com Termo de Responsabilidade'))
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ hasCPLPTerm: true }))
  })

  it('Modo Conservador toggle only visible for D8', () => {
    const { rerender } = render(<InputPanel input={defaultInput} onChange={vi.fn()} {...defaultExtraProps} />)
    expect(screen.queryByLabelText('Modo Conservador')).not.toBeInTheDocument()
    rerender(<InputPanel input={{ ...defaultInput, visaType: 'D8' }} onChange={vi.fn()} {...defaultExtraProps} />)
    expect(screen.getByLabelText('Modo Conservador')).toBeInTheDocument()
  })

  it('Capital da empresa field only visible for D2', () => {
    const { rerender } = render(<InputPanel input={defaultInput} onChange={vi.fn()} {...defaultExtraProps} />)
    expect(screen.queryByLabelText('Capital alocado à empresa (€)')).not.toBeInTheDocument()
    rerender(<InputPanel input={{ ...defaultInput, visaType: 'D2' }} onChange={vi.fn()} {...defaultExtraProps} />)
    expect(screen.getByLabelText('Capital alocado à empresa (€)')).toBeInTheDocument()
  })

  it('BRL savings disabled when EUR currency selected', () => {
    const { container } = render(
      <InputPanel
        input={defaultInput}
        onChange={vi.fn()}
        {...defaultExtraProps}
        savingsCurrency="EUR"
        savingsEUR={5000}
      />
    )
    // BRL div should have opacity-40 class
    const brlDiv = container.querySelector('.opacity-40')
    expect(brlDiv).toBeInTheDocument()
  })

  it('EUR savings disabled when BRL currency selected', () => {
    const { container } = render(
      <InputPanel
        input={defaultInput}
        onChange={vi.fn()}
        {...defaultExtraProps}
        savingsCurrency="BRL"
        savingsBRL={15000}
      />
    )
    const eurDiv = container.querySelector('.opacity-40')
    expect(eurDiv).toBeInTheDocument()
  })
})
