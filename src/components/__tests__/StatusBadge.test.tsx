import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import StatusBadge from '@/components/StatusBadge'

describe('StatusBadge', () => {
  it('renders "Perfil Elegível" for eligible', () => {
    render(<StatusBadge status="eligible" />)
    expect(screen.getByText('Perfil Elegível')).toBeInTheDocument()
  })
  it('renders "Parcialmente Elegível" for partial', () => {
    render(<StatusBadge status="partial" />)
    expect(screen.getByText('Parcialmente Elegível')).toBeInTheDocument()
  })
  it('renders "Não Elegível" for ineligible', () => {
    render(<StatusBadge status="ineligible" />)
    expect(screen.getByText('Não Elegível')).toBeInTheDocument()
  })
})
