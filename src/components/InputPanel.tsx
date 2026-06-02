'use client'
import type { CalculatorInput } from '@/lib/types'
import FamilyBuilder from './FamilyBuilder'

interface Props {
  input: CalculatorInput
  onChange: (input: CalculatorInput) => void
}

function Toggle({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <button
      aria-label={label}
      onClick={onToggle}
      className="w-full flex items-center justify-between bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-xs text-left"
    >
      <span className="text-slate-300">{label}</span>
      <div className={`w-8 h-4 rounded-full relative transition-colors ${checked ? 'bg-indigo-600' : 'bg-slate-600'}`}>
        <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all ${checked ? 'left-4' : 'left-0.5'}`} />
      </div>
    </button>
  )
}

function NumericInput({ id, label, value, onChange }: { id: string; label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="block text-slate-400 text-xs mb-1">{label}</label>
      <input
        id={id}
        type="number"
        min={0}
        value={value || ''}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        placeholder="0,00"
        className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
      />
    </div>
  )
}

export default function InputPanel({ input, onChange }: Props) {
  const set = (patch: Partial<CalculatorInput>) => onChange({ ...input, ...patch })

  return (
    <div className="h-full overflow-y-auto p-4">
      <p className="text-indigo-400 text-[10px] uppercase tracking-widest mb-3">Dados do Requerente</p>

      <NumericInput
        id="income"
        label="Renda mensal comprovável (€)"
        value={input.monthlyIncome}
        onChange={v => set({ monthlyIncome: v })}
      />
      <NumericInput
        id="savings"
        label="Poupança em conta PT (€)"
        value={input.savingsInPortugal}
        onChange={v => set({ savingsInPortugal: v })}
      />

      {input.visaType === 'D2' && (
        <NumericInput
          id="business-capital"
          label="Capital alocado à empresa (€)"
          value={input.businessCapital}
          onChange={v => set({ businessCapital: v })}
        />
      )}

      <div className="h-px bg-slate-700 my-3" />
      <p className="text-indigo-400 text-[10px] uppercase tracking-widest mb-3">Agregado Familiar</p>
      <FamilyBuilder family={input.family} onChange={family => set({ family })} />

      <div className="h-px bg-slate-700 my-3" />
      <p className="text-indigo-400 text-[10px] uppercase tracking-widest mb-3">Opções</p>

      <div className="space-y-2">
        <Toggle
          label="Cidadão CPLP com Termo de Responsabilidade"
          checked={input.hasCPLPTerm}
          onToggle={() => set({ hasCPLPTerm: !input.hasCPLPTerm })}
        />
        {input.visaType === 'D8' && (
          <Toggle
            label="Modo Conservador"
            checked={input.conservativeMode}
            onToggle={() => set({ conservativeMode: !input.conservativeMode })}
          />
        )}
      </div>
    </div>
  )
}
