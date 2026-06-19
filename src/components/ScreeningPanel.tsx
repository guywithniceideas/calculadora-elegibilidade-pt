'use client'
import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import type { ScreeningAnswers, Objetivo, Situacao, Familia } from '@/lib/types'

interface Props {
  answers: ScreeningAnswers
  onChange: (answers: ScreeningAnswers) => void
  onNext: () => void
}

const easeOut = [0.25, 0.1, 0.25, 1] as const

function Icon({ paths }: { paths: readonly string[] }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {paths.map((d, i) => <path key={i} d={d} />)}
    </svg>
  )
}

const ICONS = {
  briefcase: ['M2 7h20v13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1Z', 'M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16'],
  laptop: ['M3 4h18v12H3Z', 'M1 19h22l-1.5-3h-19Z'],
  rocket: [
    'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z',
    'M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z',
    'M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0',
    'M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5',
  ],
  wallet: ['M21 12V7H5a2 2 0 0 1 0-4h14v4', 'M3 5v14a2 2 0 0 0 2 2h16v-5', 'M18 12a2 2 0 0 0 0 4h4v-4Z'],
  gradCap: ['M22 10 12 5 2 10l10 5 10-5Z', 'M6 12v5c3 3 9 3 12 0v-5', 'M22 10v6'],
  building: ['M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z', 'M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2', 'M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2', 'M10 7h4', 'M10 11h4', 'M10 15h4'],
  sun: ['M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M12 2v2', 'M12 20v2', 'M4.93 4.93l1.41 1.41', 'M17.66 17.66l1.41 1.41', 'M2 12h2', 'M20 12h2', 'M6.34 17.66l-1.41 1.41', 'M19.07 4.93l-1.41 1.41'],
  trendingUp: ['M23 6 13.5 15.5 8.5 10.5 1 18', 'M17 6h6v6'],
  user: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M5 21v-2a7 7 0 0 1 14 0v2'],
  users: ['M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M2 21v-2a6 6 0 0 1 12 0v2', 'M16 3.13a4 4 0 0 1 0 7.75', 'M22 21v-2a4 4 0 0 0-3-3.87'],
  home: ['M3 9 12 2l9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z', 'M9 22V12h6v10'],
  heart: ['M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z'],
} as const

type IconKey = keyof typeof ICONS

interface OptionDef {
  value: string
  label: string
  short: string
  icon: IconKey
}

const OBJETIVO_OPTIONS: OptionDef[] = [
  { value: 'presencial', label: 'Trabalhar presencialmente para uma empresa portuguesa', short: 'Presencial', icon: 'briefcase' },
  { value: 'remoto', label: 'Trabalhar remotamente para empresa fora de Portugal', short: 'Remoto', icon: 'laptop' },
  { value: 'empreender', label: 'Empreender / abrir empresa / ser autônomo', short: 'Empreender', icon: 'rocket' },
  { value: 'renda_passiva', label: 'Viver de renda passiva (aposentadoria, aluguéis, dividendos)', short: 'Renda Passiva', icon: 'wallet' },
  { value: 'estudar', label: 'Estudar (Graduação, Mestrado e Doutorado)', short: 'Estudar', icon: 'gradCap' },
]

const SITUACAO_OPTIONS: OptionDef[] = [
  { value: 'empregado', label: 'Empregado (CLT ou equivalente)', short: 'Empregado', icon: 'briefcase' },
  { value: 'freelancer', label: 'Freelancer / prestador de serviços independente', short: 'Freelancer', icon: 'laptop' },
  { value: 'empresario', label: 'Empresário / sócio de empresa', short: 'Empresário', icon: 'building' },
  { value: 'aposentado', label: 'Aposentado / pensionista', short: 'Aposentado', icon: 'sun' },
  { value: 'investidor', label: 'Investidor / vivo de renda', short: 'Investidor', icon: 'trendingUp' },
  { value: 'estudante', label: 'Estudante', short: 'Estudante', icon: 'gradCap' },
]

const FAMILIA_OPTIONS: OptionDef[] = [
  { value: 'sozinho', label: 'Vou sozinho', short: 'Sozinho', icon: 'user' },
  { value: 'conjuge', label: 'Cônjuge / Parceiro', short: 'Cônjuge', icon: 'users' },
  { value: 'conjuge_filhos', label: 'Cônjuge e Filhos', short: 'Cônjuge e Filhos', icon: 'home' },
  { value: 'filhos', label: 'Só com Filhos', short: 'Só com Filhos', icon: 'heart' },
]

const QUESTIONS = [
  { key: 'objetivo' as const, title: 'Qual seu objetivo em Portugal?', options: OBJETIVO_OPTIONS },
  { key: 'situacao' as const, title: 'Qual sua situação profissional?', options: SITUACAO_OPTIONS },
  { key: 'familia' as const, title: 'Quem vem com você?', options: FAMILIA_OPTIONS },
]

const questionVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 24 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -24 }),
}

function OptionRow({ icon, label, selected, onClick }: { icon: IconKey; label: string; selected: boolean; onClick: () => void }) {
  const shouldReduceMotion = useReducedMotion()
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      whileHover={shouldReduceMotion ? undefined : { x: 3 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl border text-left transition-colors ${
        selected ? 'bg-[#1A1A1A] border-[#1A1A1A]' : 'bg-white border-[#E5E5E5] hover:border-[#1A1A1A]'
      }`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
        selected ? 'bg-white/15 text-white' : 'bg-[#F2F2F2] text-[#666]'
      }`}>
        <Icon paths={ICONS[icon]} />
      </div>
      <span className={`flex-1 text-sm font-semibold leading-snug ${selected ? 'text-white' : 'text-[#1A1A1A]'}`}>
        {label}
      </span>
      <motion.div
        initial={false}
        animate={{ scale: selected ? 1 : 0, opacity: selected ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 26 }}
        className="w-5 h-5 rounded-full bg-white flex items-center justify-center flex-shrink-0"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </motion.div>
    </motion.button>
  )
}

export default function ScreeningPanel({ answers, onChange, onNext }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [maxVisited, setMaxVisited] = useState(0)
  const [direction, setDirection] = useState(1)

  const current = QUESTIONS[activeIndex]

  function goTo(index: number) {
    setDirection(index > activeIndex ? 1 : -1)
    setActiveIndex(index)
  }

  function selectOption(value: string) {
    const key = current.key
    const newValue = answers[key] === value ? null : value
    onChange({ ...answers, [key]: newValue } as ScreeningAnswers)

    if (newValue === null) return

    if (activeIndex < QUESTIONS.length - 1) {
      const next = activeIndex + 1
      window.setTimeout(() => {
        setDirection(1)
        setActiveIndex(next)
        setMaxVisited(m => Math.max(m, next))
      }, 380)
    } else {
      window.setTimeout(() => {
        onNext()
      }, 450)
    }
  }

  return (
    <div className="h-full overflow-y-auto p-6 flex flex-col">
      <p className="text-[9px] font-black tracking-[1.8px] uppercase text-[#AAA] mb-5">Rastreio de Perfil</p>

      {/* Progress — estilo "stories" */}
      <div className="flex items-center gap-2 mb-6">
        {QUESTIONS.map((q, i) => {
          const isAnswered = answers[q.key] !== null
          const reachable = i <= maxVisited
          return (
            <button
              key={q.key}
              type="button"
              onClick={() => reachable && goTo(i)}
              disabled={!reachable}
              aria-label={`Pergunta ${i + 1}${isAnswered ? ' — respondida' : ''}`}
              aria-current={i === activeIndex ? 'step' : undefined}
              className={`flex-1 h-1.5 rounded-full overflow-hidden bg-[#E5E5E5] ${reachable ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: i === activeIndex ? '#998a72' : '#1A1A1A' }}
                initial={false}
                animate={{ width: isAnswered ? '100%' : i === activeIndex ? '45%' : '0%' }}
                transition={{ duration: 0.3, ease: easeOut }}
              />
            </button>
          )
        })}
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {activeIndex > 0 && (
          <button
            type="button"
            onClick={() => goTo(activeIndex - 1)}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#999] hover:text-[#1A1A1A] transition-colors mb-3 self-start"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Voltar
          </button>
        )}

        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={activeIndex}
            custom={direction}
            variants={questionVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: easeOut }}
          >
            <p className="text-[10px] font-bold tracking-wide uppercase mb-1.5" style={{ color: '#998a72' }}>
              Pergunta {activeIndex + 1} de {QUESTIONS.length}
            </p>
            <h2 className="text-lg font-bold text-[#1A1A1A] leading-snug tracking-tight mb-4">
              {current.title}
            </h2>
            <div className="flex flex-col gap-2.5">
              {current.options.map(opt => (
                <OptionRow
                  key={opt.value}
                  icon={opt.icon}
                  label={opt.label}
                  selected={answers[current.key] === opt.value}
                  onClick={() => selectOption(opt.value)}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
