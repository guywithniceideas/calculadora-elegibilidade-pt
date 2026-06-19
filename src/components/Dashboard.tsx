'use client'
import { useEffect, useState } from 'react'
import { motion, animate, useReducedMotion, type TargetAndTransition } from 'framer-motion'
import { calculate } from '@/lib/calculator'
import { scoreVisas, applyFinancialScore, getTop3Visas } from '@/lib/compatibility'
import DownloadPdfButton from './DownloadPdfButton'
import type { UserProfile } from '@/app/api/profile/route'
import type { VisaScore } from '@/lib/types'

const WHATSAPP_URL =
  'https://api.whatsapp.com/send/?phone=351937186286&text&type=phone_number&app_absent=0'

function fmt(n: number) {
  return `€ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const STATUS_META = {
  eligible: { label: 'Elegível', color: '#16a34a', bg: 'rgba(22,163,74,0.12)' },
  partial: { label: 'Parcialmente Elegível', color: '#d97706', bg: 'rgba(217,119,6,0.12)' },
  ineligible: { label: 'Não Elegível', color: '#dc2626', bg: 'rgba(220,38,38,0.12)' },
} as const

const easeOut = [0.25, 0.1, 0.25, 1] as const
const cardShadow = '0 4px 24px rgba(0,0,0,0.06)'
const cardShadowHover = '0 12px 32px rgba(0,0,0,0.1)'

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
}

function AnimatedNumber({ value, format }: { value: number; format: (n: number) => string }) {
  const [display, setDisplay] = useState(0)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplay(value)
      return
    }
    const controls = animate(0, value, { duration: 1, ease: easeOut, onUpdate: setDisplay })
    return () => controls.stop()
  }, [value, shouldReduceMotion])

  return <>{format(display)}</>
}

function AmbientBackground() {
  const shouldReduceMotion = useReducedMotion()
  const loop = (extra: TargetAndTransition) => (shouldReduceMotion ? undefined : extra)

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" style={{ background: '#F2F2F2' }}>
      <motion.div
        className="absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full blur-3xl"
        style={{ background: 'rgba(0,0,0,0.04)' }}
        animate={loop({ x: [0, -18, 8, 0], y: [0, 14, -8, 0] })}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 -left-24 w-96 h-96 rounded-full blur-3xl"
        style={{ background: 'rgba(153,138,114,0.10)' }}
        animate={loop({ x: [0, 14, -10, 0], y: [0, -10, 6, 0] })}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

function Avatar({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || '?'
  return (
    <div className="w-9 h-9 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
      {initial}
    </div>
  )
}

function ScoreRing({ score, size = 64 }: { score: number; size?: number }) {
  const radius = size / 2 - 6
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(score, 100) / 100) * circumference
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="5" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#998a72" strokeWidth="5"
          strokeDasharray={circumference}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: easeOut }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={size >= 60 ? 'text-sm font-extrabold text-white' : 'text-[11px] font-extrabold text-white'}>
          <AnimatedNumber value={score} format={n => `${Math.round(n)}%`} />
        </span>
      </div>
    </div>
  )
}

function MiniBar({ label, percent, color, dark }: { label: string; percent: number; color: string; dark?: boolean }) {
  const pct = Math.min(percent, 100)
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className={`text-[10px] font-semibold ${dark ? 'text-white/55' : 'text-[#888]'}`}>{label}</span>
        <span className={`text-[10px] font-bold ${dark ? 'text-white/80' : 'text-[#1A1A1A]'}`}>{percent}%</span>
      </div>
      <div className={`h-1.5 rounded-full overflow-hidden ${dark ? 'bg-white/10' : 'bg-[#EFEFEF]'}`}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: easeOut, delay: 0.1 }}
        />
      </div>
    </div>
  )
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -3, boxShadow: cardShadowHover }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className={`rounded-3xl p-5 bg-white border border-[#F0F0F0] ${className}`}
      style={{ boxShadow: cardShadow }}
    >
      {children}
    </motion.div>
  )
}

function StatBlock({ label, value, format, sub }: { label: string; value: number; format: (n: number) => string; sub: string }) {
  return (
    <Card>
      <p className="text-[9px] font-black tracking-wide uppercase text-[#999] mb-1.5">{label}</p>
      <p className="text-lg font-extrabold text-[#1A1A1A] tracking-tight">
        <AnimatedNumber value={value} format={format} />
      </p>
      <p className="text-[10px] font-medium text-[#999] mt-0.5">{sub}</p>
    </Card>
  )
}

function MiniVisaCard({ visa }: { visa: VisaScore }) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -3, boxShadow: '0 12px 32px rgba(0,0,0,0.22)' }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className="rounded-3xl p-4 flex items-center gap-3"
      style={{ background: '#1A1914', boxShadow: '0 6px 20px rgba(0,0,0,0.16)' }}
    >
      <ScoreRing score={visa.score} size={48} />
      <div className="min-w-0">
        <p className="text-sm font-bold text-white truncate">{visa.label}</p>
        <p className="text-[10px] text-white/45 truncate">{visa.description}</p>
      </div>
    </motion.div>
  )
}

interface Props {
  userName: string
  profile: UserProfile | null
  onStart: () => void
}

export default function Dashboard({ userName, profile, onStart }: Props) {
  const firstName = userName.split(' ')[0]
  const hasProfile = !!profile

  const result = profile ? calculate(profile.input) : null
  const rawScores = profile ? scoreVisas(profile.screening) : []
  const scoredVisas = profile && result
    ? applyFinancialScore(rawScores, profile.input.visaType, result.incomePercent, result.savingsPercent)
    : rawScores
  const top3 = getTop3Visas(scoredVisas)
  const topVisa = top3[0]
  const otherVisas = top3.slice(1)
  const totalMembers = profile
    ? 1 + profile.input.family.spouses + profile.input.family.children + profile.input.family.adultDependents
    : 0
  const statusMeta = result ? STATUS_META[result.overallStatus] : null
  const updatedAtDate = profile
    ? new Date(profile.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    : ''
  const updatedAtTime = profile
    ? new Date(profile.updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <div className="relative flex-1">
      <AmbientBackground />

      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="show"
        className="px-4 md:px-6 py-6 max-w-4xl mx-auto flex flex-col gap-3"
      >
        <motion.div variants={itemVariants} className="flex items-center justify-between gap-3 mb-1">
          <div>
            <p className="text-[10px] font-black tracking-[1.8px] uppercase text-[#998a72] mb-1">Bem-vindo de volta</p>
            <h1 className="text-2xl font-extrabold text-[#1A1A1A] tracking-tight">Olá, {firstName}</h1>
          </div>
          <div className="flex items-center gap-2.5">
            {hasProfile && (
              <motion.button
                onClick={onStart}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="inline-flex items-center gap-1.5 bg-[#1A1A1A] hover:bg-[#333] text-white text-xs font-bold pl-4 pr-3.5 py-2.5 rounded-full transition-colors"
              >
                Calcular novamente
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </motion.button>
            )}
            <Avatar name={userName} />
          </div>
        </motion.div>

        {hasProfile && result && topVisa ? (
          <>
            {/* Linha 1 — Resumo (dark) + Critérios financeiros */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -3, boxShadow: '0 14px 36px rgba(0,0,0,0.22)' }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                className="lg:col-span-2 rounded-3xl p-6 flex items-center gap-5"
                style={{ background: '#1A1914', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
              >
                <ScoreRing score={topVisa.score} />
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-black tracking-wide uppercase text-white/45 mb-1">
                    Visto mais compatível
                  </p>
                  <p className="text-lg font-extrabold text-white tracking-tight leading-tight truncate">
                    {topVisa.label}
                  </p>
                  {statusMeta && (
                    <span
                      className="inline-block mt-2 text-[10px] font-bold px-2.5 py-1 rounded-full"
                      style={{ color: statusMeta.color, background: statusMeta.bg }}
                    >
                      {statusMeta.label}
                    </span>
                  )}
                </div>
              </motion.div>

              <Card className="lg:col-span-1 flex flex-col gap-4 justify-center">
                <p className="text-[9px] font-black tracking-wide uppercase text-[#999]">Critérios Financeiros</p>
                <MiniBar label="Renda vs. exigida" percent={result.incomePercent} color="#1A1A1A" />
                <MiniBar
                  label="Poupança vs. exigida"
                  percent={profile.input.hasCPLPTerm ? 100 : result.savingsPercent}
                  color="#998a72"
                />
              </Card>
            </div>

            {/* Linha 2 — Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <StatBlock
                label="Renda mensal"
                value={profile.input.monthlyIncome}
                format={fmt}
                sub={`${result.incomePercent}% do exigido`}
              />
              <StatBlock
                label="Composição familiar"
                value={totalMembers}
                format={n => `${Math.round(n)} ${Math.round(n) === 1 ? 'pessoa' : 'pessoas'}`}
                sub={profile.input.family.spouses || profile.input.family.children ? 'Inclui dependentes' : 'Apenas titular'}
              />
              <Card>
                <p className="text-[9px] font-black tracking-wide uppercase text-[#999] mb-1.5">Última atualização</p>
                <p className="text-lg font-extrabold text-[#1A1A1A] tracking-tight">{updatedAtDate}</p>
                <p className="text-[10px] font-medium text-[#999] mt-0.5">{updatedAtTime}</p>
              </Card>
            </div>

            {/* Linha 3 — Outros vistos compatíveis */}
            {otherVisas.length > 0 && (
              <motion.div variants={itemVariants}>
                <p className="text-[10px] font-black tracking-wide uppercase text-[#999] mb-2 mt-1">
                  Outros vistos compatíveis
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {otherVisas.map(v => <MiniVisaCard key={v.visaId} visa={v} />)}
                </div>
              </motion.div>
            )}

            {/* Linha 4 — Ações */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
              <motion.a
                variants={itemVariants}
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -3, boxShadow: cardShadowHover }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                className="rounded-3xl p-5 bg-white border border-[#F0F0F0] flex items-center gap-3.5"
                style={{ boxShadow: cardShadow }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#25D366' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-[#1A1A1A]">Falar com Especialista</p>
                  <p className="text-[10px] text-[#999]">Consultoria jurídica via WhatsApp</p>
                </div>
              </motion.a>

              <motion.div
                variants={itemVariants}
                whileHover={{ y: -3, boxShadow: cardShadowHover }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                className="rounded-3xl p-5 bg-white border border-[#F0F0F0] flex flex-col gap-3"
                style={{ boxShadow: cardShadow }}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-[#1A1A1A]">Relatório em PDF</p>
                    <p className="text-[10px] text-[#999]">Baixe e envie para sua assessoria</p>
                  </div>
                </div>
                <DownloadPdfButton input={profile.input} result={result} />
              </motion.div>
            </div>
          </>
        ) : (
          <motion.div
            variants={itemVariants}
            className="rounded-3xl p-10 bg-white border border-[#F0F0F0] flex flex-col items-center text-center gap-4"
            style={{ boxShadow: cardShadow }}
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-14 h-14 rounded-full bg-[#1A1A1A] flex items-center justify-center"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11H3v11h6V11Zm12-7h-6v18h6V4ZM15 8H9v14h6V8Z" />
              </svg>
            </motion.div>
            <div>
              <h2 className="text-lg font-extrabold text-[#1A1A1A] tracking-tight mb-1.5">
                Você ainda não fez sua análise
              </h2>
              <p className="text-sm text-[#666] leading-relaxed max-w-xs mx-auto">
                Responda 3 perguntas rápidas e descubra qual visto português combina mais com o seu perfil.
              </p>
            </div>
            <motion.button
              onClick={onStart}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="bg-[#1A1A1A] hover:bg-[#333] text-white px-6 py-3 rounded-2xl text-sm font-bold transition-colors"
            >
              Iniciar Análise Gratuita →
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
