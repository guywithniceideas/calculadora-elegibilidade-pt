'use client'
import { useState } from 'react'
import { calculate } from '@/lib/calculator'
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
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🇵🇹</span>
          <span className="text-slate-100 font-bold">ElegiPortugal</span>
          <span className="bg-slate-700 text-slate-400 text-[10px] px-2 py-0.5 rounded ml-1">2026</span>
        </div>
        <span className="text-slate-500 text-xs">
          RMMG vigente: <span className="text-indigo-400 font-semibold">€ 920,00</span>
        </span>
      </header>

      {/* Tabs */}
      <div className="px-6 pt-4 pb-0">
        <VisaTypeTabs active={input.visaType} onChange={handleTabChange} />
      </div>

      {/* Dashboard */}
      <main className="flex flex-1 gap-0 mx-6 mt-2 mb-6 border border-slate-700 rounded-xl overflow-hidden">
        <div className="w-[380px] min-w-[320px] border-r border-slate-700 bg-slate-800/50">
          <InputPanel input={input} onChange={handleChange} />
        </div>
        <div className="flex-1 bg-slate-950">
          <ResultPanel result={result} input={input} />
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-slate-600 text-[10px] pb-4">
        Baseado no Decreto-Lei n.º 139/2025 e Portaria n.º 1563/2007 · Documento informativo, não substitui consultoria jurídica
      </footer>
    </div>
  )
}
