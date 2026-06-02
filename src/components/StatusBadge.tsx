import type { EligibilityStatus } from '@/lib/types'

const config: Record<EligibilityStatus, { label: string; icon: string; classes: string }> = {
  eligible: {
    label: 'Perfil Elegível',
    icon: '✅',
    classes: 'bg-emerald-950 border border-emerald-500 text-emerald-400',
  },
  partial: {
    label: 'Parcialmente Elegível',
    icon: '⚠️',
    classes: 'bg-amber-950 border border-amber-500 text-amber-400',
  },
  ineligible: {
    label: 'Não Elegível',
    icon: '❌',
    classes: 'bg-red-950 border border-red-500 text-red-400',
  },
}

export default function StatusBadge({ status }: { status: EligibilityStatus }) {
  const { label, icon, classes } = config[status]
  return (
    <div className={`flex items-center gap-3 rounded-lg px-4 py-3 ${classes}`}>
      <span className="text-xl">{icon}</span>
      <div>
        <p className="font-bold text-sm">{label}</p>
        <p className="text-xs opacity-75">
          {status === 'eligible' && 'Sua renda e poupança atendem os requisitos'}
          {status === 'partial' && 'Um dos critérios não foi atingido'}
          {status === 'ineligible' && 'Renda e/ou poupança abaixo do mínimo'}
        </p>
      </div>
    </div>
  )
}
