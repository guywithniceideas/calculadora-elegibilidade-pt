'use client'
import { useEffect, useState } from 'react'

interface Props { onClose: () => void }

export default function LoadingOverlay({ onClose }: Props) {
  const [phase, setPhase] = useState<'loading' | 'done' | 'closeable'>('loading')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('done'), 3000)
    const t2 = setTimeout(() => setPhase('closeable'), 5000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div className="fixed inset-0 z-40 bg-white flex flex-col items-center justify-center px-4 overflow-y-auto py-8">

      {/* Loading phase */}
      {phase === 'loading' && (
        <>
          <div className="w-8 h-8 border-2 border-[#E8E5E0] border-t-[#1A1A1A] rounded-full animate-spin mb-4" />
          <p className="text-sm font-semibold text-[#1A1A1A] mb-1">Preparando seu relatório preliminar...</p>
          <p className="text-xs text-[#AAA]">Isso levará apenas alguns instantes</p>
        </>
      )}

      {/* Success + upsell phase */}
      {phase !== 'loading' && (
        <>
          {/* Check de sucesso */}
          <div className="w-12 h-12 rounded-full bg-[#1A1A1A] flex items-center justify-center mb-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="text-sm font-bold text-[#1A1A1A] mb-1">Relatório Preliminar enviado por email!</p>
          <p className="text-xs text-[#AAA] mb-8">Verifique sua caixa de entrada</p>

          {/* Upsell */}
          <div className="bg-[#F4F2EE] rounded-3xl p-6 max-w-sm w-full text-center border border-[#E8E5E0]">
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

          {phase === 'closeable' && (
            <button
              onClick={onClose}
              className="mt-6 text-xs text-[#888] underline hover:text-[#444]"
            >
              Fechar e voltar à calculadora
            </button>
          )}
        </>
      )}
    </div>
  )
}
