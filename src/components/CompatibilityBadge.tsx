function getLabel(score: number): string {
  if (score === 99) return 'Perfil Altamente Compatível'
  if (score >= 90) return 'Compatibilidade Alta'
  if (score >= 75) return 'Compatibilidade Moderada'
  return 'Compatibilidade Baixa'
}

function getSub(score: number): string {
  if (score === 99) return 'Perfil altamente compatível com os requisitos do visto'
  if (score >= 90) return 'Sua renda e poupança atendem os requisitos principais'
  if (score >= 75) return 'Você está próximo dos requisitos — verifique os detalhes'
  return 'Renda e/ou poupança abaixo do mínimo exigido'
}

export default function CompatibilityBadge({ score }: { score: number }) {
  return (
    <div className="bg-[#1A1A1A] rounded-2xl p-5 relative overflow-hidden">
      <div className="absolute w-36 h-36 bg-white/[0.04] rounded-full -right-8 -top-8" />
      <div className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full mb-3 bg-white/10 text-white/80">
        Resultado
      </div>
      <p className="text-2xl font-extrabold text-white tracking-tight leading-tight relative z-10">
        {getLabel(score)}
      </p>
      <p className="text-xs text-white/50 mt-1.5 relative z-10">{getSub(score)}</p>
    </div>
  )
}
