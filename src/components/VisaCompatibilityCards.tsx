import type { VisaScore, VisaTypeId } from '@/lib/types'

interface Props {
  scores: VisaScore[]
  step: 1 | 2
  activeVisaId?: VisaTypeId
}

function barColor(score: number): string {
  if (score >= 75) return 'bg-[#2E6B3E]'
  if (score >= 40) return 'bg-[#8B6A1A]'
  return 'bg-[#8B2E2E]'
}

function pctColor(score: number): string {
  if (score >= 75) return 'text-[#2E6B3E]'
  if (score >= 40) return 'text-[#8B6A1A]'
  return 'text-[#8B2E2E]'
}

export default function VisaCompatibilityCards({ scores, step, activeVisaId }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[9px] font-black tracking-[1.8px] uppercase text-[#666] mb-1">
        Compatibilidade com Vistos
      </p>
      {scores.map(vs => {
        const isActive = step === 2 && vs.visaId === activeVisaId
        return (
          <div
            key={vs.visaId}
            className={`bg-white rounded-2xl p-3.5 shadow-sm border transition-colors ${
              isActive ? 'border-[#1A1A1A]' : 'border-[#E8E5E0]'
            }`}
          >
            <div className="flex justify-between items-baseline mb-1.5">
              <span className="text-xs font-bold text-[#1A1A1A]">{vs.label}</span>
              <span className={`text-xs font-black ${pctColor(vs.score)}`}>{vs.score}%</span>
            </div>
            <div className="bg-[#E8E5E0] h-1.5 rounded-full overflow-hidden mb-1.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColor(vs.score)}`}
                style={{ width: `${vs.score}%` }}
              />
            </div>
            <p className="text-[10px] text-[#777]">{vs.description}</p>
          </div>
        )
      })}
    </div>
  )
}
