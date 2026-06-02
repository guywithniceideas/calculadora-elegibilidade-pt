import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import EmailModal from '@/components/EmailModal'

describe('EmailModal', () => {
  it('renders name and email fields', () => {
    render(<EmailModal onConfirm={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByPlaceholderText('Nome Sobrenome')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument()
  })

  it('close button calls onClose', () => {
    const onClose = vi.fn()
    render(<EmailModal onConfirm={vi.fn()} onClose={onClose} />)
    fireEvent.click(screen.getByLabelText('Fechar modal'))
    expect(onClose).toHaveBeenCalled()
  })

  it('submit with empty fields shows errors', () => {
    render(<EmailModal onConfirm={vi.fn()} onClose={vi.fn()} />)
    fireEvent.click(screen.getByText('Receber meu relatório →'))
    expect(screen.getByText('Nome obrigatório')).toBeInTheDocument()
    expect(screen.getByText('Email inválido')).toBeInTheDocument()
  })

  it('submit with valid fields calls onConfirm', () => {
    const onConfirm = vi.fn()
    render(<EmailModal onConfirm={onConfirm} onClose={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText('Nome Sobrenome'), { target: { value: 'João Silva' } })
    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), { target: { value: 'joao@email.com' } })
    fireEvent.click(screen.getByText('Receber meu relatório →'))
    expect(onConfirm).toHaveBeenCalledWith('João Silva', 'joao@email.com')
  })

  it('invalid email format shows error', () => {
    render(<EmailModal onConfirm={vi.fn()} onClose={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText('Nome Sobrenome'), { target: { value: 'João' } })
    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), { target: { value: 'nao-e-email' } })
    fireEvent.click(screen.getByText('Receber meu relatório →'))
    expect(screen.getByText('Email inválido')).toBeInTheDocument()
  })
})
