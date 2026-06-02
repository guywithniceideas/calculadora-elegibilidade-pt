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
    <div className="flex gap-1 p-1 bg-slate-900 rounded-lg">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
            active === tab.id
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <span className="font-bold">{tab.label}</span>
          <span className="block text-[10px] font-normal opacity-80">{tab.sub}</span>
        </button>
      ))}
    </div>
  )
}
