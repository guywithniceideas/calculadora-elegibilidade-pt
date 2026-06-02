import type { CriterionStatus } from '@/lib/types'

const fillColor: Record<CriterionStatus, string> = {
  pass:    'bg-[#1A1A1A]',
  warning: 'bg-[#BBBBB8]',
  fail:    'bg-[#BBBBB8]',
  waived:  'bg-[#DEDBD6]',
}

const pctColor: Record<CriterionStatus, string> = {
  pass:    'text-[#1A1A1A]',
  warning: 'text-[#777]',
  fail:    'text-[#999]',
  waived:  'text-[#AAA]',
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
      <div className="flex justify-between items-baseline mb-1.5">
        <div>
          <span className="text-[#444] text-xs font-semibold">{label}</span>
          {sublabel && <span className="text-[#999] text-xs ml-1">{sublabel}</span>}
        </div>
        <span className={`text-xs font-bold ${pctColor[status]}`}>
          {status === 'waived' ? 'Dispensado' : `${percent}%`}
        </span>
      </div>
      <div className="bg-[#E8E5E0] h-1.5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${fillColor[status]}`}
          style={{ width: `${displayPct}%` }}
        />
      </div>
    </div>
  )
}
