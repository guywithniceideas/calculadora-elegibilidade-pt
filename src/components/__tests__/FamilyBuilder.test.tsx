import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import FamilyBuilder from '@/components/FamilyBuilder'
import type { FamilyComposition } from '@/lib/types'

const empty: FamilyComposition = { spouses: 0, children: 0, adultDependents: 0 }

describe('FamilyBuilder', () => {
  it('always shows Titular row', () => {
    render(<FamilyBuilder family={empty} onChange={vi.fn()} />)
    expect(screen.getByText('Titular')).toBeInTheDocument()
  })

  it('toggling cônjuge switch calls onChange with spouses: 1', () => {
    const onChange = vi.fn()
    render(<FamilyBuilder family={empty} onChange={onChange} />)
    fireEvent.click(screen.getByLabelText('Cônjuge vem com você'))
    expect(onChange).toHaveBeenCalledWith({ spouses: 1, children: 0, adultDependents: 0 })
  })

  it('toggling cônjuge switch off calls onChange with spouses: 0', () => {
    const onChange = vi.fn()
    render(<FamilyBuilder family={{ ...empty, spouses: 1 }} onChange={onChange} />)
    fireEvent.click(screen.getByLabelText('Cônjuge vem com você'))
    expect(onChange).toHaveBeenCalledWith({ spouses: 0, children: 0, adultDependents: 0 })
  })

  it('clicking adicionar filho calls onChange with children: 1', () => {
    const onChange = vi.fn()
    render(<FamilyBuilder family={empty} onChange={onChange} />)
    fireEvent.click(screen.getByLabelText('Adicionar filho'))
    expect(onChange).toHaveBeenCalledWith({ spouses: 0, children: 1, adultDependents: 0 })
  })

  it('remover filho is disabled when children is 0', () => {
    render(<FamilyBuilder family={empty} onChange={vi.fn()} />)
    expect(screen.getByLabelText('Remover filho')).toBeDisabled()
  })

  it('cônjuge switch reflects checked state via aria-checked', () => {
    render(<FamilyBuilder family={{ ...empty, spouses: 1 }} onChange={vi.fn()} />)
    expect(screen.getByLabelText('Cônjuge vem com você')).toHaveAttribute('aria-checked', 'true')
  })
})
