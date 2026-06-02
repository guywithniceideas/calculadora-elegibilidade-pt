import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import FamilyBuilder from '@/components/FamilyBuilder'
import type { FamilyComposition } from '@/lib/types'

const empty: FamilyComposition = { spouses: 0, children: 0, adultDependents: 0 }

describe('FamilyBuilder', () => {
  it('always shows Titular chip', () => {
    render(<FamilyBuilder family={empty} onChange={vi.fn()} />)
    expect(screen.getByText('Titular')).toBeInTheDocument()
  })

  it('clicking + Cônjuge calls onChange with spouses: 1', () => {
    const onChange = vi.fn()
    render(<FamilyBuilder family={empty} onChange={onChange} />)
    fireEvent.click(screen.getByText('+ Cônjuge'))
    expect(onChange).toHaveBeenCalledWith({ spouses: 1, children: 0, adultDependents: 0 })
  })

  it('clicking + Filho calls onChange with children: 1', () => {
    const onChange = vi.fn()
    render(<FamilyBuilder family={empty} onChange={onChange} />)
    fireEvent.click(screen.getByText('+ Filho'))
    expect(onChange).toHaveBeenCalledWith({ spouses: 0, children: 1, adultDependents: 0 })
  })

  it('+ Cônjuge button is hidden when spouses is already 1', () => {
    render(<FamilyBuilder family={{ ...empty, spouses: 1 }} onChange={vi.fn()} />)
    expect(screen.queryByText('+ Cônjuge')).not.toBeInTheDocument()
  })

  it('shows remove button on Cônjuge chip when spouses: 1', () => {
    const onChange = vi.fn()
    render(<FamilyBuilder family={{ ...empty, spouses: 1 }} onChange={onChange} />)
    const removeBtn = screen.getByLabelText('Remover cônjuge')
    fireEvent.click(removeBtn)
    expect(onChange).toHaveBeenCalledWith({ spouses: 0, children: 0, adultDependents: 0 })
  })
})
