import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import VisaTypeTabs from '@/components/VisaTypeTabs'

describe('VisaTypeTabs', () => {
  it('renders all three tabs', () => {
    render(<VisaTypeTabs active="D7" onChange={vi.fn()} />)
    expect(screen.getByText(/D7/)).toBeInTheDocument()
    expect(screen.getByText(/D8/)).toBeInTheDocument()
    expect(screen.getByText(/D2/)).toBeInTheDocument()
  })

  it('clicking D8 tab calls onChange with D8', () => {
    const onChange = vi.fn()
    render(<VisaTypeTabs active="D7" onChange={onChange} />)
    fireEvent.click(screen.getByText(/D8/))
    expect(onChange).toHaveBeenCalledWith('D8')
  })

  it('active tab has dark background', () => {
    render(<VisaTypeTabs active="D2" onChange={vi.fn()} />)
    const d2Tab = screen.getByText(/D2/).closest('button')
    expect(d2Tab).toHaveClass('bg-[#1A1A1A]')
  })
})
