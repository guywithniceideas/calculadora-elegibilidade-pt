import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ProgressBar from '@/components/ProgressBar'

describe('ProgressBar', () => {
  it('renders percentage label', () => {
    const { getByText } = render(<ProgressBar percent={75} status="warning" label="Poupança" />)
    expect(getByText('75%')).toBeInTheDocument()
  })
  it('renders label', () => {
    const { getByText } = render(<ProgressBar percent={110} status="pass" label="Renda" />)
    expect(getByText('Renda')).toBeInTheDocument()
  })
})
