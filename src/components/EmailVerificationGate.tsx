'use client'
import { useState, useRef, useEffect } from 'react'

interface Props {
  onVerified: (name: string, email: string) => void
}

export default function EmailVerificationGate({ onVerified }: Props) {
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)
  const codeRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!name.trim()) { setError('Nome obrigatório'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Email inválido'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.toLowerCase() }),
      })
      if (!res.ok) throw new Error()
      setStep('code')
      setCooldown(30)
      setCode(['', '', '', '', '', ''])
      setTimeout(() => codeRefs.current[0]?.focus(), 100)
    } catch {
      setError('Erro ao enviar o código. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const fullCode = code.join('')
    if (fullCode.length < 6) { setError('Digite todos os 6 dígitos'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: fullCode }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.error === 'expired') {
          setError('Código expirado. Solicite um novo.')
          setStep('email')
          setCode(['', '', '', '', '', ''])
        } else if (data.error === 'max_attempts') {
          setError('Muitas tentativas. Solicite um novo código.')
          setStep('email')
          setCode(['', '', '', '', '', ''])
        } else if (data.error === 'invalid') {
          setError(`Código incorreto. ${data.attemptsLeft} tentativa(s) restante(s).`)
          setCode(['', '', '', '', '', ''])
          setTimeout(() => codeRefs.current[0]?.focus(), 100)
        }
        return
      }
      onVerified(data.name, data.email)
    } catch {
      setError('Erro ao verificar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  function handleCodeInput(index: number, value: string) {
    if (!/^\d*$/.test(value)) return
    const newCode = [...code]
    newCode[index] = value.slice(-1)
    setCode(newCode)
    if (value && index < 5) codeRefs.current[index + 1]?.focus()
  }

  function handleCodeKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus()
    }
  }

  async function handleResend() {
    if (cooldown > 0 || loading) return
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      })
      if (!res.ok) throw new Error()
      setCooldown(30)
      setCode(['', '', '', '', '', ''])
      setTimeout(() => codeRefs.current[0]?.focus(), 100)
    } catch {
      setError('Erro ao reenviar. Tente novamente.')
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

        {step === 'email' ? (
          <form onSubmit={handleSendCode}>
            <h2 className="text-base font-bold text-[#1A1A1A] mb-1">
              Para acessar, confirme seu email
            </h2>
            <p className="text-xs text-[#777] mb-5">
              Você receberá um código de 6 dígitos válido por 10 minutos.
            </p>

            <div className="mb-3">
              <label className="block text-[11px] font-semibold text-[#555] mb-1.5">
                Seu nome completo
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Nome Sobrenome"
                className="w-full bg-[#EFEFEF] rounded-xl px-3 py-2.5 text-sm font-semibold text-[#1A1A1A] placeholder:text-[#BBB] outline-none focus:ring-2 focus:ring-[#1A1A1A]/20 transition-all"
              />
            </div>

            <div className="mb-4">
              <label className="block text-[11px] font-semibold text-[#555] mb-1.5">
                Seu email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-[#EFEFEF] rounded-xl px-3 py-2.5 text-sm font-semibold text-[#1A1A1A] placeholder:text-[#BBB] outline-none focus:ring-2 focus:ring-[#1A1A1A]/20 transition-all"
              />
            </div>

            {error && <p className="text-[11px] text-red-500 mb-3">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1A1A1A] text-white py-3 rounded-2xl text-sm font-bold hover:bg-[#333] transition-colors disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar código →'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode}>
            <h2 className="text-base font-bold text-[#1A1A1A] mb-1">Olá, {name}!</h2>
            <p className="text-xs text-[#777] mb-1">Código enviado para</p>
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xs font-semibold text-[#1A1A1A]">{email}</span>
              <button
                type="button"
                onClick={() => { setStep('email'); setError(null); setCode(['', '', '', '', '', '']) }}
                className="text-[11px] text-[#998a72] hover:text-[#7a6e5a] font-semibold transition-colors"
              >
                ← Trocar
              </button>
            </div>

            <div className="flex gap-2 mb-4 justify-center">
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { codeRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleCodeInput(i, e.target.value)}
                  onKeyDown={e => handleCodeKeyDown(i, e)}
                  className="w-10 h-12 text-center text-lg font-black text-[#1A1A1A] bg-[#EFEFEF] rounded-xl outline-none focus:ring-2 focus:ring-[#1A1A1A]/20 transition-all"
                />
              ))}
            </div>

            {error && <p className="text-[11px] text-red-500 mb-3 text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1A1A1A] text-white py-3 rounded-2xl text-sm font-bold hover:bg-[#333] transition-colors disabled:opacity-50 mb-3"
            >
              {loading ? 'Verificando...' : 'Verificar e acessar →'}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || loading}
              className="w-full text-xs text-[#666] disabled:opacity-40 hover:text-[#1A1A1A] transition-colors"
            >
              {cooldown > 0
                ? `Não recebeu? Reenviar código (${cooldown}s)`
                : 'Não recebeu? Reenviar código'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
