'use client'
import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { getImageProps } from 'next/image'
import { calculate } from '@/lib/calculator'
import { downloadCalculatorPdf } from '@/lib/generatePdf'
import { fetchEurToBrlRate, brlToEur } from '@/lib/exchangeRate'
import { scoreVisas, applyFinancialScore, getTop3Visas, familyFromFamilia } from '@/lib/compatibility'
import type { CalculatorInput, ScreeningAnswers, Step, VisaType } from '@/lib/types'
import VisaTypeTabs from '@/components/VisaTypeTabs'
import InputPanel from '@/components/InputPanel'
import ResultPanel from '@/components/ResultPanel'
import ScreeningPanel from '@/components/ScreeningPanel'
import VisaCompatibilityCards from '@/components/VisaCompatibilityCards'
import StepIndicator from '@/components/StepIndicator'
import AuthGate from '@/components/AuthGate'
import ConsultancyPage from '@/components/ConsultancyPage'
import Dashboard from '@/components/Dashboard'
import type { UserProfile } from '@/app/api/profile/route'

const initialInput: CalculatorInput = {
  visaType: 'D7',
  monthlyIncome: 0,
  savingsInPortugal: 0,
  family: { spouses: 0, children: 0, adultDependents: 0 },
  hasCPLPTerm: false,
  conservativeMode: false,
  businessCapital: 0,
}

const initialScreening: ScreeningAnswers = { objetivo: null, situacao: null, familia: null }

const bgImageCommon = { alt: '', sizes: '100vw', quality: 75, loading: 'eager' as const }
const { props: { srcSet: desktopBgSrcSet } } = getImageProps({
  ...bgImageCommon, src: '/torre-de-belem.jpg', width: 1672, height: 941,
})
const { props: mobileBgImgProps } = getImageProps({
  ...bgImageCommon, src: '/torre-de-belem-mobile.jpg', width: 941, height: 1672,
})

const stepVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 24 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -24 }),
}

export default function Home() {
  const [view, setView] = useState<'dashboard' | 'calculator'>('dashboard')
  const [step, setStep] = useState<Step>(1)
  const [stepDirection, setStepDirection] = useState<1 | -1>(1)
  const [screening, setScreening] = useState<ScreeningAnswers>(initialScreening)
  const [input, setInput] = useState<CalculatorInput>(initialInput)
  const [exchangeRate, setExchangeRate] = useState(5.85)
  const [incomeBRL, setIncomeBRL] = useState(0)
  const [savingsBRL, setSavingsBRL] = useState(0)
  const [savingsEUR, setSavingsEUR] = useState(0)
  const [savingsCurrency, setSavingsCurrency] = useState<'BRL' | 'EUR' | null>(null)
  const [authState, setAuthState] = useState<'loading' | 'unauthenticated' | 'authenticated'>('loading')
  const [userName, setUserName] = useState('')
  const [userUsername, setUserUsername] = useState('')
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    fetchEurToBrlRate().then(r => setExchangeRate(r.rate))
  }, [])

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(({ name, username }: { name: string; username: string }) => {
        setUserName(name)
        setUserUsername(username)
        setAuthState('authenticated')
      })
      .catch(() => setAuthState('unauthenticated'))
  }, [])

  useEffect(() => {
    if (authState !== 'authenticated') return
    fetch('/api/profile')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(({ profile }: { profile: UserProfile | null }) => setProfile(profile))
      .catch(() => setProfile(null))
  }, [authState])

  function handleIncomeBRLChange(brl: number) {
    setIncomeBRL(brl)
    setInput(prev => ({ ...prev, monthlyIncome: brlToEur(brl, exchangeRate) }))
  }

  function handleSavingsBRLChange(brl: number) {
    setSavingsBRL(brl)
    if (brl > 0) {
      setSavingsEUR(0)
      setSavingsCurrency('BRL')
      setInput(prev => ({ ...prev, savingsInPortugal: brlToEur(brl, exchangeRate) }))
    } else {
      setSavingsCurrency(null)
      setInput(prev => ({ ...prev, savingsInPortugal: 0 }))
    }
  }

  function handleSavingsEURChange(eur: number) {
    setSavingsEUR(eur)
    if (eur > 0) {
      setSavingsBRL(0)
      setSavingsCurrency('EUR')
      setInput(prev => ({ ...prev, savingsInPortugal: eur }))
    } else {
      setSavingsCurrency(null)
      setInput(prev => ({ ...prev, savingsInPortugal: 0 }))
    }
  }

  function handleChange(updated: CalculatorInput) {
    setInput(updated.visaType !== 'D8' ? { ...updated, conservativeMode: false } : updated)
  }

  function handleTabChange(visaType: CalculatorInput['visaType']) {
    setInput(prev => ({ ...prev, visaType, conservativeMode: false }))
  }

  function handleProceedToStep2() {
    setStepDirection(1)
    const sorted = scoreVisas(screening)
    const topVisaId = sorted[0]?.visaId ?? 'D7'
    const validTypes: VisaType[] = ['D7', 'D8', 'D2', 'D1', 'D4']
    const topVisa = validTypes.includes(topVisaId as VisaType) ? (topVisaId as VisaType) : 'D7'
    const family = familyFromFamilia(screening.familia)
    setInput(prev => ({ ...prev, visaType: topVisa, family }))
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleBackToStep1() {
    setStepDirection(-1)
    setStep(1)
  }

  function handleRequestReport() {
    setStepDirection(1)
    downloadCalculatorPdf(input, result).catch(() => {})
    fetch('/api/leads', { method: 'POST' }).catch(() => {})
    fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ screening, input }),
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(() => setProfile({ screening, input, updatedAt: new Date().toISOString() }))
      .catch(() => {})
    setStep(3)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleBackToStep2() {
    setStepDirection(-1)
    setStep(2)
  }

  function handleStartAnalysis() {
    if (profile) {
      setScreening(profile.screening)
      setInput(profile.input)
    }
    setStepDirection(1)
    setStep(1)
    setView('calculator')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleGoHome() {
    setView('dashboard')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const result = calculate(input)
  const rawScores = scoreVisas(screening)
  const scoredVisas = step === 2
    ? applyFinancialScore(rawScores, input.visaType, result.incomePercent, result.savingsPercent)
    : rawScores
  const top3 = getTop3Visas(scoredVisas)
  const topVisaScore = top3[0]?.score ?? 0

  if (authState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F2F2F2' }}>
        <div className="w-8 h-8 border-2 border-[#E0E0E0] border-t-[#1A1A1A] rounded-full animate-spin" />
      </div>
    )
  }

  if (authState === 'unauthenticated') {
    return (
      <AuthGate
        onAuthenticated={(name, username) => {
          setUserName(name)
          setUserUsername(username)
          setAuthState('authenticated')
        }}
      />
    )
  }

  return (
    <div className="relative isolate min-h-screen flex flex-col" style={{ background: '#F2F2F2' }}>
      <picture>
        <source media="(min-width: 768px)" srcSet={desktopBgSrcSet} />
        <img
          {...mobileBgImgProps}
          alt=""
          className="fixed inset-0 -z-20 w-full h-full object-cover"
        />
      </picture>
      <div aria-hidden className="fixed inset-0 -z-10 bg-black/55" />

      <header className="bg-white shadow-sm px-4 md:px-6 py-3 flex items-center justify-between">
        <button
          onClick={handleGoHome}
          disabled={view === 'dashboard'}
          className="flex items-center gap-2 disabled:cursor-default"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/pt-flag.png" alt="Portugal" className="h-6 w-auto" />
          <span className="text-sm md:text-base font-extrabold text-[#1A1A1A] tracking-tight">
            Simulador de Vistos
          </span>
          <span className="hidden sm:inline bg-[#EFEFEF] text-[#555] text-[9px] font-bold px-2 py-0.5 rounded-full">2026</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-rm.png" alt="Rodrigo Maranhão" className="h-2.5 w-auto opacity-50 brightness-0" />
            <a
              href="https://www.instagram.com/rodrigomaranhao.adv/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram @rodrigomaranhao.adv"
              className="text-[#1A1A1A] opacity-50 hover:opacity-100 transition-opacity"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.012-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          </div>
          <span className="text-xs text-[#666]">
            RMMG: <strong className="text-[#1A1A1A]">€ 920,00</strong>
          </span>
        </div>
      </header>

      {view === 'dashboard' && (
        <Dashboard userName={userName} profile={profile} onStart={handleStartAnalysis} />
      )}

      {view === 'calculator' && (
      <>
      <div className="flex justify-center pt-3 px-4">
        <div className="glass-card rounded-2xl">
          <StepIndicator step={step} />
        </div>
      </div>

      <AnimatePresence>
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="px-4 md:px-6 pb-0"
          >
            <VisaTypeTabs active={input.visaType} onChange={handleTabChange} />
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 px-4 md:px-6 pt-2 pb-6 overflow-hidden">
        <AnimatePresence mode="wait" custom={stepDirection}>
          <motion.div
            key={step}
            custom={stepDirection}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.26, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {(step === 1 || step === 2) && (
              <button
                onClick={step === 1 ? handleGoHome : handleBackToStep1}
                className="inline-flex items-center gap-2 mb-3 px-4 py-2 rounded-xl bg-white border border-[#E0E0E0] shadow-sm text-xs font-semibold text-[#444] hover:bg-[#EFEFEF] hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                {step === 1 ? 'Voltar ao Início' : 'Voltar ao Rastreio do Visto'}
              </button>
            )}

            {/* Step 3 — Página de Finalização / Consultoria */}
            {step === 3 && (
              <ConsultancyPage
                input={input}
                result={result}
                onBack={handleBackToStep2}
              />
            )}

            {step !== 3 && (
              <>
                {/* Desktop — steps 1 e 2 */}
                <div className="hidden md:flex gap-3 h-full">
                  <div
                    className="glass-card rounded-3xl overflow-hidden"
                    style={step === 1 ? { flex: 1 } : { width: '360px', flexShrink: 0 }}
                  >
                    {step === 1 ? (
                      <ScreeningPanel
                        answers={screening}
                        onChange={setScreening}
                        onNext={handleProceedToStep2}
                      />
                    ) : (
                      <InputPanel
                        input={input}
                        onChange={handleChange}
                        exchangeRate={exchangeRate}
                        incomeBRL={incomeBRL}
                        onIncomeBRLChange={handleIncomeBRLChange}
                        savingsBRL={savingsBRL}
                        savingsEUR={savingsEUR}
                        savingsCurrency={savingsCurrency}
                        onSavingsBRLChange={handleSavingsBRLChange}
                        onSavingsEURChange={handleSavingsEURChange}
                      />
                    )}
                  </div>

                  <div
                    className="glass-card rounded-3xl overflow-hidden"
                    style={step === 1 ? { width: '260px', flexShrink: 0 } : { flex: 1 }}
                  >
                    {step === 1 ? (
                      <div className="p-5">
                        <VisaCompatibilityCards scores={top3} step={1} />
                      </div>
                    ) : (
                      <div className="h-full overflow-y-auto p-5 flex flex-col gap-4">
                        <ResultPanel
                          result={result}
                          input={input}
                          topVisaScore={topVisaScore}
                          onRequestReport={handleRequestReport}
                        />
                        <VisaCompatibilityCards scores={top3} step={2} activeVisaId={input.visaType} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile — steps 1 e 2 */}
                <div className="md:hidden flex flex-col gap-3">
                  {step === 1 ? (
                    <>
                      <div className="glass-card rounded-3xl overflow-hidden">
                        <ScreeningPanel
                          answers={screening}
                          onChange={setScreening}
                          onNext={handleProceedToStep2}
                        />
                      </div>
                      <div className="glass-card rounded-3xl p-5">
                        <VisaCompatibilityCards scores={top3} step={1} />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="glass-card rounded-3xl overflow-hidden">
                        <InputPanel
                          input={input}
                          onChange={handleChange}
                          exchangeRate={exchangeRate}
                          incomeBRL={incomeBRL}
                          onIncomeBRLChange={handleIncomeBRLChange}
                          savingsBRL={savingsBRL}
                          savingsEUR={savingsEUR}
                          savingsCurrency={savingsCurrency}
                          onSavingsBRLChange={handleSavingsBRLChange}
                          onSavingsEURChange={handleSavingsEURChange}
                        />
                      </div>
                      <div className="glass-card rounded-3xl overflow-hidden">
                        <ResultPanel
                          result={result}
                          input={input}
                          topVisaScore={topVisaScore}
                          onRequestReport={handleRequestReport}
                        />
                      </div>
                      <div className="glass-card rounded-3xl p-5">
                        <VisaCompatibilityCards scores={top3} step={2} activeVisaId={input.visaType} />
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
      </>
      )}

      <footer className="text-center text-[10px] font-medium text-[#AAA] pb-5 px-4 flex flex-col items-center gap-3">
        <span>Baseado no Decreto-Lei n.º 139/2025 e Portaria n.º 1563/2007 · Documento informativo, não substitui consultoria jurídica</span>
        <div className="flex items-center gap-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/vm-logo.png" alt="Vilanova Maranhão Advogados" className="h-5 opacity-60 brightness-0 invert" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-rm.png" alt="Logo" className="h-3 opacity-60 brightness-0 invert" />
        </div>
      </footer>

    </div>
  )
}
