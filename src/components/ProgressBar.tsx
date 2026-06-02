import type { CriterionStatus } from '@/lib/types'

const barColor: Record<CriterionStatus, string> = {
  pass: 'bg-emerald-500',
  warning: 'bg-amber-500',
  fail: 'bg-red-500',
  waived: 'bg-slate-500',
}

const labelColor: Record<CriterionStatus, string> = {
  pass: 'text-emerald-400',
  warning: 'text-amber-400',
  fail: 'text-red-400',
  waived: 'text-slate-400',
}

interface Props {
  label: string
  sublabel?: string
  percent: number
  status: CriterionStatus
}

export default function ProgressBar({ label, sublabel, percent, status }: Props) {
  const displayPct = Math.min(percent, 100)
  return (
    <div className="mb-3">
      <div className="flex justify-between items-baseline mb-1">
        <div>
          <span className="text-slate-300 text-xs">{label}</span>
          {sublabel && <span className="text-slate-500 text-xs ml-1">{sublabel}</span>}
        </div>
        <span className={`text-xs font-semibold ${labelColor[status]}`}>
          {status === 'waived' ? 'Dispensado' : `${percent}%`}
        </span>
      </div>
      <div className="bg-slate-800 h-1.5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor[status]}`}
          style={{ width: `${displayPct}%` }}
        />
      </div>
    </div>
  )
}
