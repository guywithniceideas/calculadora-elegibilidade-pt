'use client'
import type { ScreeningAnswers, Objetivo, Situacao, Familia } from '@/lib/types'

interface Props {
  answers: ScreeningAnswers
  onChange: (answers: ScreeningAnswers) => void
  onNext: () => void
}

const OBJETIVO_OPTIONS: { value: Objetivo; label: string }[] = [
  { value: 'presencial',    label: 'Trabalhar presencialmente para uma empresa portuguesa' },
  { value: 'remoto',        label: 'Trabalhar remotamente para empresa fora de Portugal' },
  { value: 'empreender',    label: 'Empreender / abrir empresa / ser autônomo' },
  { value: 'renda_passiva', label: 'Viver de renda passiva (aposentadoria, aluguéis, dividendos)' },
  { value: 'estudar',       label: 'Estudar (Graduação, Mestrado e Doutorado)' },
]

const SITUACAO_OPTIONS: { value: Situacao; label: string }[] = [
  { value: 'empregado',  label: 'Empregado (CLT ou equivalente)' },
  { value: 'freelancer', label: 'Freelancer / prestador de serviços independente' },
  { value: 'empresario', label: 'Empresário / sócio de empresa' },
  { value: 'aposentado', label: 'Aposentado / pensionista' },
  { value: 'investidor', label: 'Investidor / vivo de renda' },
  { value: 'estudante',  label: 'Estudante' },
]

const FAMILIA_OPTIONS: { value: Familia; label: string }[] = [
  { value: 'sozinho',        label: 'Vou sozinho' },
  { value: 'conjuge',        label: 'Cônjuge / Parceiro' },
  { value: 'conjuge_filhos', label: 'Cônjuge e Filhos' },
  { value: 'filhos',         label: 'Só com Filhos' },
]

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[9px] font-black tracking-[1.8px] uppercase text-[#666] mb-2.5">{children}</p>
  )
}

function ChipGroup<T extends string>({
  options,
  selected,
  onSelect,
}: {
  options: { value: T; label: string }[]
  selected: T | null
  onSelect: (v: T | null) => void
}) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onSelect(selected === opt.value ? null : opt.value)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            selected === opt.value
              ? 'bg-[#1A1A1A] text-white'
              : 'bg-[#F4F2EE] text-[#555] border border-dashed border-[#CCC] hover:border-[#999] hover:text-[#1A1A1A]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export default function ScreeningPanel({ answers, onChange, onNext }: Props) {
  const allAnswered = answers.objetivo !== null && answers.situacao !== null && answers.familia !== null
  const set = (patch: Partial<ScreeningAnswers>) => onChange({ ...answers, ...patch })

  return (
    <div className="h-full overflow-y-auto p-5 flex flex-col">
      <p className="text-[9px] font-black tracking-[1.8px] uppercase text-[#666] mb-4">Rastreio de Perfil</p>

      <SectionLabel>Qual seu objetivo em Portugal?</SectionLabel>
      <ChipGroup
        options={OBJETIVO_OPTIONS}
        selected={answers.objetivo}
        onSelect={v => set({ objetivo: v })}
      />

      <div className="h-px bg-[#E8E5E0] mb-4" />

      <SectionLabel>Qual sua situação profissional?</SectionLabel>
      <ChipGroup
        options={SITUACAO_OPTIONS}
        selected={answers.situacao}
        onSelect={v => set({ situacao: v })}
      />

      <div className="h-px bg-[#E8E5E0] mb-4" />

      <SectionLabel>Quem vem com você?</SectionLabel>
      <ChipGroup
        options={FAMILIA_OPTIONS}
        selected={answers.familia}
        onSelect={v => set({ familia: v })}
      />

      <div className="mt-auto pt-4">
        <button
          onClick={onNext}
          disabled={!allAnswered}
          className={`w-full py-3 rounded-2xl text-sm font-bold transition-colors ${
            allAnswered
              ? 'bg-[#1A1A1A] text-white hover:bg-[#333]'
              : 'bg-[#E8E5E0] text-[#AAA] cursor-not-allowed'
          }`}
        >
          Próxima Etapa →
        </button>
      </div>
    </div>
  )
}
