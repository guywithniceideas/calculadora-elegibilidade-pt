'use client'
import { useState, useEffect } from 'react'
import { calculate } from '@/lib/calculator'
import { fetchEurToBrlRate, brlToEur } from '@/lib/exchangeRate'
import type { CalculatorInput } from '@/lib/types'
import VisaTypeTabs from '@/components/VisaTypeTabs'
import InputPanel from '@/components/InputPanel'
import ResultPanel from '@/components/ResultPanel'

const initialInput: CalculatorInput = {
  visaType: 'D7',
  monthlyIncome: 0,
  savingsInPortugal: 0,
  family: { spouses: 0, children: 0, adultDependents: 0 },
  hasCPLPTerm: false,
  conservativeMode: false,
  businessCapital: 0,
}

export default function Home() {
  const [input, setInput] = useState<CalculatorInput>(initialInput)

  // Exchange rate state
  const [exchangeRate, setExchangeRate] = useState(5.85)
  const [rateDate, setRateDate] = useState('')
  const [rateSource, setRateSource] = useState<'live' | 'fallback'>('fallback')

  // BRL income (raw user input)
  const [incomeBRL, setIncomeBRL] = useState(0)

  // Savings dual input
  const [savingsBRL, setSavingsBRL] = useState(0)
  const [savingsEUR, setSavingsEUR] = useState(0)
  const [savingsCurrency, setSavingsCurrency] = useState<'BRL' | 'EUR' | null>(null)

  // Fetch live exchange rate on mount
  useEffect(() => {
    fetchEurToBrlRate().then(result => {
      setExchangeRate(result.rate)
      setRateDate(result.date)
      setRateSource(result.source)
    })
  }, [])

  // When BRL income changes, update EUR income in calculator input
  function handleIncomeBRLChange(brl: number) {
    setIncomeBRL(brl)
    const eur = brlToEur(brl, exchangeRate)
    setInput(prev => ({ ...prev, monthlyIncome: eur }))
  }

  // Savings: BRL filled → compute EUR, lock EUR field
  function handleSavingsBRLChange(brl: number) {
    setSavingsBRL(brl)
    if (brl > 0) {
      const eur = brlToEur(brl, exchangeRate)
      setSavingsEUR(0)
      setSavingsCurrency('BRL')
      setInput(prev => ({ ...prev, savingsInPortugal: eur }))
    } else {
      setSavingsCurrency(null)
      setInput(prev => ({ ...prev, savingsInPortugal: 0 }))
    }
  }

  // Savings: EUR filled → compute BRL, lock BRL field
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
    if (updated.visaType !== 'D8') {
      setInput({ ...updated, conservativeMode: false })
    } else {
      setInput(updated)
    }
  }

  function handleTabChange(visaType: CalculatorInput['visaType']) {
    setInput(prev => ({ ...prev, visaType, conservativeMode: false }))
  }

  const result = calculate(input)

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#EDEBE7' }}>

      {/* ── NAV ── */}
      <header className="bg-white shadow-sm px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🇵🇹</span>
          <span className="text-sm md:text-base font-extrabold text-[#1A1A1A] tracking-tight">
            Calculadora de Elegibilidade PT
          </span>
          <span className="hidden sm:inline bg-[#F0EFED] text-[#555] text-[9px] font-bold px-2 py-0.5 rounded-full">2026</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#666]">
          <span>RMMG: <strong className="text-[#1A1A1A]">€ 920,00</strong></span>
          {rateSource === 'live' && rateDate && (
            <span className="hidden md:flex items-center gap-1 text-[#888]">
              <span className="w-1.5 h-1.5 bg-[#555] rounded-full" />
              1 EUR = R$ {exchangeRate.toFixed(2)}
            </span>
          )}
        </div>
      </header>

      {/* ── TABS ── */}
      <div className="px-4 md:px-6 pt-3 pb-0">
        <VisaTypeTabs active={input.visaType} onChange={handleTabChange} />
      </div>

      {/* ── MAIN CONTENT ──
          Desktop: side-by-side split panel
          Mobile: single column, inputs above results */}
      <main className="flex-1 px-4 md:px-6 pt-2 pb-6">

        {/* Desktop split layout */}
        <div className="hidden md:flex gap-3 h-full">
          <div
            className="bg-white rounded-3xl shadow-sm overflow-hidden flex-shrink-0"
            style={{ width: '360px' }}
          >
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
          <div className="flex-1 bg-white rounded-3xl shadow-sm overflow-hidden">
            <ResultPanel result={result} input={input} />
          </div>
        </div>

        {/* Mobile single column layout */}
        <div className="md:hidden flex flex-col gap-3">
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
            <ResultPanel result={result} input={input} />
          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="text-center text-[10px] font-medium text-[#AAA] pb-4 px-4">
        Baseado no Decreto-Lei n.º 139/2025 e Portaria n.º 1563/2007 · Documento informativo, não substitui consultoria jurídica
      </footer>
    </div>
  )
}
