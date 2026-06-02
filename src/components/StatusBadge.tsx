import type { EligibilityStatus } from '@/lib/types'

const config: Record<EligibilityStatus, { label: string; sub: string }> = {
  eligible:   { label: 'Perfil Elegível',          sub: 'Sua renda e poupança atendem os requisitos' },
  partial:    { label: 'Parcialmente Elegível',     sub: 'Um dos critérios não foi atingido' },
  ineligible: { label: 'Não Elegível',              sub: 'Renda e/ou poupança abaixo do mínimo' },
}

const indicator: Record<EligibilityStatus, string> = {
  eligible:   'bg-[#1A1A1A]',
  partial:    'bg-[#888]',
  ineligible: 'bg-[#CCC]',
}

export default function StatusBadge({ status }: { status: EligibilityStatus }) {
  const { label, sub } = config[status]
  return (
    <div className="bg-[#1A1A1A] rounded-2xl p-5 relative overflow-hidden">
      <div className="absolute w-36 h-36 bg-white/[0.04] rounded-full -right-8 -top-8" />
      <div
        className={`inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full mb-3 ${
          status === 'eligible' ? 'bg-white/10 text-white/80' :
          status === 'partial'  ? 'bg-white/10 text-white/60' :
                                  'bg-white/10 text-white/40'
        }`}
      >
        {status === 'eligible' ? '✓' : status === 'partial' ? '⚠' : '✕'} Resultado
      </div>
      <p className="text-2xl font-extrabold text-white tracking-tight leading-tight relative z-10">{label}</p>
      <p className="text-xs text-white/50 mt-1.5 relative z-10">{sub}</p>
    </div>
  )
}
