'use client'
import { useState } from 'react'

interface Props {
  onAuthenticated: (name: string, username: string) => void
}

const ERROR_MESSAGES: Record<string, string> = {
  name_required: 'Informe seu nome.',
  invalid_username: 'Informe seu email.',
  invalid_password: 'A senha precisa ter pelo menos 6 caracteres.',
  username_taken: 'Esse email já está cadastrado. Faça login.',
  invalid_credentials: 'Email ou senha incorretos.',
  server_error: 'Erro no servidor. Tente novamente.',
}

function errorMessage(code: string | undefined): string {
  if (!code) return 'Algo deu errado. Tente novamente.'
  return ERROR_MESSAGES[code] ?? 'Algo deu errado. Tente novamente.'
}

export default function AuthGate({ onAuthenticated }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function switchMode(next: 'login' | 'register') {
    setMode(next)
    setError(null)
    setPassword('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (mode === 'register' && !name.trim()) {
      setError(errorMessage('name_required'))
      return
    }
    if (!username.trim() || !password) {
      setError(mode === 'login' ? errorMessage('invalid_credentials') : 'Preencha email e senha.')
      return
    }

    setLoading(true)
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const body = mode === 'login'
        ? { username: username.trim(), password }
        : { name: name.trim(), username: username.trim(), password }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(errorMessage(data.error))
        return
      }
      onAuthenticated(data.name, data.username)
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#F2F2F2' }}>
      <div className="bg-white rounded-3xl shadow-sm p-8 w-full max-w-sm border border-[#E8E5E0]">

        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/pt-flag.png" alt="Portugal" className="h-6 w-auto" />
          <span className="text-sm font-extrabold text-[#1A1A1A] tracking-tight leading-tight">
            Calculadora de Elegibilidade PT
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-[#EFEFEF] rounded-2xl p-1">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${
              mode === 'login' ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-[#888] hover:text-[#1A1A1A]'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${
              mode === 'register' ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-[#888] hover:text-[#1A1A1A]'
            }`}
          >
            Criar conta
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <h2 className="text-base font-bold text-[#1A1A1A] mb-1">
            {mode === 'login' ? 'Acesse sua conta' : 'Crie sua conta'}
          </h2>
          <p className="text-xs text-[#777] mb-5">
            {mode === 'login'
              ? 'Entre com seu email e senha.'
              : 'Use seu email e escolha uma senha para acessar a calculadora.'}
          </p>

          {mode === 'register' && (
            <div className="mb-3">
              <label className="block text-[11px] font-semibold text-[#555] mb-1.5">
                Seu nome completo
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Nome Sobrenome"
                autoComplete="name"
                className="w-full bg-[#EFEFEF] rounded-xl px-3 py-2.5 text-sm font-semibold text-[#1A1A1A] placeholder:text-[#BBB] outline-none focus:ring-2 focus:ring-[#1A1A1A]/20 transition-all"
              />
            </div>
          )}

          <div className="mb-3">
            <label className="block text-[11px] font-semibold text-[#555] mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="seu@email.com"
              autoComplete="email"
              className="w-full bg-[#EFEFEF] rounded-xl px-3 py-2.5 text-sm font-semibold text-[#1A1A1A] placeholder:text-[#BBB] outline-none focus:ring-2 focus:ring-[#1A1A1A]/20 transition-all"
            />
          </div>

          <div className="mb-4">
            <label className="block text-[11px] font-semibold text-[#555] mb-1.5">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className="w-full bg-[#EFEFEF] rounded-xl px-3 py-2.5 text-sm font-semibold text-[#1A1A1A] placeholder:text-[#BBB] outline-none focus:ring-2 focus:ring-[#1A1A1A]/20 transition-all"
            />
          </div>

          {error && <p className="text-[11px] text-red-500 mb-3">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1A1A1A] text-white py-3 rounded-2xl text-sm font-bold hover:bg-[#333] transition-colors disabled:opacity-50"
          >
            {loading
              ? (mode === 'login' ? 'Entrando...' : 'Criando conta...')
              : (mode === 'login' ? 'Entrar →' : 'Criar conta →')}
          </button>
        </form>
      </div>
    </div>
  )
}
