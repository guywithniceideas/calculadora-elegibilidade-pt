'use client'
import { useState, useEffect } from 'react'
import { calculate } from '@/lib/calculator'
import { fetchEurToBrlRate, brlToEur } from '@/lib/exchangeRate'
import { scoreVisas, applyFinancialScore, getTop3Visas, familyFromFamilia } from '@/lib/compatibility'
import type { CalculatorInput, ScreeningAnswers, Step } from '@/lib/types'
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

export default function Home() {
  const [step, setStep] = useState<Step>(1)
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
    const sorted = scoreVisas(screening)
    const rawTopVisa = sorted[0]?.visaId ?? 'D7'
    const validVisaTypes: CalculatorInput['visaType'][] = ['D7', 'D8', 'D2']
    const topVisa: CalculatorInput['visaType'] = validVisaTypes.includes(rawTopVisa as CalculatorInput['visaType'])
      ? (rawTopVisa as CalculatorInput['visaType'])
      : 'D7'
    const family = familyFromFamilia(screening.familia)
    setInput(prev => ({ ...prev, visaType: topVisa, family }))
    setStep(2)
  }

  function handleBackToStep1() {
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
    <div className="min-h-screen flex flex-col" style={{ background: '#EDEBE7' }}>
      <header className="bg-white shadow-sm px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🇵🇹</span>
          <span className="text-sm md:text-base font-extrabold text-[#1A1A1A] tracking-tight">
            Calculadora de Elegibilidade PT
          </span>
          <span className="hidden sm:inline bg-[#F0EFED] text-[#555] text-[9px] font-bold px-2 py-0.5 rounded-full">2026</span>
        </div>
        <span className="text-xs text-[#666]">
          RMMG: <strong className="text-[#1A1A1A]">€ 920,00</strong>
        </span>
      </header>

      <StepIndicator step={step} />

      {step === 2 && (
        <div className="px-4 md:px-6 pb-0">
          <VisaTypeTabs active={input.visaType} onChange={handleTabChange} />
        </div>
      )}

      <main className="flex-1 px-4 md:px-6 pt-2 pb-6">
        {step === 2 && (
          <button
            onClick={handleBackToStep1}
            className="text-xs text-[#666] hover:text-[#1A1A1A] mb-2 flex items-center gap-1"
          >
            ← Voltar ao Rastreio
          </button>
        )}

        {/* Desktop */}
        <div className="hidden md:flex gap-3 h-full">
          <div className="bg-white rounded-3xl shadow-sm overflow-hidden flex-shrink-0" style={{ width: '360px' }}>
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

          <div className="flex-1 bg-white rounded-3xl shadow-sm overflow-hidden">
            {step === 1 ? (
              <div className="p-5">
                <VisaCompatibilityCards scores={top3} step={1} />
              </div>
            ) : (
              <div className="h-full overflow-y-auto p-5 flex flex-col gap-4">
                <VisaCompatibilityCards scores={top3} step={2} activeVisaId={input.visaType} />
                <ResultPanel
                  result={result}
                  input={input}
                  topVisaScore={topVisaScore}
                  onRequestReport={handleRequestReport}
                />
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
              <div className="bg-white rounded-3xl shadow-sm p-5">
                <VisaCompatibilityCards scores={top3} step={2} activeVisaId={input.visaType} />
              </div>
              <div className="bg-white rounded-3xl shadow-sm">
                <ResultPanel
                  result={result}
                  input={input}
                  topVisaScore={topVisaScore}
                  onRequestReport={handleRequestReport}
                />
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="text-center text-[10px] font-medium text-[#AAA] pb-4 px-4">
        Baseado no Decreto-Lei n.º 139/2025 e Portaria n.º 1563/2007 · Documento informativo, não substitui consultoria jurídica
      </footer>

      {showEmailModal && (
        <EmailModal
          onConfirm={handleEmailConfirm}
          onClose={() => setShowEmailModal(false)}
        />
      )}
      {showLoading && <LoadingOverlay onClose={handleLoadingClose} />}
    </div>
  )
}
