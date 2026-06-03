'use client'
import type { CalculatorInput, CalculatorResult } from '@/lib/types'
import CompatibilityBadge from './CompatibilityBadge'
import ProgressBar from './ProgressBar'
import AlertCard from './AlertCard'

function fmt(n: number) {
  return `€ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

interface Props {
  result: CalculatorResult
  input: CalculatorInput
  topVisaScore: number
  onRequestReport: () => void
}

export default function ResultPanel({ result, input, topVisaScore, onRequestReport }: Props) {
  const {
    requiredMonthlyIncome, requiredSavings,
    incomeStatus, savingsStatus,
    incomePercent, savingsPercent,
    alerts,
  } = result

  return (
    <div className="h-full overflow-y-auto p-5 flex flex-col gap-4">
      <p className="text-[9px] font-black tracking-[1.8px] uppercase text-[#666]">
        Resultado em tempo real
      </p>

      <CompatibilityBadge score={topVisaScore} />

      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white rounded-2xl p-3.5 shadow-sm">
          <p className="text-[9px] font-black tracking-wide uppercase text-[#666] mb-1.5">Renda exigida</p>
          <p className="text-xl font-extrabold text-[#1A1A1A] tracking-tight">{fmt(requiredMonthlyIncome)}</p>
          <p className="text-[10px] font-medium text-[#777] mt-1">/mês</p>
        </div>
        <div className="bg-white rounded-2xl p-3.5 shadow-sm">
          <p className="text-[9px] font-black tracking-wide uppercase text-[#666] mb-1.5">Poupança exigida</p>
          <p className="text-xl font-extrabold text-[#1A1A1A] tracking-tight">{fmt(requiredSavings)}</p>
          <p className="text-[10px] font-medium text-[#777] mt-1">em conta PT · 12 meses</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <ProgressBar label="Renda: informada vs. exigida" percent={incomePercent} status={incomeStatus} />
        <ProgressBar label="Poupança: informada vs. exigida" percent={savingsPercent} status={savingsStatus} />
      </div>

      {alerts.length > 0 && (
        <div>
          {alerts.map((alert, i) => (
            <AlertCard key={i} type={alert.type} title={alert.title} message={alert.message} />
          ))}
        </div>
      )}

      <div className="mt-auto">
        <button
          onClick={onRequestReport}
          className="btn-cta w-full py-3 rounded-2xl text-sm font-bold"
        >
          Receber Relatório Preliminar em PDF (Para mandar para Assessoria Jurídica)
        </button>
        <p className="text-center text-[10px] font-medium text-[#AAA] mt-2">
          Documento em PT-BR · para assessorias jurídicas
        </p>
        <p className="text-center text-[10px] text-[#AAA] mt-3 leading-relaxed px-2">
          Esta calculadora é uma ferramenta informativa e não substitui uma consulta jurídica. Mesmo com alta compatibilidade, detalhes do seu perfil só podem ser avaliados por um profissional.
        </p>
      </div>
    </div>
  )
}
