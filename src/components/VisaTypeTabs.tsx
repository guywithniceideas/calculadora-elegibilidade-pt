'use client'
import type { VisaType } from '@/lib/types'

const tabs: { id: VisaType; label: string; sub: string }[] = [
  { id: 'D7', label: 'D7', sub: 'Renda Passiva' },
  { id: 'D8', label: 'D8', sub: 'Nômade Digital' },
  { id: 'D2', label: 'D2', sub: 'Empreendedor' },
]

interface Props {
  active: VisaType
  onChange: (v: VisaType) => void
}

export default function VisaTypeTabs({ active, onChange }: Props) {
  return (
    <div className="flex gap-1 p-1.5 bg-white rounded-2xl shadow-sm">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 ${
            active === tab.id
              ? 'bg-[#1A1A1A] text-white'
              : 'bg-transparent text-[#666] hover:bg-[#F4F2EE] hover:text-[#1A1A1A]'
          }`}
        >
          <span className="font-bold">{tab.label}</span>
          <span className="block text-[10px] font-normal mt-0.5 opacity-70">{tab.sub}</span>
        </button>
      ))}
    </div>
  )
}
