'use client'
import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { calculate } from '@/lib/calculator'
import { fetchEurToBrlRate, brlToEur } from '@/lib/exchangeRate'
import { scoreVisas, applyFinancialScore, getTop3Visas, familyFromFamilia } from '@/lib/compatibility'
import type { CalculatorInput, ScreeningAnswers, Step, VisaType } from '@/lib/types'
import VisaTypeTabs from '@/components/VisaTypeTabs'
import InputPanel from '@/components/InputPanel'
import ResultPanel from '@/components/ResultPanel'
import ScreeningPanel from '@/components/ScreeningPanel'
import VisaCompatibilityCards from '@/components/VisaCompatibilityCards'
import StepIndicator from '@/components/StepIndicator'
import EmailModal from '@/components/EmailModal'
import LoadingOverlay from '@/components/LoadingOverlay'

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

const stepVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 24 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -24 }),
}

export default function Home() {
  const [step, setStep] = useState<Step>(1)
  const [stepDirection, setStepDirection] = useState<1 | -1>(1)
  const [screening, setScreening] = useState<ScreeningAnswers>(initialScreening)
  const [input, setInput] = useState<CalculatorInput>(initialInput)
  const [exchangeRate, setExchangeRate] = useState(5.85)
  const [incomeBRL, setIncomeBRL] = useState(0)
  const [savingsBRL, setSavingsBRL] = useState(0)
  const [savingsEUR, setSavingsEUR] = useState(0)
  const [savingsCurrency, setSavingsCurrency] = useState<'BRL' | 'EUR' | null>(null)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showLoading, setShowLoading] = useState(false)

  useEffect(() => {
    fetchEurToBrlRate().then(r => setExchangeRate(r.rate))
  }, [])

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
    setShowEmailModal(true)
  }

  function handleEmailConfirm(_name: string, _email: string) {
    setShowEmailModal(false)
    setShowLoading(true)
  }

  function handleLoadingClose() {
    setShowLoading(false)
  }

  const result = calculate(input)
  const rawScores = scoreVisas(screening)
  const scoredVisas = step === 2
    ? applyFinancialScore(rawScores, input.visaType, result.incomePercent, result.savingsPercent)
    : rawScores
  const top3 = getTop3Visas(scoredVisas)
  const topVisaScore = top3[0]?.score ?? 0

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F2F2F2' }}>
      <header className="bg-white shadow-sm px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/pt-flag.png" alt="Portugal" className="h-6 w-auto" />
          <span className="text-sm md:text-base font-extrabold text-[#1A1A1A] tracking-tight">
            Calculadora de Elegibilidade PT
          </span>
          <span className="hidden sm:inline bg-[#EFEFEF] text-[#555] text-[9px] font-bold px-2 py-0.5 rounded-full">2026</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-rm.png" alt="Rodrigo Maranhão" className="h-3 w-auto opacity-50 brightness-0" />
            <a
              href="https://www.instagram.com/rodrigomaranhao.adv/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-semibold text-[#1A1A1A] hover:text-[#444] transition-colors"
            >
              @rodrigomaranhao.adv
            </a>
          </div>
          <span className="text-xs text-[#666]">
            RMMG: <strong className="text-[#1A1A1A]">€ 920,00</strong>
          </span>
        </div>
      </header>

      <StepIndicator step={step} />

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
            {step === 2 && (
              <button
                onClick={handleBackToStep1}
                className="inline-flex items-center gap-2 mb-3 px-4 py-2 rounded-xl bg-white border border-[#E0E0E0] shadow-sm text-xs font-semibold text-[#444] hover:bg-[#EFEFEF] hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Voltar ao Rastreio do Visto
              </button>
            )}

            {/* Desktop */}
            <div className="hidden md:flex gap-3 h-full">
              <div
                className="bg-white rounded-3xl shadow-sm overflow-hidden"
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
                className="bg-white rounded-3xl shadow-sm overflow-hidden"
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

            {/* Mobile */}
            <div className="md:hidden flex flex-col gap-3">
              {step === 1 ? (
                <>
                  <div className="bg-white rounded-3xl shadow-sm">
                    <ScreeningPanel
                      answers={screening}
                      onChange={setScreening}
                      onNext={handleProceedToStep2}
                    />
                  </div>
                  <div className="bg-white rounded-3xl shadow-sm p-5">
                    <VisaCompatibilityCards scores={top3} step={1} />
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-white rounded-3xl shadow-sm">
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
                  <div className="bg-white rounded-3xl shadow-sm">
                    <ResultPanel
                      result={result}
                      input={input}
                      topVisaScore={topVisaScore}
                      onRequestReport={handleRequestReport}
                    />
                  </div>
                  <div className="bg-white rounded-3xl shadow-sm p-5">
                    <VisaCompatibilityCards scores={top3} step={2} activeVisaId={input.visaType} />
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="text-center text-[10px] font-medium text-[#AAA] pb-5 px-4 flex flex-col items-center gap-3">
        <span>Baseado no Decreto-Lei n.º 139/2025 e Portaria n.º 1563/2007 · Documento informativo, não substitui consultoria jurídica</span>
        <div className="flex items-center gap-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/vm-logo.png" alt="Vilanova Maranhão Advogados" className="h-5 opacity-40" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-rm.png" alt="Logo" className="h-3 opacity-40 brightness-0" />
        </div>
      </footer>

      <AnimatePresence>
        {showEmailModal && (
          <EmailModal
            onConfirm={handleEmailConfirm}
            onClose={() => setShowEmailModal(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showLoading && <LoadingOverlay onClose={handleLoadingClose} />}
      </AnimatePresence>
    </div>
  )
}
