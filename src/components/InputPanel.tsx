'use client'
import type { CalculatorInput } from '@/lib/types'
import FamilyBuilder from './FamilyBuilder'

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

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[9px] font-black tracking-[1.8px] uppercase text-[#666] mb-2.5">
      {children}
    </p>
  )
}

function Toggle({
  label, sub, checked, onToggle,
}: { label: string; sub?: string; checked: boolean; onToggle: () => void }) {
  return (
    <button
      aria-label={label}
      onClick={onToggle}
      className="w-full flex items-center justify-between bg-[#EFEFEF] rounded-xl px-3 py-2.5 mb-1.5 text-left"
    >
      <div>
        <p className="text-xs font-semibold text-[#1A1A1A]">{label}</p>
        {sub && <p className="text-[10px] text-[#666] mt-0.5">{sub}</p>}
      </div>
      <div className={`w-8 h-[18px] rounded-full flex items-center px-0.5 ml-3 flex-shrink-0 transition-colors ${checked ? 'bg-[#1A1A1A] justify-end' : 'bg-[#CCC] justify-start'}`}>
        <div className="w-3.5 h-3.5 bg-white rounded-full" />
      </div>
    </button>
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
        className="w-full bg-[#EFEFEF] rounded-xl px-3 py-2.5 text-[#1A1A1A] text-sm font-semibold placeholder:text-[#BBB] outline-none focus:ring-2 focus:ring-[#1A1A1A]/20 transition-all"
      />
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
  const set = (patch: Partial<CalculatorInput>) => onChange({ ...input, ...patch })

  const incomeEUR = exchangeRate > 0 ? Math.round((incomeBRL / exchangeRate) * 100) / 100 : 0
  const brlFromEur = exchangeRate > 0 ? Math.round(savingsEUR * exchangeRate * 100) / 100 : 0
  const eurFromBrl = exchangeRate > 0 ? Math.round((savingsBRL / exchangeRate) * 100) / 100 : 0

  return (
    <div className="h-full overflow-y-auto p-5">
      <SectionLabel>Dados Financeiros</SectionLabel>

      {/* Income block: user types BRL, sees EUR conversion */}
      <div className="bg-[#EFEFEF] rounded-2xl p-3.5 mb-2.5">
        <p className="text-[11px] font-semibold text-[#555] mb-2">Renda mensal comprovável</p>
        {/* BRL input row */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm">🇧🇷</span>
          <span className="text-[11px] font-black text-[#444] w-7">BRL</span>
          <input
            type="number"
            min={0}
            value={incomeBRL || ''}
            onChange={e => onIncomeBRLChange(parseFloat(e.target.value) || 0)}
            placeholder="0,00"
            className="flex-1 bg-transparent text-[#1A1A1A] text-lg font-black placeholder:text-[#CCC] outline-none"
          />
        </div>
        <div className="h-px bg-[#E0E0E0] mb-2" />
        {/* EUR conversion row */}
        <div className="flex items-center gap-2">
          <span className="text-sm">🇪🇺</span>
          <span className="text-[11px] font-black text-[#444] w-7">EUR</span>
          <span className="text-sm font-bold text-[#1A1A1A]">
            {incomeBRL > 0 ? `≈ € ${fmt(incomeEUR)}` : '—'}
          </span>
          {exchangeRate > 0 && (
            <span className="ml-auto text-[10px] font-semibold text-[#666] flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-[#555] rounded-full inline-block" />
              1 EUR = R$ {fmt(exchangeRate)}
            </span>
          )}
        </div>
      </div>

      {/* Savings dual input */}
      <div className="mb-2.5">
        <label className="block text-[13px] font-semibold text-[#444] mb-1.5">
          Poupança em conta PT — preencha em uma moeda
        </label>
        <div className="grid grid-cols-2 gap-2">
          {/* BRL savings */}
          <div className={`bg-[#EFEFEF] rounded-xl p-3 transition-opacity ${savingsCurrency === 'EUR' ? 'opacity-40 pointer-events-none' : ''}`}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-xs">🇧🇷</span>
              <span className="text-[10px] font-black text-[#444]">BRL</span>
            </div>
            <input
              type="number"
              min={0}
              value={savingsBRL || ''}
              onChange={e => onSavingsBRLChange(parseFloat(e.target.value) || 0)}
              placeholder="0,00"
              className="w-full bg-transparent text-[#1A1A1A] text-sm font-bold placeholder:text-[#CCC] outline-none"
            />
            {savingsBRL > 0 && (
              <p className="text-[9px] text-[#888] mt-1">≈ € {fmt(eurFromBrl)}</p>
            )}
            {savingsCurrency === null && (
              <p className="text-[9px] text-[#AAA] mt-1">Preencha aqui…</p>
            )}
          </div>
          {/* EUR savings */}
          <div className={`bg-[#EFEFEF] rounded-xl p-3 transition-opacity ${savingsCurrency === 'BRL' ? 'opacity-40 pointer-events-none' : ''}`}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-xs">🇪🇺</span>
              <span className="text-[10px] font-black text-[#444]">EUR</span>
            </div>
            <input
              type="number"
              min={0}
              value={savingsEUR || ''}
              onChange={e => onSavingsEURChange(parseFloat(e.target.value) || 0)}
              placeholder="0,00"
              className="w-full bg-transparent text-[#1A1A1A] text-sm font-bold placeholder:text-[#CCC] outline-none"
            />
            {savingsEUR > 0 && (
              <p className="text-[9px] text-[#888] mt-1">R$ {fmt(brlFromEur)}</p>
            )}
            {savingsCurrency === null && (
              <p className="text-[9px] text-[#AAA] mt-1">…ou aqui</p>
            )}
          </div>
        </div>
      </div>

      {input.visaType === 'D2' && (
        <NumericInput
          id="business-capital"
          label="Capital alocado à empresa (€)"
          value={input.businessCapital}
          onChange={v => set({ businessCapital: v })}
        />
      )}

      <div className="h-px bg-[#E0E0E0] my-3.5" />
      <SectionLabel>Agregado Familiar</SectionLabel>
      <FamilyBuilder family={input.family} onChange={family => set({ family })} />

    </div>
  )
}
