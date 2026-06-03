import type { Step } from '@/lib/types'

interface Props {
  step: Step
}

export default function StepIndicator({ step }: Props) {
  return (
    <div className="flex items-center justify-center gap-3 py-3 px-4">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-[#1A1A1A] text-white">
          {step > 1 ? '✓' : '1'}
        </div>
        <span className={`text-xs font-semibold ${step === 1 ? 'text-[#1A1A1A]' : 'text-[#666]'}`}>
          Perfil do Visto
        </span>
      </div>

      <div className={`h-px w-10 ${step === 2 ? 'bg-[#998a72]' : 'bg-[#CCC]'}`} />

      <div className="flex items-center gap-2">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
          step === 2
            ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
            : 'bg-transparent text-[#999] border-[#CCC]'
        }`}>
          2
        </div>
        <span className={`text-xs font-semibold ${step === 2 ? 'text-[#1A1A1A]' : 'text-[#999]'}`}>
          Análise de Renda
        </span>
      </div>
    </div>
  )
}
