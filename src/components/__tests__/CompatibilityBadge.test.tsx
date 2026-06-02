import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import CompatibilityBadge from '@/components/CompatibilityBadge'

describe('CompatibilityBadge', () => {
  it('score 99: shows "Perfil Altamente Compatível"', () => {
    render(<CompatibilityBadge score={99} />)
    expect(screen.getByText('Perfil Altamente Compatível')).toBeInTheDocument()
  })

  it('score 95: shows "Compatibilidade Alta"', () => {
    render(<CompatibilityBadge score={95} />)
    expect(screen.getByText('Compatibilidade Alta')).toBeInTheDocument()
  })

  it('score 80: shows "Compatibilidade Moderada"', () => {
    render(<CompatibilityBadge score={80} />)
    expect(screen.getByText('Compatibilidade Moderada')).toBeInTheDocument()
  })

  it('score 50: shows "Compatibilidade Baixa"', () => {
    render(<CompatibilityBadge score={50} />)
    expect(screen.getByText('Compatibilidade Baixa')).toBeInTheDocument()
  })

  it('score 0: shows "Compatibilidade Baixa"', () => {
    render(<CompatibilityBadge score={0} />)
    expect(screen.getByText('Compatibilidade Baixa')).toBeInTheDocument()
  })
})
