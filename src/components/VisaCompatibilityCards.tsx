import type { VisaScore, VisaTypeId } from '@/lib/types'

interface Props {
  scores: VisaScore[]
  step: 1 | 2
  activeVisaId?: VisaTypeId
}

// Circular progress for the featured card — stroke in #998a72
function CircularProgress({ score }: { score: number }) {
  const r = 32
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - score / 100)
  return (
    <div className="relative flex-shrink-0" style={{ width: 78, height: 78 }}>
      <svg width="78" height="78" viewBox="0 0 78 78" style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx="39" cy="39" r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="7"
        />
        <circle
          cx="39" cy="39" r={r}
          fill="none"
          stroke="#998a72"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ filter: 'drop-shadow(0 0 4px rgba(153,138,114,0.45))' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-black text-white"
           style={{ fontSize: 18, letterSpacing: '-0.5px' }}>
        {score}%
      </div>
    </div>
  )
}

export default function VisaCompatibilityCards({ scores, step, activeVisaId }: Props) {
  // In step 2, the featured card is the active visa (or top score)
  const featuredId = step === 2 ? (activeVisaId ?? scores[0]?.visaId) : null
  const featured = featuredId ? scores.find(s => s.visaId === featuredId) ?? scores[0] : null

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[9px] font-black tracking-[1.8px] uppercase text-[#999] mb-1">
        Compatibilidade com Vistos
      </p>

      {/* Featured card with circular progress — only in step 2 */}
      {step === 2 && featured && (
        <div
          className="rounded-2xl p-4 flex items-center justify-between gap-3 mb-1"
          style={{ background: '#1A1914' }}
        >
          <div className="flex-1">
            <p className="text-[8px] font-bold tracking-[1.5px] uppercase mb-2"
               style={{ color: 'rgba(255,255,255,0.28)' }}>
              Melhor Compatibilidade
            </p>
            <p className="text-base font-extrabold text-white leading-tight mb-1.5">
              {featured.label}
            </p>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.38)' }}>
              {featured.description}
            </p>
          </div>
          <CircularProgress score={featured.score} />
        </div>
      )}

      {/* All visa cards with bars — #998a72 */}
      {scores.map(vs => (
        <div
          key={vs.visaId}
          className="bg-white rounded-2xl p-3.5 shadow-sm border border-[#E0E0E0]"
        >
          <div className="flex justify-between items-baseline mb-1.5">
            <span className="text-xs font-bold text-[#1A1A1A]">{vs.label}</span>
            <span className="text-xs font-black text-[#444]">{vs.score}%</span>
          </div>
          <div className="bg-[#E0E0E0] h-1.5 rounded-full overflow-hidden mb-1.5">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${vs.score}%`, background: '#998a72' }}
            />
          </div>
          <p className="text-[10px] text-[#777]">{vs.description}</p>
        </div>
      ))}
    </div>
  )
}
