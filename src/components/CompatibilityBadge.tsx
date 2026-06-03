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
  return 'Renda e/ou poupança abaixo do mínimo exigido.'
}

function WaveChart() {
  return (
    <svg
      className="absolute right-0 top-0 w-40 h-28 z-10 pointer-events-none"
      viewBox="0 0 160 120"
      fill="none"
    >
      <defs>
        <linearGradient id="wfade" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#998a72" stopOpacity="0" />
          <stop offset="30%" stopColor="#998a72" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#998a72" stopOpacity="0.65" />
        </linearGradient>
      </defs>
      <polyline
        points="10,95 25,78 38,85 52,55 65,68 78,42 90,58 105,30 118,45 132,22 145,35 158,18"
        stroke="url(#wfade)" strokeWidth="2.5"
        fill="none" strokeLinecap="round" strokeLinejoin="round"
      />
      <circle cx="52" cy="55" r="3.5" fill="#998a72" opacity="0.7" />
      <circle cx="105" cy="30" r="4" fill="#998a72" opacity="0.8" />
      <circle cx="145" cy="22" r="4.5" fill="#998a72" opacity="0.9" />
      <polyline
        points="10,105 25,92 38,97 52,72 65,82 78,60 90,73 105,48 118,60 132,38 145,50 158,32"
        stroke="url(#wfade)" strokeWidth="1"
        fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.3"
      />
      <path
        d="M10,95 25,78 38,85 52,55 65,68 78,42 90,58 105,30 118,45 132,22 145,35 158,18 L158,120 L10,120 Z"
        fill="url(#wfade)" opacity="0.06"
      />
    </svg>
  )
}

export default function CompatibilityBadge({ score }: { score: number }) {
  return (
    <div className="relative rounded-2xl p-5 overflow-hidden" style={{ background: '#1A1914' }}>
      <WaveChart />
      <span
        className="inline-block text-[9px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-md mb-2.5 relative z-20"
        style={{ border: '1px solid rgba(255,255,255,0.22)', color: 'rgba(255,255,255,0.72)' }}
      >
        Resultado
      </span>
      <p className="text-2xl font-extrabold text-white tracking-tight leading-tight relative z-20">
        {getLabel(score)}
      </p>
      <p className="text-xs mt-1.5 relative z-20" style={{ color: 'rgba(255,255,255,0.38)' }}>
        {getSub(score)}
      </p>
    </div>
  )
}
