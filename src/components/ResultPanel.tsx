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
    <div className="h-full overflow-y-auto p-4 flex flex-col gap-4">
      <p className="text-emerald-400 text-[10px] uppercase tracking-widest">Resultado em tempo real</p>

      <StatusBadge status={overallStatus} />

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-800 rounded-lg p-3">
          <p className="text-slate-400 text-[10px] mb-1">Renda exigida</p>
          <p className="text-slate-100 text-base font-bold">{fmt(requiredMonthlyIncome)}</p>
          <p className="text-slate-500 text-[10px]">/mês</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-3">
          <p className="text-slate-400 text-[10px] mb-1">Poupança exigida</p>
          <p className="text-slate-100 text-base font-bold">{fmt(requiredSavings)}</p>
          <p className="text-slate-500 text-[10px]">em conta PT (12 meses)</p>
        </div>
      </div>

      <div>
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

      {alerts.length > 0 && (
        <div>
          {alerts.map((alert, i) => (
            <AlertCard key={i} type={alert.type} title={alert.title} message={alert.message} />
          ))}
        </div>
      )}

      <div className="mt-auto">
        <DownloadPdfButton input={input} result={result} />
        <p className="text-center text-slate-500 text-[10px] mt-2">
          Documento em PT-BR formatado para assessorias jurídicas
        </p>
      </div>
    </div>
  )
}
