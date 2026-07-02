'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { CalculatorInput } from '@/lib/types'
import FamilyBuilder from './FamilyBuilder'
import Switch from './Switch'

interface Props {
  input: CalculatorInput
  onChange: (input: CalculatorInput) => void
  exchangeRate: number
  incomeBRL: number
  onIncomeBRLChange: (brl: number) => void
  savingsBRL: number
  savingsEUR: number
  savingsCurrency: 'BRL' | 'EUR' | null
  onSavingsBRLChange: (brl: number) => void
  onSavingsEURChange: (eur: number) => void
}

const easeOut = [0.25, 0.1, 0.25, 1] as const

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[9px] font-black tracking-[1.8px] uppercase text-[#666] mb-2.5">
      {children}
    </p>
  )
}

function NumericInput({ id, label, value, onChange }: { id: string; label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="mb-2.5">
      <label htmlFor={id} className="block text-[11px] font-semibold text-[#555] mb-1.5">{label}</label>
      <input
        id={id}
        type="number"
        min={0}
        value={value || ''}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        placeholder="0,00"
        className="w-full bg-[#EFEFEF] rounded-xl px-3 py-2.5 text-[#1A1A1A] text-base font-semibold placeholder:text-[#BBB] outline-none focus:ring-2 focus:ring-[#1A1A1A]/20 transition-all"
      />
    </div>
  )
}

function CurrencyToggle({ value, onChange }: { value: 'BRL' | 'EUR'; onChange: (v: 'BRL' | 'EUR') => void }) {
  return (
    <div className="inline-flex bg-[#EFEFEF] rounded-full p-1 gap-0.5">
      {(['BRL', 'EUR'] as const).map(c => {
        const isActive = value === c
        return (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className="relative px-3 py-1.5 rounded-full text-[11px] font-bold"
          >
            {isActive && (
              <motion.div
                layoutId="savings-currency-pill"
                className="absolute inset-0 bg-[#1A1A1A] rounded-full"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className={`relative z-10 ${isActive ? 'text-white' : 'text-[#666]'}`}>{c}</span>
          </button>
        )
      })}
    </div>
  )
}

function fmt(n: number) {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function InputPanel({
  input, onChange,
  exchangeRate,
  incomeBRL, onIncomeBRLChange,
  savingsBRL, savingsEUR, savingsCurrency,
  onSavingsBRLChange, onSavingsEURChange,
}: Props) {
  const [pendingCurrency, setPendingCurrency] = useState<'BRL' | 'EUR'>('BRL')
  const set = (patch: Partial<CalculatorInput>) => onChange({ ...input, ...patch })

  const incomeEUR = exchangeRate > 0 ? Math.round((incomeBRL / exchangeRate) * 100) / 100 : 0
  const brlFromEur = exchangeRate > 0 ? Math.round(savingsEUR * exchangeRate * 100) / 100 : 0
  const eurFromBrl = exchangeRate > 0 ? Math.round((savingsBRL / exchangeRate) * 100) / 100 : 0

  const activeCurrency = savingsCurrency ?? pendingCurrency
  const savingsValue = activeCurrency === 'EUR' ? savingsEUR : savingsBRL
  const savingsConversion = activeCurrency === 'EUR' ? `R$ ${fmt(brlFromEur)}` : `€ ${fmt(eurFromBrl)}`

  function handleSavingsValueChange(v: number) {
    if (activeCurrency === 'EUR') onSavingsEURChange(v)
    else onSavingsBRLChange(v)
  }

  function switchCurrency(c: 'BRL' | 'EUR') {
    if (c === activeCurrency) return
    if (activeCurrency === 'BRL' && savingsBRL > 0) onSavingsBRLChange(0)
    if (activeCurrency === 'EUR' && savingsEUR > 0) onSavingsEURChange(0)
    setPendingCurrency(c)
  }

  return (
    <div className="h-full overflow-y-auto p-5">
      <SectionLabel>Dados Financeiros</SectionLabel>

      {/* Renda mensal */}
      <div className="bg-[#F8F8F8] rounded-2xl p-4 mb-3">
        <p className="text-[11px] font-semibold text-[#555] mb-2.5">Renda mensal comprovável</p>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-black text-[#999]">R$</span>
          <input
            type="number"
            min={0}
            value={incomeBRL || ''}
            onChange={e => onIncomeBRLChange(parseFloat(e.target.value) || 0)}
            placeholder="0,00"
            className="flex-1 bg-transparent text-[#1A1A1A] text-2xl font-black placeholder:text-[#CCC] outline-none"
          />
        </div>
        <AnimatePresence>
          {incomeBRL > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: easeOut }}
              className="overflow-hidden"
            >
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#E5E5E5]">
                <span className="text-sm font-bold text-[#1A1A1A]">≈ € {fmt(incomeEUR)}</span>
                {exchangeRate > 0 && (
                  <span className="text-[10px] font-semibold text-[#999]">1 € = R$ {fmt(exchangeRate)}</span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Poupança */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[13px] font-semibold text-[#444]">Poupança em conta PT</label>
          <CurrencyToggle value={activeCurrency} onChange={switchCurrency} />
        </div>
        <div className="bg-[#F8F8F8] rounded-2xl p-4">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-black text-[#999]">{activeCurrency === 'EUR' ? '€' : 'R$'}</span>
            <input
              type="number"
              min={0}
              value={savingsValue || ''}
              onChange={e => handleSavingsValueChange(parseFloat(e.target.value) || 0)}
              placeholder="0,00"
              className="flex-1 bg-transparent text-[#1A1A1A] text-xl font-black placeholder:text-[#CCC] outline-none"
            />
          </div>
          <AnimatePresence>
            {savingsValue > 0 && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: easeOut }}
                className="text-[11px] font-semibold text-[#888] pt-2.5 mt-2.5 border-t border-[#E5E5E5] overflow-hidden"
              >
                ≈ {savingsConversion}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {input.visaType === 'D2' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: easeOut }}
            className="overflow-hidden"
          >
            <NumericInput
              id="business-capital"
              label="Capital alocado à empresa (€)"
              value={input.businessCapital}
              onChange={v => set({ businessCapital: v })}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-px bg-[#E0E0E0] my-3.5" />
      <SectionLabel>Configurações</SectionLabel>
      <div className="flex flex-col gap-2 mb-1">
        <div className="flex items-center justify-between bg-[#F8F8F8] rounded-2xl p-3.5">
          <div className="pr-3">
            <p className="text-xs font-semibold text-[#1A1A1A]">Termo de Responsabilidade CPLP</p>
            <p className="text-[10px] text-[#999] mt-0.5">Dispensa a exigência de poupança</p>
          </div>
          <Switch
            checked={input.hasCPLPTerm}
            onChange={() => set({ hasCPLPTerm: !input.hasCPLPTerm })}
            label="Tenho Termo de Responsabilidade CPLP"
          />
        </div>

        <AnimatePresence>
          {input.visaType === 'D8' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: easeOut }}
              className="overflow-hidden"
            >
              <div className="flex items-center justify-between bg-[#F8F8F8] rounded-2xl p-3.5">
                <div className="pr-3">
                  <p className="text-xs font-semibold text-[#1A1A1A]">Modo Conservador</p>
                  <p className="text-[10px] text-[#999] mt-0.5">Garante aprovação em 100% dos postos consulares</p>
                </div>
                <Switch
                  checked={input.conservativeMode}
                  onChange={() => set({ conservativeMode: !input.conservativeMode })}
                  label="Modo Conservador"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="h-px bg-[#E0E0E0] my-3.5" />
      <SectionLabel>Agregado Familiar</SectionLabel>
      <FamilyBuilder family={input.family} onChange={family => set({ family })} />

    </div>
  )
}
