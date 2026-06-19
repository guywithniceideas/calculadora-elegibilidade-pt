'use client'
import { motion, AnimatePresence } from 'framer-motion'
import type { FamilyComposition } from '@/lib/types'
import Switch from './Switch'

interface Props {
  family: FamilyComposition
  onChange: (family: FamilyComposition) => void
}

const easeOut = [0.25, 0.1, 0.25, 1] as const

function IconCircle({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
      active ? 'bg-[#1A1A1A] text-white' : 'bg-[#EFEFEF] text-[#888]'
    }`}>
      {children}
    </div>
  )
}

function StepperButton({ onClick, disabled, ariaLabel, children }: {
  onClick: () => void; disabled?: boolean; ariaLabel: string; children: React.ReactNode
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      whileTap={disabled ? undefined : { scale: 0.85 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
        disabled ? 'bg-[#F2F2F2] text-[#CCC] cursor-not-allowed' : 'bg-[#1A1A1A] text-white hover:bg-[#333]'
      }`}
    >
      {children}
    </motion.button>
  )
}

function MinusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}
function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function Row({ icon, active, label, sub, children }: {
  icon: React.ReactNode; active?: boolean; label: string; sub: string; children: React.ReactNode
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: easeOut }}
      className="flex items-center gap-3 bg-[#F8F8F8] rounded-2xl p-3"
    >
      <IconCircle active={active}>{icon}</IconCircle>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#1A1A1A]">{label}</p>
        <p className="text-[10px] text-[#999]">{sub}</p>
      </div>
      {children}
    </motion.div>
  )
}

export default function FamilyBuilder({ family, onChange }: Props) {
  const { spouses, children, adultDependents } = family

  return (
    <div className="flex flex-col gap-2">
      <Row
        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M5 21v-2a7 7 0 0 1 14 0v2" /></svg>}
        active
        label="Titular"
        sub="Você"
      >
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#1A1A1A] text-white">Incluído</span>
      </Row>

      <Row
        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="4" /><path d="M2 21v-2a6 6 0 0 1 12 0v2" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /></svg>}
        active={spouses === 1}
        label="Cônjuge / Parceiro"
        sub={spouses === 1 ? 'Vem com você' : 'Não vem'}
      >
        <Switch
          checked={spouses === 1}
          onChange={() => onChange({ ...family, spouses: spouses === 1 ? 0 : 1 })}
          label="Cônjuge vem com você"
        />
      </Row>

      <Row
        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" /></svg>}
        active={children > 0}
        label="Filhos"
        sub={children > 0 ? `${children} ${children === 1 ? 'filho' : 'filhos'}` : 'Nenhum'}
      >
        <div className="flex items-center gap-2.5">
          <StepperButton
            onClick={() => onChange({ ...family, children: Math.max(0, children - 1) })}
            disabled={children === 0}
            ariaLabel="Remover filho"
          >
            <MinusIcon />
          </StepperButton>
          <span className="text-sm font-bold text-[#1A1A1A] w-4 text-center">{children}</span>
          <StepperButton
            onClick={() => onChange({ ...family, children: children + 1 })}
            ariaLabel="Adicionar filho"
          >
            <PlusIcon />
          </StepperButton>
        </div>
      </Row>

      <Row
        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
        active={adultDependents > 0}
        label="Dependentes adultos"
        sub={adultDependents > 0 ? `${adultDependents} ${adultDependents === 1 ? 'dependente' : 'dependentes'}` : 'Nenhum'}
      >
        <div className="flex items-center gap-2.5">
          <StepperButton
            onClick={() => onChange({ ...family, adultDependents: Math.max(0, adultDependents - 1) })}
            disabled={adultDependents === 0}
            ariaLabel="Remover dependente adulto"
          >
            <MinusIcon />
          </StepperButton>
          <span className="text-sm font-bold text-[#1A1A1A] w-4 text-center">{adultDependents}</span>
          <StepperButton
            onClick={() => onChange({ ...family, adultDependents: adultDependents + 1 })}
            ariaLabel="Adicionar dependente adulto"
          >
            <PlusIcon />
          </StepperButton>
        </div>
      </Row>

      <AnimatePresence>
        {(spouses > 0 || children > 0 || adultDependents > 0) && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: easeOut }}
            className="text-[10px] text-[#999] text-center pt-1 overflow-hidden"
          >
            Total: {1 + spouses + children + adultDependents} pessoas
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
