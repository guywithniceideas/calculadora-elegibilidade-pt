import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import StepIndicator from '@/components/StepIndicator'

describe('StepIndicator', () => {
  it('shows "Perfil do Visto" and "Análise de Renda"', () => {
    render(<StepIndicator step={1} />)
    expect(screen.getByText('Perfil do Visto')).toBeInTheDocument()
    expect(screen.getByText('Análise de Renda')).toBeInTheDocument()
  })

  it('step 1: circle shows "1"', () => {
    render(<StepIndicator step={1} />)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('step 2: circle 1 shows checkmark, circle 2 shows "2"', () => {
    render(<StepIndicator step={2} />)
    expect(screen.getByText('✓')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })
})
