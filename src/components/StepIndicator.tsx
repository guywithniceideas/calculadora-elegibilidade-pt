import type { Step } from '@/lib/types'

interface Props {
  step: Step
}

export default function StepIndicator({ step }: Props) {
  return (
    <div className="flex items-center justify-center gap-3 py-3 px-4">
      {/* Step 1 */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-[#1A1A1A] text-white">
          ✓
        </div>
        <span className={`text-xs font-semibold ${step === 1 ? 'text-[#1A1A1A]' : 'text-[#666]'}`}>
          Perfil do Visto
        </span>
      </div>

      {/* Connector 1→2 */}
      <div className={`h-px w-10 ${step >= 2 ? 'bg-[#998a72]' : 'bg-[#CCC]'}`} />

      {/* Step 2 */}
      <div className="flex items-center gap-2">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
          step >= 2
            ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
            : 'bg-transparent text-[#999] border-[#CCC]'
        }`}>
          {step > 2 ? '✓' : '2'}
        </div>
        <span className={`text-xs font-semibold ${
          step === 2 ? 'text-[#1A1A1A]' : step > 2 ? 'text-[#666]' : 'text-[#999]'
        }`}>
          Análise de Renda
        </span>
      </div>

      {/* Step 3 — sem número, apenas ícone de finalização */}
      {step === 3 && (
        <>
          <div className="h-px w-10 bg-[#998a72]" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#1A1A1A] bg-white">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-[#1A1A1A]">
              Consultoria
            </span>
          </div>
        </>
      )}
    </div>
  )
}
