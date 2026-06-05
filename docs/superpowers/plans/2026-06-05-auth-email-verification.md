# Auth Email Verification — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add email OTP verification gate that appears when opening the app, replacing the existing EmailModal popup.

**Architecture:** 4 Next.js API routes handle OTP lifecycle (send/verify/me/logout) using JWT signed with AUTH_SECRET. Session stored in httpOnly cookie (7 days). Email sent via Resend SDK. EmailVerificationGate component gates the entire app until verified.

**Tech Stack:** Next.js 14 App Router, `resend` SDK, `jose` JWT library, React 18, TypeScript, Tailwind CSS v4.

---

## File Map

| File | Action |
|---|---|
| `src/app/api/auth/send-code/route.ts` | Create |
| `src/app/api/auth/verify-code/route.ts` | Create |
| `src/app/api/auth/me/route.ts` | Create |
| `src/app/api/auth/logout/route.ts` | Create |
| `src/components/EmailVerificationGate.tsx` | Create |
| `src/app/page.tsx` | Modify — auth state + conditional render |
| `src/components/EmailModal.tsx` | Delete |
| `src/components/__tests__/EmailModal.test.tsx` | Delete |
| `src/components/__tests__/ResultPanel.test.tsx` | Modify — update mock |

---

## Task 1: Install Dependencies

**Files:** `package.json`

- [ ] **Step 1: Install resend and jose**

```bash
npm install resend jose
```

Expected: both packages appear in `package.json` dependencies.

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install resend and jose for auth"
```

---

## Task 2: API Route — send-code

**Files:**
- Create: `src/app/api/auth/send-code/route.ts`

- [ ] **Step 1: Create the route**

Create `src/app/api/auth/send-code/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { Resend } from 'resend'
import crypto from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

function getSecret() {
  return new TextEncoder().encode(process.env.AUTH_SECRET)
}

function hashCode(code: string): string {
  return crypto.createHmac('sha256', process.env.AUTH_SECRET!).update(code).digest('hex')
}

export async function POST(req: NextRequest) {
  try {
    const { name, email } = await req.json()

    if (!name?.trim()) {
      return NextResponse.json({ error: 'name_required' }, { status: 400 })
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
    }

    const code = crypto.randomInt(100000, 999999).toString()
    const codeHash = hashCode(code)

    const token = await new SignJWT({
      name: name.trim(),
      email: email.toLowerCase(),
      codeHash,
      attempts: 0,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('10m')
      .sign(getSecret())

    await resend.emails.send({
      from: process.env.AUTH_EMAIL_FROM!,
      to: email,
      subject: 'Seu código de acesso — Calculadora de Elegibilidade PT',
      html: `
        <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#ffffff;">
          <p style="font-size:18px;font-weight:800;color:#1A1A1A;margin:0 0 4px;">Calculadora de Elegibilidade PT</p>
          <p style="color:#666;font-size:13px;margin:0 0 32px;">Verificação de acesso</p>
          <p style="color:#444;margin:0 0 8px;font-size:14px;">Olá, ${name.trim()}!</p>
          <p style="color:#666;font-size:13px;margin:0 0 20px;">Seu código de verificação é:</p>
          <div style="background:#F2F2F2;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;letter-spacing:10px;">
            <span style="font-size:36px;font-weight:900;color:#1A1A1A;">${code}</span>
          </div>
          <p style="color:#999;font-size:12px;margin:0;">Válido por 10 minutos. Não compartilhe este código.</p>
        </div>
      `,
    })

    const response = NextResponse.json({ success: true })
    response.cookies.set('otp_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    })
    return response
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/auth/send-code/route.ts
git commit -m "feat: auth API — send-code route with Resend email"
```

---

## Task 3: API Route — verify-code

**Files:**
- Create: `src/app/api/auth/verify-code/route.ts`

- [ ] **Step 1: Create the route**

Create `src/app/api/auth/verify-code/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { SignJWT, jwtVerify } from 'jose'
import crypto from 'crypto'

function getSecret() {
  return new TextEncoder().encode(process.env.AUTH_SECRET)
}

function hashCode(code: string): string {
  return crypto.createHmac('sha256', process.env.AUTH_SECRET!).update(code).digest('hex')
}

interface OtpPayload {
  name: string
  email: string
  codeHash: string
  attempts: number
}

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json()

    const otpToken = req.cookies.get('otp_token')?.value
    if (!otpToken) {
      return NextResponse.json({ error: 'expired' }, { status: 401 })
    }

    let payload: OtpPayload
    try {
      const { payload: p } = await jwtVerify(otpToken, getSecret())
      payload = p as OtpPayload
    } catch {
      return NextResponse.json({ error: 'expired' }, { status: 401 })
    }

    const submittedHash = hashCode((code?.trim() ?? ''))

    if (submittedHash !== payload.codeHash) {
      const newAttempts = payload.attempts + 1

      if (newAttempts >= 3) {
        const response = NextResponse.json({ error: 'max_attempts' }, { status: 401 })
        response.cookies.delete('otp_token')
        return response
      }

      const newToken = await new SignJWT({
        name: payload.name,
        email: payload.email,
        codeHash: payload.codeHash,
        attempts: newAttempts,
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('10m')
        .sign(getSecret())

      const response = NextResponse.json(
        { error: 'invalid', attemptsLeft: 3 - newAttempts },
        { status: 401 }
      )
      response.cookies.set('otp_token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 600,
        path: '/',
      })
      return response
    }

    // Code correct — create session JWT
    const sessionToken = await new SignJWT({ name: payload.name, email: payload.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(getSecret())

    const response = NextResponse.json({
      success: true,
      name: payload.name,
      email: payload.email,
    })
    response.cookies.delete('otp_token')
    response.cookies.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return response
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/auth/verify-code/route.ts
git commit -m "feat: auth API — verify-code route with attempt tracking"
```

---

## Task 4: API Routes — me + logout

**Files:**
- Create: `src/app/api/auth/me/route.ts`
- Create: `src/app/api/auth/logout/route.ts`

- [ ] **Step 1: Create me route**

Create `src/app/api/auth/me/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

function getSecret() {
  return new TextEncoder().encode(process.env.AUTH_SECRET)
}

export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('session_token')?.value
    if (!sessionToken) {
      return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
    }
    const { payload } = await jwtVerify(sessionToken, getSecret())
    return NextResponse.json({ name: payload.name, email: payload.email })
  } catch {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }
}
```

- [ ] **Step 2: Create logout route**

Create `src/app/api/auth/logout/route.ts`:

```typescript
import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('session_token')
  response.cookies.delete('otp_token')
  return response
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/auth/me/route.ts src/app/api/auth/logout/route.ts
git commit -m "feat: auth API — me and logout routes"
```

---

## Task 5: EmailVerificationGate Component

**Files:**
- Create: `src/components/EmailVerificationGate.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/EmailVerificationGate.tsx`:

```typescript
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
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/EmailVerificationGate.tsx
git commit -m "feat: EmailVerificationGate component with OTP flow"
```

---

## Task 6: Update page.tsx — Auth State + Conditional Render

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Read the current page.tsx**

Read `src/app/page.tsx` fully before editing.

- [ ] **Step 2: Add imports and auth state**

At the top of the file, add the import for `EmailVerificationGate`:

```typescript
import EmailVerificationGate from '@/components/EmailVerificationGate'
```

Inside the `Home()` component, add these state variables after the existing state declarations:

```typescript
const [authState, setAuthState] = useState<'loading' | 'unauthenticated' | 'authenticated'>('loading')
const [userName, setUserName] = useState('')
const [userEmail, setUserEmail] = useState('')
```

- [ ] **Step 3: Add auth check useEffect**

Add this `useEffect` AFTER the existing exchange rate `useEffect`:

```typescript
useEffect(() => {
  fetch('/api/auth/me')
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(({ name, email }: { name: string; email: string }) => {
      setUserName(name)
      setUserEmail(email)
      setAuthState('authenticated')
    })
    .catch(() => setAuthState('unauthenticated'))
}, [])
```

- [ ] **Step 4: Update handleRequestReport**

Find the existing `handleRequestReport` function:
```typescript
function handleRequestReport() {
  setShowEmailModal(true)
}
```

Replace with:
```typescript
function handleRequestReport() {
  setShowLoading(true)
}
```

- [ ] **Step 5: Remove showEmailModal state and EmailModal**

Remove the line:
```typescript
const [showEmailModal, setShowEmailModal] = useState(false)
```

Remove the `handleEmailConfirm` function entirely:
```typescript
function handleEmailConfirm(_name: string, _email: string) {
  setShowEmailModal(false)
  setShowLoading(true)
}
```

Remove the `EmailModal` JSX block at the bottom:
```typescript
{showEmailModal && (
  <EmailModal
    onConfirm={handleEmailConfirm}
    onClose={() => setShowEmailModal(false)}
  />
)}
```

- [ ] **Step 6: Add conditional render at the start of the return**

At the very beginning of the `return (...)` block, BEFORE the main `<div>`, add:

```typescript
if (authState === 'loading') {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F2F2F2' }}>
      <div className="w-8 h-8 border-2 border-[#E0E0E0] border-t-[#1A1A1A] rounded-full animate-spin" />
    </div>
  )
}

if (authState === 'unauthenticated') {
  return (
    <EmailVerificationGate
      onVerified={(name, email) => {
        setUserName(name)
        setUserEmail(email)
        setAuthState('authenticated')
      }}
    />
  )
}
```

- [ ] **Step 7: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 8: Run all tests**

```bash
npm run test:run
```

Some tests may fail because `EmailModal` is referenced. Note failures for Task 7.

- [ ] **Step 9: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: auth gate in page.tsx — check session on mount, conditional render"
```

---

## Task 7: Remove EmailModal + Fix Tests

**Files:**
- Delete: `src/components/EmailModal.tsx`
- Delete: `src/components/__tests__/EmailModal.test.tsx`
- Modify: `src/components/__tests__/ResultPanel.test.tsx`

- [ ] **Step 1: Delete EmailModal files**

```bash
rm "src/components/EmailModal.tsx"
rm "src/components/__tests__/EmailModal.test.tsx"
```

Or on Windows PowerShell:
```powershell
Remove-Item "src/components/EmailModal.tsx"
Remove-Item "src/components/__tests__/EmailModal.test.tsx"
```

- [ ] **Step 2: Update ResultPanel tests**

Read `src/components/__tests__/ResultPanel.test.tsx`.

The mock for `DownloadPdfButton` is still needed. But the test for "PDF button calls onRequestReport" should still work since `onRequestReport` prop is unchanged.

Verify the test still compiles with no import errors.

- [ ] **Step 3: Run all tests**

```bash
npm run test:run
```

Expected: all tests pass (109 → 104, losing the 5 EmailModal tests).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: remove EmailModal — replaced by EmailVerificationGate"
```

---

## Task 8: Build, Deploy and Configure Vercel

- [ ] **Step 1: Run production build**

```bash
npm run build
```

Expected: clean build, no errors.

- [ ] **Step 2: Push to GitHub**

```bash
git push origin master
```

- [ ] **Step 3: Deploy to Vercel**

```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
Set-Location "f:\Calculadora de Elegibilidade"
vercel --prod
```

- [ ] **Step 4: Verify the gate works in production**

Open https://calculadora-elegibilidade-pt.vercel.app in incognito mode.

Expected:
- [ ] Verification gate appears immediately
- [ ] Can enter name + email and receive code by email
- [ ] Entering correct code grants access to the app
- [ ] Closing and reopening within 7 days skips the gate

---

## Spec Coverage Checklist

| Requirement | Task |
|---|---|
| App exige verificação ao abrir | Task 6 |
| Cookie de sessão 7 dias | Task 3 |
| Código 6 dígitos via Resend | Task 2 |
| Código expira em 10 minutos | Task 2, 3 |
| Máx 3 tentativas | Task 3 |
| Nome + email na sessão | Task 3, 6 |
| Botão PDF vai direto para loading | Task 6 |
| pt-flag.png no gate | Task 5 |
| EmailModal removido | Task 7 |
| Funciona mobile e desktop | Task 5 (responsive CSS) |
