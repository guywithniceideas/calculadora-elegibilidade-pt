'use client'
import type { FamilyComposition } from '@/lib/types'

interface Props {
  family: FamilyComposition
  onChange: (family: FamilyComposition) => void
}

function Chip({ label, onRemove, badge }: { label: string; onRemove?: () => void; badge?: string }) {
  return (
    <div className="flex items-center gap-1.5 bg-[#1A1A1A] text-white px-3 py-1.5 rounded-full text-xs font-semibold">
      <span>{label}</span>
      {badge && (
        <span className="bg-[#555] text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">{badge}</span>
      )}
      {onRemove && (
        <button
          aria-label={`Remover ${label.toLowerCase()}`}
          onClick={onRemove}
          className="text-white/60 hover:text-white ml-0.5 font-normal text-sm leading-none"
        >
          ×
        </button>
      )}
    </div>
  )
}

function AddChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#F4F2EE] text-[#555] border border-dashed border-[#CCC] hover:border-[#999] hover:text-[#1A1A1A] transition-colors"
    >
      {label}
    </button>
  )
}

export default function FamilyBuilder({ family, onChange }: Props) {
  const { spouses, children, adultDependents } = family

  return (
    <div className="flex flex-wrap gap-2">
      <Chip label="Titular" badge="Você" />

      {spouses === 1 ? (
        <Chip
          label="Cônjuge"
          onRemove={() => onChange({ ...family, spouses: 0 })}
        />
      ) : (
        <AddChip label="+ Cônjuge" onClick={() => onChange({ ...family, spouses: 1 })} />
      )}

      {Array.from({ length: children }).map((_, i) => (
        <Chip
          key={i}
          label={children > 1 ? `Filho ${i + 1}` : 'Filho'}
          onRemove={() => onChange({ ...family, children: Math.max(0, children - 1) })}
        />
      ))}
      <AddChip label="+ Filho" onClick={() => onChange({ ...family, children: children + 1 })} />

      {Array.from({ length: adultDependents }).map((_, i) => (
        <Chip
          key={i}
          label={adultDependents > 1 ? `Dep. Adulto ${i + 1}` : 'Dep. Adulto'}
          onRemove={() => onChange({ ...family, adultDependents: Math.max(0, adultDependents - 1) })}
        />
      ))}
      <AddChip label="+ Dep. Adulto" onClick={() => onChange({ ...family, adultDependents: adultDependents + 1 })} />
    </div>
  )
}
