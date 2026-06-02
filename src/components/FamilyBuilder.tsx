'use client'
import type { FamilyComposition } from '@/lib/types'

interface Props {
  family: FamilyComposition
  onChange: (family: FamilyComposition) => void
}

export default function FamilyBuilder({ family, onChange }: Props) {
  const { spouses, children, adultDependents } = family

  const addSpouse = () => onChange({ ...family, spouses: 1 })
  const removeSpouse = () => onChange({ ...family, spouses: 0 })
  const addChild = () => onChange({ ...family, children: children + 1 })
  const removeChild = () => onChange({ ...family, children: Math.max(0, children - 1) })
  const addDependent = () => onChange({ ...family, adultDependents: adultDependents + 1 })
  const removeDependent = () => onChange({ ...family, adultDependents: Math.max(0, adultDependents - 1) })

  return (
    <div className="flex flex-wrap gap-2">
      {/* Titular — não removível */}
      <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-200">
        👤 <span>Titular</span>
        <span className="bg-indigo-600 text-white text-[10px] px-1.5 rounded">Você</span>
      </div>

      {/* Cônjuge */}
      {spouses === 1 ? (
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-200">
          👤 <span>Cônjuge</span>
          <button
            aria-label="Remover cônjuge"
            onClick={removeSpouse}
            className="text-slate-400 hover:text-red-400 ml-1 font-bold"
          >
            ×
          </button>
        </div>
      ) : (
        <button
          onClick={addSpouse}
          className="bg-slate-900 border border-dashed border-slate-600 rounded-md px-3 py-1.5 text-xs text-slate-400 hover:border-indigo-500 hover:text-indigo-400 transition-colors"
        >
          + Cônjuge
        </button>
      )}

      {/* Filhos */}
      {Array.from({ length: children }).map((_, i) => (
        <div key={i} className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-200">
          👶 <span>Filho {children > 1 ? i + 1 : ''}</span>
          <button
            aria-label={`Remover filho ${i + 1}`}
            onClick={removeChild}
            className="text-slate-400 hover:text-red-400 ml-1 font-bold"
          >
            ×
          </button>
        </div>
      ))}
      <button
        onClick={addChild}
        className="bg-slate-900 border border-dashed border-slate-600 rounded-md px-3 py-1.5 text-xs text-slate-400 hover:border-indigo-500 hover:text-indigo-400 transition-colors"
      >
        + Filho
      </button>

      {/* Dependentes adultos */}
      {Array.from({ length: adultDependents }).map((_, i) => (
        <div key={i} className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-200">
          👤 <span>Dep. Adulto {adultDependents > 1 ? i + 1 : ''}</span>
          <button
            aria-label={`Remover dependente adulto ${i + 1}`}
            onClick={removeDependent}
            className="text-slate-400 hover:text-red-400 ml-1 font-bold"
          >
            ×
          </button>
        </div>
      ))}
      <button
        onClick={addDependent}
        className="bg-slate-900 border border-dashed border-slate-600 rounded-md px-3 py-1.5 text-xs text-slate-400 hover:border-indigo-500 hover:text-indigo-400 transition-colors"
      >
        + Dep. Adulto
      </button>
    </div>
  )
}
