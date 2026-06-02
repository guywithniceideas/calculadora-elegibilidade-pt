'use client'
import type { CalculatorInput, CalculatorResult } from '@/lib/types'
import StatusBadge from './StatusBadge'
import ProgressBar from './ProgressBar'
import AlertCard from './AlertCard'
import DownloadPdfButton from './DownloadPdfButton'

function fmt(n: number) {
  return `€ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

interface Props {
  result: CalculatorResult
  input: CalculatorInput
}

export default function ResultPanel({ result, input }: Props) {
  const {
    requiredMonthlyIncome, requiredSavings,
    incomeStatus, savingsStatus,
    incomePercent, savingsPercent,
    overallStatus, alerts,
  } = result

  return (
    <div className="h-full overflow-y-auto p-5 flex flex-col gap-4">
      {/* Live label */}
      <p className="text-[9px] font-black tracking-[1.8px] uppercase text-[#666]">
        Resultado em tempo real
      </p>

      {/* Status card — dark */}
      <StatusBadge status={overallStatus} />

      {/* Required values */}
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

      {/* Progress bars */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <ProgressBar
          label="Renda: informada vs. exigida"
          percent={incomePercent}
          status={incomeStatus}
        />
        <ProgressBar
          label="Poupança: informada vs. exigida"
          percent={savingsPercent}
          status={savingsStatus}
        />
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div>
          {alerts.map((alert, i) => (
            <AlertCard key={i} type={alert.type} title={alert.title} message={alert.message} />
          ))}
        </div>
      )}

      {/* PDF download */}
      <div className="mt-auto">
        <DownloadPdfButton input={input} result={result} />
        <p className="text-center text-[10px] font-medium text-[#AAA] mt-2">
          Documento em PT-BR · para assessorias jurídicas
        </p>
      </div>
    </div>
  )
}
