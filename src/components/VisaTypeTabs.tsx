'use client'
import { motion } from 'framer-motion'
import type { VisaType } from '@/lib/types'

const tabs: { id: VisaType; label: string; sub: string }[] = [
  { id: 'D1', label: 'D1', sub: 'Trabalho CLT' },
  { id: 'D2', label: 'D2', sub: 'Empreendedor' },
  { id: 'D4', label: 'D4', sub: 'Estudante' },
  { id: 'D7', label: 'D7', sub: 'Renda Passiva' },
  { id: 'D8', label: 'D8', sub: 'Nômade Digital' },
]

interface Props {
  active: VisaType
  onChange: (v: VisaType) => void
}

export default function VisaTypeTabs({ active, onChange }: Props) {
  return (
    <div className="flex gap-1 p-1.5 bg-white rounded-2xl shadow-sm overflow-x-auto">
      {tabs.map(tab => {
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative flex-1 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors duration-150 ${
              !isActive ? 'hover:bg-[#EFEFEF]' : ''
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="visa-tab-pill"
                className="absolute inset-0 bg-[#1A1A1A] rounded-xl"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className={`relative z-10 block font-bold transition-colors duration-150 ${isActive ? 'text-white' : 'text-[#666]'}`}>
              {tab.label}
            </span>
            <span className={`relative z-10 block text-[10px] font-normal mt-0.5 transition-colors duration-150 ${isActive ? 'text-white/70' : 'text-[#999]'}`}>
              {tab.sub}
            </span>
          </button>
        )
      })}
    </div>
  )
}
