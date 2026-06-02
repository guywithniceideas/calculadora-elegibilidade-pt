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

describe('InputPanel', () => {
  it('renders renda input', () => {
    render(<InputPanel input={defaultInput} onChange={vi.fn()} />)
    expect(screen.getByLabelText('Renda mensal comprovável (€)')).toBeInTheDocument()
  })

  it('renders poupança input', () => {
    render(<InputPanel input={defaultInput} onChange={vi.fn()} />)
    expect(screen.getByLabelText('Poupança em conta PT (€)')).toBeInTheDocument()
  })

  it('changing renda calls onChange with updated monthlyIncome', () => {
    const onChange = vi.fn()
    render(<InputPanel input={defaultInput} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Renda mensal comprovável (€)'), { target: { value: '1500' } })
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ monthlyIncome: 1500 }))
  })

  it('CPLP toggle calls onChange with hasCPLPTerm: true', () => {
    const onChange = vi.fn()
    render(<InputPanel input={defaultInput} onChange={onChange} />)
    fireEvent.click(screen.getByLabelText('Cidadão CPLP com Termo de Responsabilidade'))
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ hasCPLPTerm: true }))
  })

  it('Modo Conservador toggle only visible for D8', () => {
    const { rerender } = render(<InputPanel input={defaultInput} onChange={vi.fn()} />)
    expect(screen.queryByLabelText('Modo Conservador')).not.toBeInTheDocument()
    rerender(<InputPanel input={{ ...defaultInput, visaType: 'D8' }} onChange={vi.fn()} />)
    expect(screen.getByLabelText('Modo Conservador')).toBeInTheDocument()
  })

  it('Capital da empresa field only visible for D2', () => {
    const { rerender } = render(<InputPanel input={defaultInput} onChange={vi.fn()} />)
    expect(screen.queryByLabelText('Capital alocado à empresa (€)')).not.toBeInTheDocument()
    rerender(<InputPanel input={{ ...defaultInput, visaType: 'D2' }} onChange={vi.fn()} />)
    expect(screen.getByLabelText('Capital alocado à empresa (€)')).toBeInTheDocument()
  })
})
