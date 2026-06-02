'use client'
import { useEffect, useState } from 'react'

interface Props { onClose: () => void }

export default function LoadingOverlay({ onClose }: Props) {
  const [phase, setPhase] = useState<'loading' | 'upsell' | 'closeable'>('loading')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('upsell'), 1500)
    const t2 = setTimeout(() => setPhase('closeable'), 4000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div className="fixed inset-0 z-40 bg-white flex flex-col items-center justify-center px-4">
      <div className="w-8 h-8 border-2 border-[#E8E5E0] border-t-[#1A1A1A] rounded-full animate-spin mb-4" />
      <p className="text-sm font-semibold text-[#1A1A1A] mb-1">Preparando seu relatório preliminar...</p>
      <p className="text-xs text-[#AAA]">Isso levará apenas alguns instantes</p>

      {phase !== 'loading' && (
        <div className="mt-8 bg-[#F4F2EE] rounded-3xl p-6 max-w-sm w-full text-center border border-[#E8E5E0]">
          <p className="text-[9px] font-black tracking-[1.5px] uppercase text-[#999] mb-3">Enquanto isso...</p>
          <p className="text-base font-extrabold text-[#1A1A1A] leading-snug mb-2">
            Se você quer saber quanto vai gastar mensalmente morando em Portugal
          </p>
          <p className="text-xs text-[#777] mb-4">
            Simule seus gastos mensais por região de acordo com o seu perfil de vida.
          </p>
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-xs text-[#AAA] line-through">R$ 37,00</span>
            <span className="text-base font-extrabold text-[#1A1A1A]">R$ 12,00</span>
          </div>
          <p className="text-[10px] text-[#999] mb-4">para quem vem pela Calculadora</p>
          <a
            href="#"
            className="block w-full bg-[#1A1A1A] text-white py-3 rounded-2xl text-sm font-bold hover:bg-[#333] transition-colors text-center"
          >
            Quero acessar por R$ 12 →
          </a>
        </div>
      )}

      {phase === 'closeable' && (
        <button
          onClick={onClose}
          className="mt-6 text-xs text-[#888] underline hover:text-[#444]"
        >
          Fechar e voltar à calculadora
        </button>
      )}
    </div>
  )
}
