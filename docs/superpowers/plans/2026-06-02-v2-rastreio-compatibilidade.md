# V2 Rastreio + Compatibilidade de Vistos — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Step 1 screening flow with live visa compatibility bars, upgrade the calculator (Step 2) with a score-based badge, email modal, and loading screen with workshop upsell.

**Architecture:** Single-page two-step state machine. Step 1 shows screening chips + live visa compatibility cards. Step 2 shows the existing calculator (CPLP and Conservative Mode removed) with compatibility scores refined by financial data. A scoring engine in `lib/compatibility.ts` computes 0–99% compatibility for 5 visa types (D1, D2, D4, D7, D8). Email is collected via a modal but not sent yet (Sub-project 2).

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, existing @react-pdf/renderer setup.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/lib/types.ts` | Modify | Add Step, VisaTypeId, ScreeningAnswers, VisaScore types |
| `src/lib/compatibility.ts` | Create | Visa scoring engine |
| `src/lib/__tests__/compatibility.test.ts` | Create | Unit tests for scoring engine |
| `src/components/StepIndicator.tsx` | Create | Step 1 / Step 2 progress indicator |
| `src/components/ScreeningPanel.tsx` | Create | Etapa 1 left panel — 3 question blocks with chips |
| `src/components/VisaCompatibilityCards.tsx` | Create | Right panel — 3 visa cards with progress bars |
| `src/components/CompatibilityBadge.tsx` | Create | Score-based status badge (replaces StatusBadge in ResultPanel) |
| `src/components/EmailModal.tsx` | Create | Name + email modal with validation |
| `src/components/LoadingOverlay.tsx` | Create | Phased loading screen + workshop upsell |
| `src/components/InputPanel.tsx` | Modify | Remove CPLP toggle and Conservative Mode toggle |
| `src/components/ResultPanel.tsx` | Modify | Use CompatibilityBadge, new button copy, disclaimer |
| `src/app/page.tsx` | Modify | Full step orchestration, screening state, modal state |
| `src/components/__tests__/StepIndicator.test.tsx` | Create | Tests |
| `src/components/__tests__/ScreeningPanel.test.tsx` | Create | Tests |
| `src/components/__tests__/VisaCompatibilityCards.test.tsx` | Create | Tests |
| `src/components/__tests__/CompatibilityBadge.test.tsx` | Create | Tests |
| `src/components/__tests__/EmailModal.test.tsx` | Create | Tests |
| `src/components/__tests__/InputPanel.test.tsx` | Modify | Remove CPLP and conservativeMode tests |

---

## Task 1: Types + Compatibility Engine (TDD)

**Files:**
- Modify: `src/lib/types.ts`
- Create: `src/lib/compatibility.ts`
- Create: `src/lib/__tests__/compatibility.test.ts`

- [ ] **Step 1: Add new types to types.ts**

Read `src/lib/types.ts` first. Then append at the end:

```typescript
export type Step = 1 | 2

export type VisaTypeId = 'D1' | 'D2' | 'D4' | 'D7' | 'D8'

export interface ScreeningAnswers {
  objetivo: string | null
  situacao: string | null
  familia: string | null
}

export interface VisaScore {
  visaId: VisaTypeId
  label: string
  description: string
  score: number
}
```

- [ ] **Step 2: Write failing tests**

Create `src/lib/__tests__/compatibility.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { scoreVisas, applyFinancialScore, getTop3Visas, familyFromFamilia } from '@/lib/compatibility'
import type { ScreeningAnswers } from '@/lib/types'

const empty: ScreeningAnswers = { objetivo: null, situacao: null, familia: null }

describe('scoreVisas', () => {
  it('all nulls: all scores equal 15 (BASE_SCORE)', () => {
    const scores = scoreVisas(empty)
    expect(scores.every(s => s.score === 15)).toBe(true)
    expect(scores).toHaveLength(5)
  })

  it('objetivo=remoto gives D8 highest score (65)', () => {
    const scores = scoreVisas({ ...empty, objetivo: 'remoto' })
    expect(scores[0].visaId).toBe('D8')
    expect(scores[0].score).toBe(65)
  })

  it('objetivo=renda_passiva gives D7 highest', () => {
    const scores = scoreVisas({ ...empty, objetivo: 'renda_passiva' })
    expect(scores[0].visaId).toBe('D7')
  })

  it('objetivo=remoto + situacao=freelancer: D8 capped at 70', () => {
    const scores = scoreVisas({ objetivo: 'remoto', situacao: 'freelancer', familia: null })
    const d8 = scores.find(s => s.visaId === 'D8')!
    expect(d8.score).toBe(70)
  })

  it('objetivo=presencial + situacao=empregado: D1 wins, D8 does not get situacao bonus', () => {
    const scores = scoreVisas({ objetivo: 'presencial', situacao: 'empregado', familia: null })
    const d1 = scores.find(s => s.visaId === 'D1')!
    const d8 = scores.find(s => s.visaId === 'D8')!
    expect(d1.score).toBeGreaterThan(d8.score)
  })

  it('objetivo=estudar + situacao=estudante: D4 capped at 70', () => {
    const scores = scoreVisas({ objetivo: 'estudar', situacao: 'estudante', familia: null })
    const d4 = scores.find(s => s.visaId === 'D4')!
    expect(d4.score).toBe(70)
  })

  it('score never exceeds 70 in step 1', () => {
    const scores = scoreVisas({ objetivo: 'remoto', situacao: 'freelancer', familia: 'conjuge_filhos' })
    expect(scores.every(s => s.score <= 70)).toBe(true)
  })

  it('returns sorted descending', () => {
    const scores = scoreVisas({ objetivo: 'remoto', situacao: 'freelancer', familia: null })
    for (let i = 0; i < scores.length - 1; i++) {
      expect(scores[i].score).toBeGreaterThanOrEqual(scores[i + 1].score)
    }
  })
})

describe('applyFinancialScore', () => {
  it('adds full income + savings bonus to active visa: 70 + 20 + 9 = 99', () => {
    const scores = scoreVisas({ objetivo: 'remoto', situacao: 'freelancer', familia: null })
    const updated = applyFinancialScore(scores, 'D8', 100, 100)
    const d8 = updated.find(s => s.visaId === 'D8')!
    expect(d8.score).toBe(99)
  })

  it('score never exceeds 99', () => {
    const scores = scoreVisas({ objetivo: 'remoto', situacao: 'freelancer', familia: null })
    const updated = applyFinancialScore(scores, 'D8', 999, 999)
    const d8 = updated.find(s => s.visaId === 'D8')!
    expect(d8.score).toBe(99)
  })

  it('partial income gives proportional bonus', () => {
    const scores = scoreVisas({ objetivo: 'remoto', situacao: 'freelancer', familia: null })
    const updated = applyFinancialScore(scores, 'D8', 50, 0)
    const d8 = updated.find(s => s.visaId === 'D8')!
    expect(d8.score).toBe(80) // 70 + round(50/100*20)=10 + 0 = 80
  })

  it('does not modify non-active visas', () => {
    const scores = scoreVisas(empty)
    const updated = applyFinancialScore(scores, 'D8', 100, 100)
    const d1 = updated.find(s => s.visaId === 'D1')!
    expect(d1.score).toBe(15)
  })
})

describe('getTop3Visas', () => {
  it('returns exactly 3 visas', () => {
    expect(getTop3Visas(scoreVisas(empty))).toHaveLength(3)
  })

  it('top visa has highest score', () => {
    const scores = scoreVisas({ objetivo: 'remoto', situacao: 'freelancer', familia: null })
    const top3 = getTop3Visas(scores)
    expect(top3[0].visaId).toBe('D8')
  })

  it('when all base scores, defaults contain D8, D7, D2', () => {
    const top3 = getTop3Visas(scoreVisas(empty))
    const ids = top3.map(v => v.visaId)
    expect(ids).toContain('D8')
    expect(ids).toContain('D7')
    expect(ids).toContain('D2')
  })
})

describe('familyFromFamilia', () => {
  it('sozinho: all zero', () => {
    expect(familyFromFamilia('sozinho')).toEqual({ spouses: 0, children: 0, adultDependents: 0 })
  })
  it('conjuge: spouses 1', () => {
    expect(familyFromFamilia('conjuge')).toEqual({ spouses: 1, children: 0, adultDependents: 0 })
  })
  it('conjuge_filhos: spouses 1 children 1', () => {
    expect(familyFromFamilia('conjuge_filhos')).toEqual({ spouses: 1, children: 1, adultDependents: 0 })
  })
  it('filhos: children 1', () => {
    expect(familyFromFamilia('filhos')).toEqual({ spouses: 0, children: 1, adultDependents: 0 })
  })
  it('null: all zero', () => {
    expect(familyFromFamilia(null)).toEqual({ spouses: 0, children: 0, adultDependents: 0 })
  })
})
```

- [ ] **Step 3: Run tests — confirm fail**

```bash
npm run test:run -- src/lib/__tests__/compatibility.test.ts
```

Expected: FAIL — "Cannot find module '@/lib/compatibility'"

- [ ] **Step 4: Create compatibility.ts**

Create `src/lib/compatibility.ts`:

```typescript
import type { ScreeningAnswers, VisaScore, VisaTypeId } from './types'

export const VISA_META: Record<VisaTypeId, { label: string; description: string }> = {
  D1: { label: 'D1 — Trabalho Subordinado', description: 'Contrato com empresa portuguesa' },
  D2: { label: 'D2 — Empreendedor', description: 'Empresa própria ou autônomo' },
  D4: { label: 'D4 — Estudante', description: 'Graduação, Mestrado ou Doutorado' },
  D7: { label: 'D7 — Renda Passiva', description: 'Aposentadoria, dividendos, aluguéis' },
  D8: { label: 'D8 — Nômade Digital', description: 'Trabalho remoto para o exterior' },
}

const OBJECTIVE_SCORES: Record<string, Partial<Record<VisaTypeId, number>>> = {
  presencial:    { D1: 50 },
  remoto:        { D8: 50 },
  empreender:    { D2: 50 },
  renda_passiva: { D7: 50 },
  estudar:       { D4: 50 },
}

const SITUACAO_SCORES: Record<string, Partial<Record<VisaTypeId, number>>> = {
  empregado:  { D1: 35, D8: 20 },
  freelancer: { D2: 35, D8: 35 },
  empresario: { D2: 35 },
  aposentado: { D7: 35 },
  investidor: { D7: 35 },
  estudante:  { D4: 35 },
}

const BASE_SCORE = 15
const MAX_STEP1 = 70
const DEFAULT_IDS: VisaTypeId[] = ['D8', 'D7', 'D2']

export function scoreVisas(answers: ScreeningAnswers): VisaScore[] {
  const scores: Record<VisaTypeId, number> = {
    D1: BASE_SCORE, D2: BASE_SCORE, D4: BASE_SCORE, D7: BASE_SCORE, D8: BASE_SCORE,
  }

  if (answers.objetivo) {
    for (const [id, pts] of Object.entries(OBJECTIVE_SCORES[answers.objetivo] ?? {})) {
      scores[id as VisaTypeId] += pts as number
    }
  }

  if (answers.situacao) {
    for (const [id, pts] of Object.entries(SITUACAO_SCORES[answers.situacao] ?? {})) {
      scores[id as VisaTypeId] += pts as number
    }
    // CLT only counts toward D8 when objective is remote
    if (answers.situacao === 'empregado' && answers.objetivo !== 'remoto') {
      scores.D8 = Math.max(BASE_SCORE, scores.D8 - 20)
    }
  }

  return (Object.keys(scores) as VisaTypeId[])
    .map(id => ({
      visaId: id,
      label: VISA_META[id].label,
      description: VISA_META[id].description,
      score: Math.min(scores[id], MAX_STEP1),
    }))
    .sort((a, b) => b.score - a.score)
}

export function applyFinancialScore(
  visaScores: VisaScore[],
  activeVisaId: VisaTypeId,
  incomePercent: number,
  savingsPercent: number,
): VisaScore[] {
  return visaScores.map(vs => {
    if (vs.visaId !== activeVisaId) return vs
    const incomeBonus = incomePercent >= 100 ? 20 : Math.round((incomePercent / 100) * 20)
    const savingsBonus = savingsPercent >= 100 ? 9 : Math.round((savingsPercent / 100) * 9)
    return { ...vs, score: Math.min(vs.score + incomeBonus + savingsBonus, 99) }
  })
}

export function getTop3Visas(visaScores: VisaScore[]): VisaScore[] {
  const allBase = visaScores.every(v => v.score === BASE_SCORE)
  if (allBase) {
    return DEFAULT_IDS.map(id => ({
      visaId: id,
      label: VISA_META[id].label,
      description: VISA_META[id].description,
      score: 0,
    }))
  }
  return visaScores.slice(0, 3)
}

export function familyFromFamilia(
  familia: string | null,
): { spouses: number; children: number; adultDependents: number } {
  switch (familia) {
    case 'conjuge':       return { spouses: 1, children: 0, adultDependents: 0 }
    case 'conjuge_filhos': return { spouses: 1, children: 1, adultDependents: 0 }
    case 'filhos':        return { spouses: 0, children: 1, adultDependents: 0 }
    default:              return { spouses: 0, children: 0, adultDependents: 0 }
  }
}
```

- [ ] **Step 5: Run tests — confirm pass**

```bash
npm run test:run -- src/lib/__tests__/compatibility.test.ts
```

Expected: all tests PASS.

- [ ] **Step 6: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/lib/types.ts src/lib/compatibility.ts src/lib/__tests__/compatibility.test.ts
git commit -m "feat: compatibility engine — D1/D2/D4/D7/D8 scoring, financial bonus, top3 selection"
```

---

## Task 2: StepIndicator Component (TDD)

**Files:**
- Create: `src/components/StepIndicator.tsx`
- Create: `src/components/__tests__/StepIndicator.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `src/components/__tests__/StepIndicator.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import StepIndicator from '@/components/StepIndicator'

describe('StepIndicator', () => {
  it('shows "Perfil do Visto" and "Análise de Renda"', () => {
    render(<StepIndicator step={1} />)
    expect(screen.getByText('Perfil do Visto')).toBeInTheDocument()
    expect(screen.getByText('Análise de Renda')).toBeInTheDocument()
  })

  it('step 1: circle shows "1"', () => {
    render(<StepIndicator step={1} />)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('step 2: circle 1 shows checkmark, circle 2 shows "2"', () => {
    render(<StepIndicator step={2} />)
    expect(screen.getByText('✓')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test — confirm fail**

```bash
npm run test:run -- src/components/__tests__/StepIndicator.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement StepIndicator**

Create `src/components/StepIndicator.tsx`:

```typescript
import type { Step } from '@/lib/types'

interface Props { step: Step }

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

      <div className={`h-px w-10 ${step === 2 ? 'bg-[#1A1A1A]' : 'bg-[#CCC]'}`} />

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
```

- [ ] **Step 4: Run test — confirm pass**

```bash
npm run test:run -- src/components/__tests__/StepIndicator.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/StepIndicator.tsx src/components/__tests__/StepIndicator.test.tsx
git commit -m "feat: StepIndicator component"
```

---

## Task 3: ScreeningPanel Component (TDD)

**Files:**
- Create: `src/components/ScreeningPanel.tsx`
- Create: `src/components/__tests__/ScreeningPanel.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `src/components/__tests__/ScreeningPanel.test.tsx`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ScreeningPanel from '@/components/ScreeningPanel'
import type { ScreeningAnswers } from '@/lib/types'

const empty: ScreeningAnswers = { objetivo: null, situacao: null, familia: null }

describe('ScreeningPanel', () => {
  it('renders all 3 section labels', () => {
    render(<ScreeningPanel answers={empty} onChange={vi.fn()} onNext={vi.fn()} />)
    expect(screen.getByText(/Qual seu objetivo/i)).toBeInTheDocument()
    expect(screen.getByText(/situação profissional/i)).toBeInTheDocument()
    expect(screen.getByText(/Quem vem com você/i)).toBeInTheDocument()
  })

  it('"Próxima Etapa" button is disabled when no answers', () => {
    render(<ScreeningPanel answers={empty} onChange={vi.fn()} onNext={vi.fn()} />)
    expect(screen.getByText('Próxima Etapa →')).toBeDisabled()
  })

  it('"Próxima Etapa" button is enabled when all 3 answered', () => {
    const full: ScreeningAnswers = { objetivo: 'remoto', situacao: 'freelancer', familia: 'sozinho' }
    render(<ScreeningPanel answers={full} onChange={vi.fn()} onNext={vi.fn()} />)
    expect(screen.getByText('Próxima Etapa →')).not.toBeDisabled()
  })

  it('clicking objetivo chip calls onChange with objetivo set', () => {
    const onChange = vi.fn()
    render(<ScreeningPanel answers={empty} onChange={onChange} onNext={vi.fn()} />)
    fireEvent.click(screen.getByText('Trabalhar remotamente para empresa fora de Portugal'))
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ objetivo: 'remoto' }))
  })

  it('clicking "Próxima Etapa" when enabled calls onNext', () => {
    const onNext = vi.fn()
    const full: ScreeningAnswers = { objetivo: 'remoto', situacao: 'freelancer', familia: 'sozinho' }
    render(<ScreeningPanel answers={full} onChange={vi.fn()} onNext={onNext} />)
    fireEvent.click(screen.getByText('Próxima Etapa →'))
    expect(onNext).toHaveBeenCalled()
  })

  it('selected chip has different styling than unselected', () => {
    const answers: ScreeningAnswers = { objetivo: 'remoto', situacao: null, familia: null }
    render(<ScreeningPanel answers={answers} onChange={vi.fn()} onNext={vi.fn()} />)
    const selectedChip = screen.getByText('Trabalhar remotamente para empresa fora de Portugal')
    expect(selectedChip.closest('button')).toHaveClass('bg-[#1A1A1A]')
  })
})
```

- [ ] **Step 2: Run test — confirm fail**

```bash
npm run test:run -- src/components/__tests__/ScreeningPanel.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement ScreeningPanel**

Create `src/components/ScreeningPanel.tsx`:

```typescript
'use client'
import type { ScreeningAnswers } from '@/lib/types'

interface Props {
  answers: ScreeningAnswers
  onChange: (answers: ScreeningAnswers) => void
  onNext: () => void
}

const OBJETIVO_OPTIONS = [
  { value: 'presencial',    label: 'Trabalhar presencialmente para uma empresa portuguesa' },
  { value: 'remoto',        label: 'Trabalhar remotamente para empresa fora de Portugal' },
  { value: 'empreender',    label: 'Empreender / abrir empresa / ser autônomo' },
  { value: 'renda_passiva', label: 'Viver de renda passiva (aposentadoria, aluguéis, dividendos)' },
  { value: 'estudar',       label: 'Estudar (Graduação, Mestrado e Doutorado)' },
]

const SITUACAO_OPTIONS = [
  { value: 'empregado',  label: 'Empregado (CLT ou equivalente)' },
  { value: 'freelancer', label: 'Freelancer / prestador de serviços independente' },
  { value: 'empresario', label: 'Empresário / sócio de empresa' },
  { value: 'aposentado', label: 'Aposentado / pensionista' },
  { value: 'investidor', label: 'Investidor / vivo de renda' },
  { value: 'estudante',  label: 'Estudante' },
]

const FAMILIA_OPTIONS = [
  { value: 'sozinho',       label: 'Vou sozinho' },
  { value: 'conjuge',       label: 'Cônjuge / Parceiro' },
  { value: 'conjuge_filhos', label: 'Cônjuge e Filhos' },
  { value: 'filhos',        label: 'Só com Filhos' },
]

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[9px] font-black tracking-[1.8px] uppercase text-[#666] mb-2.5">{children}</p>
  )
}

function ChipGroup({
  options,
  selected,
  onSelect,
}: {
  options: { value: string; label: string }[]
  selected: string | null
  onSelect: (v: string | null) => void
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
```

- [ ] **Step 4: Run tests — confirm pass**

```bash
npm run test:run -- src/components/__tests__/ScreeningPanel.test.tsx
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/ScreeningPanel.tsx src/components/__tests__/ScreeningPanel.test.tsx
git commit -m "feat: ScreeningPanel with 3 chip question blocks and guarded next button"
```

---

## Task 4: VisaCompatibilityCards Component (TDD)

**Files:**
- Create: `src/components/VisaCompatibilityCards.tsx`
- Create: `src/components/__tests__/VisaCompatibilityCards.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `src/components/__tests__/VisaCompatibilityCards.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import VisaCompatibilityCards from '@/components/VisaCompatibilityCards'
import type { VisaScore } from '@/lib/types'

const mockScores: VisaScore[] = [
  { visaId: 'D8', label: 'D8 — Nômade Digital', description: 'Trabalho remoto para o exterior', score: 70 },
  { visaId: 'D2', label: 'D2 — Empreendedor', description: 'Empresa própria ou autônomo', score: 45 },
  { visaId: 'D7', label: 'D7 — Renda Passiva', description: 'Aposentadoria, dividendos, aluguéis', score: 15 },
]

describe('VisaCompatibilityCards', () => {
  it('renders 3 visa cards', () => {
    render(<VisaCompatibilityCards scores={mockScores} step={1} />)
    expect(screen.getByText('D8 — Nômade Digital')).toBeInTheDocument()
    expect(screen.getByText('D2 — Empreendedor')).toBeInTheDocument()
    expect(screen.getByText('D7 — Renda Passiva')).toBeInTheDocument()
  })

  it('renders percentage for each visa', () => {
    render(<VisaCompatibilityCards scores={mockScores} step={1} />)
    expect(screen.getByText('70%')).toBeInTheDocument()
    expect(screen.getByText('45%')).toBeInTheDocument()
    expect(screen.getByText('15%')).toBeInTheDocument()
  })

  it('in step 2, active visa card has dark border', () => {
    const { container } = render(
      <VisaCompatibilityCards scores={mockScores} step={2} activeVisaId="D8" />
    )
    const cards = container.querySelectorAll('.border-\\[\\#1A1A1A\\]')
    expect(cards.length).toBe(1)
  })

  it('renders description for each visa', () => {
    render(<VisaCompatibilityCards scores={mockScores} step={1} />)
    expect(screen.getByText('Trabalho remoto para o exterior')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test — confirm fail**

```bash
npm run test:run -- src/components/__tests__/VisaCompatibilityCards.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement VisaCompatibilityCards**

Create `src/components/VisaCompatibilityCards.tsx`:

```typescript
import type { VisaScore, VisaTypeId } from '@/lib/types'

interface Props {
  scores: VisaScore[]
  step: 1 | 2
  activeVisaId?: VisaTypeId
}

function barColor(score: number): string {
  if (score >= 75) return 'bg-[#2E6B3E]'
  if (score >= 40) return 'bg-[#8B6A1A]'
  return 'bg-[#8B2E2E]'
}

function pctColor(score: number): string {
  if (score >= 75) return 'text-[#2E6B3E]'
  if (score >= 40) return 'text-[#8B6A1A]'
  return 'text-[#8B2E2E]'
}

export default function VisaCompatibilityCards({ scores, step, activeVisaId }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[9px] font-black tracking-[1.8px] uppercase text-[#666] mb-1">
        Compatibilidade com Vistos
      </p>
      {scores.map(vs => {
        const isActive = step === 2 && vs.visaId === activeVisaId
        return (
          <div
            key={vs.visaId}
            className={`bg-white rounded-2xl p-3.5 shadow-sm border transition-colors ${
              isActive ? 'border-[#1A1A1A]' : 'border-[#E8E5E0]'
            }`}
          >
            <div className="flex justify-between items-baseline mb-1.5">
              <span className="text-xs font-bold text-[#1A1A1A]">{vs.label}</span>
              <span className={`text-xs font-black ${pctColor(vs.score)}`}>{vs.score}%</span>
            </div>
            <div className="bg-[#E8E5E0] h-1.5 rounded-full overflow-hidden mb-1.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColor(vs.score)}`}
                style={{ width: `${vs.score}%` }}
              />
            </div>
            <p className="text-[10px] text-[#777]">{vs.description}</p>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 4: Run tests — confirm pass**

```bash
npm run test:run -- src/components/__tests__/VisaCompatibilityCards.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/VisaCompatibilityCards.tsx src/components/__tests__/VisaCompatibilityCards.test.tsx
git commit -m "feat: VisaCompatibilityCards with color-coded progress bars"
```

---

## Task 5: CompatibilityBadge Component (TDD)

**Files:**
- Create: `src/components/CompatibilityBadge.tsx`
- Create: `src/components/__tests__/CompatibilityBadge.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `src/components/__tests__/CompatibilityBadge.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import CompatibilityBadge from '@/components/CompatibilityBadge'

describe('CompatibilityBadge', () => {
  it('score 99: shows "Perfil Altamente Compatível"', () => {
    render(<CompatibilityBadge score={99} />)
    expect(screen.getByText('Perfil Altamente Compatível')).toBeInTheDocument()
  })

  it('score 95: shows "Compatibilidade Alta"', () => {
    render(<CompatibilityBadge score={95} />)
    expect(screen.getByText('Compatibilidade Alta')).toBeInTheDocument()
  })

  it('score 80: shows "Compatibilidade Moderada"', () => {
    render(<CompatibilityBadge score={80} />)
    expect(screen.getByText('Compatibilidade Moderada')).toBeInTheDocument()
  })

  it('score 50: shows "Compatibilidade Baixa"', () => {
    render(<CompatibilityBadge score={50} />)
    expect(screen.getByText('Compatibilidade Baixa')).toBeInTheDocument()
  })

  it('score 0: shows "Compatibilidade Baixa"', () => {
    render(<CompatibilityBadge score={0} />)
    expect(screen.getByText('Compatibilidade Baixa')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test — confirm fail**

```bash
npm run test:run -- src/components/__tests__/CompatibilityBadge.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement CompatibilityBadge**

Create `src/components/CompatibilityBadge.tsx`:

```typescript
function getLabel(score: number): string {
  if (score === 99) return 'Perfil Altamente Compatível'
  if (score >= 90) return 'Compatibilidade Alta'
  if (score >= 75) return 'Compatibilidade Moderada'
  return 'Compatibilidade Baixa'
}

function getSub(score: number): string {
  if (score === 99) return 'Perfil altamente compatível com os requisitos do visto'
  if (score >= 90) return 'Sua renda e poupança atendem os requisitos principais'
  if (score >= 75) return 'Você está próximo dos requisitos — verifique os detalhes'
  return 'Renda e/ou poupança abaixo do mínimo exigido'
}

export default function CompatibilityBadge({ score }: { score: number }) {
  const label = getLabel(score)
  const sub = getSub(score)

  return (
    <div className="bg-[#1A1A1A] rounded-2xl p-5 relative overflow-hidden">
      <div className="absolute w-36 h-36 bg-white/[0.04] rounded-full -right-8 -top-8" />
      <div className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full mb-3 bg-white/10 text-white/80">
        Resultado
      </div>
      <p className="text-2xl font-extrabold text-white tracking-tight leading-tight relative z-10">{label}</p>
      <p className="text-xs text-white/50 mt-1.5 relative z-10">{sub}</p>
    </div>
  )
}
```

- [ ] **Step 4: Run tests — confirm pass**

```bash
npm run test:run -- src/components/__tests__/CompatibilityBadge.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/CompatibilityBadge.tsx src/components/__tests__/CompatibilityBadge.test.tsx
git commit -m "feat: CompatibilityBadge with 4 score tiers — 99% shows Perfil Altamente Compatível"
```

---

## Task 6: EmailModal Component (TDD)

**Files:**
- Create: `src/components/EmailModal.tsx`
- Create: `src/components/__tests__/EmailModal.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `src/components/__tests__/EmailModal.test.tsx`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import EmailModal from '@/components/EmailModal'

describe('EmailModal', () => {
  it('renders name and email fields', () => {
    render(<EmailModal onConfirm={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByPlaceholderText('Nome Sobrenome')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument()
  })

  it('close button calls onClose', () => {
    const onClose = vi.fn()
    render(<EmailModal onConfirm={vi.fn()} onClose={onClose} />)
    fireEvent.click(screen.getByLabelText('Fechar modal'))
    expect(onClose).toHaveBeenCalled()
  })

  it('submit with empty fields shows errors', () => {
    render(<EmailModal onConfirm={vi.fn()} onClose={vi.fn()} />)
    fireEvent.click(screen.getByText('Receber meu relatório →'))
    expect(screen.getByText('Nome obrigatório')).toBeInTheDocument()
    expect(screen.getByText('Email inválido')).toBeInTheDocument()
  })

  it('submit with valid fields calls onConfirm', () => {
    const onConfirm = vi.fn()
    render(<EmailModal onConfirm={onConfirm} onClose={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText('Nome Sobrenome'), { target: { value: 'João Silva' } })
    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), { target: { value: 'joao@email.com' } })
    fireEvent.click(screen.getByText('Receber meu relatório →'))
    expect(onConfirm).toHaveBeenCalledWith('João Silva', 'joao@email.com')
  })

  it('invalid email format shows error', () => {
    render(<EmailModal onConfirm={vi.fn()} onClose={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText('Nome Sobrenome'), { target: { value: 'João' } })
    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), { target: { value: 'nao-e-email' } })
    fireEvent.click(screen.getByText('Receber meu relatório →'))
    expect(screen.getByText('Email inválido')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test — confirm fail**

```bash
npm run test:run -- src/components/__tests__/EmailModal.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement EmailModal**

Create `src/components/EmailModal.tsx`:

```typescript
'use client'
import { useState } from 'react'

interface Props {
  onConfirm: (name: string, email: string) => void
  onClose: () => void
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function EmailModal({ onConfirm, onClose }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [touched, setTouched] = useState({ name: false, email: false })

  const nameError = touched.name && !name.trim()
  const emailError = touched.email && (!email.trim() || !isValidEmail(email))

  function handleSubmit() {
    setTouched({ name: true, email: true })
    if (!name.trim() || !email.trim() || !isValidEmail(email)) return
    onConfirm(name.trim(), email.trim())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm mx-4 shadow-xl relative">
        <button
          aria-label="Fechar modal"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#AAA] hover:text-[#555] text-xl font-light leading-none"
        >
          ×
        </button>

        <h2 className="text-base font-extrabold text-[#1A1A1A] mb-1">Receber meu relatório</h2>
        <p className="text-xs text-[#777] mb-5">
          Preencha os dados abaixo para receber seu relatório preliminar.
        </p>

        <div className="mb-3">
          <label className="block text-[11px] font-semibold text-[#555] mb-1.5">Seu nome completo</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onBlur={() => setTouched(t => ({ ...t, name: true }))}
            placeholder="Nome Sobrenome"
            className={`w-full bg-[#F4F2EE] rounded-xl px-3 py-2.5 text-sm font-semibold text-[#1A1A1A] placeholder:text-[#BBB] outline-none focus:ring-2 focus:ring-[#1A1A1A]/20 ${nameError ? 'ring-2 ring-red-300' : ''}`}
          />
          {nameError && <p className="text-[10px] text-red-500 mt-1">Nome obrigatório</p>}
        </div>

        <div className="mb-5">
          <label className="block text-[11px] font-semibold text-[#555] mb-1.5">Seu melhor email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onBlur={() => setTouched(t => ({ ...t, email: true }))}
            placeholder="seu@email.com"
            className={`w-full bg-[#F4F2EE] rounded-xl px-3 py-2.5 text-sm font-semibold text-[#1A1A1A] placeholder:text-[#BBB] outline-none focus:ring-2 focus:ring-[#1A1A1A]/20 ${emailError ? 'ring-2 ring-red-300' : ''}`}
          />
          {emailError && <p className="text-[10px] text-red-500 mt-1">Email inválido</p>}
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-[#1A1A1A] text-white py-3 rounded-2xl text-sm font-bold hover:bg-[#333] transition-colors"
        >
          Receber meu relatório →
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests — confirm pass**

```bash
npm run test:run -- src/components/__tests__/EmailModal.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/EmailModal.tsx src/components/__tests__/EmailModal.test.tsx
git commit -m "feat: EmailModal with name/email validation"
```

---

## Task 7: LoadingOverlay Component (TDD)

**Files:**
- Create: `src/components/LoadingOverlay.tsx`
- Create: `src/components/__tests__/LoadingOverlay.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `src/components/__tests__/LoadingOverlay.test.tsx`:

```typescript
import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import LoadingOverlay from '@/components/LoadingOverlay'

beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers() })

describe('LoadingOverlay', () => {
  it('shows loading text immediately', () => {
    render(<LoadingOverlay onClose={vi.fn()} />)
    expect(screen.getByText('Preparando seu relatório preliminar...')).toBeInTheDocument()
  })

  it('upsell text hidden before 1.5s', () => {
    render(<LoadingOverlay onClose={vi.fn()} />)
    expect(screen.queryByText(/quanto vai gastar/i)).not.toBeInTheDocument()
  })

  it('upsell appears after 1.5s', () => {
    render(<LoadingOverlay onClose={vi.fn()} />)
    act(() => { vi.advanceTimersByTime(1500) })
    expect(screen.getByText(/quanto vai gastar/i)).toBeInTheDocument()
  })

  it('close button hidden before 4s', () => {
    render(<LoadingOverlay onClose={vi.fn()} />)
    act(() => { vi.advanceTimersByTime(1500) })
    expect(screen.queryByText('Fechar e voltar à calculadora')).not.toBeInTheDocument()
  })

  it('close button appears after 4s', () => {
    render(<LoadingOverlay onClose={vi.fn()} />)
    act(() => { vi.advanceTimersByTime(4000) })
    expect(screen.getByText('Fechar e voltar à calculadora')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test — confirm fail**

```bash
npm run test:run -- src/components/__tests__/LoadingOverlay.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement LoadingOverlay**

Create `src/components/LoadingOverlay.tsx`:

```typescript
'use client'
import { useEffect, useState } from 'react'

interface Props { onClose: () => void }

export default function LoadingOverlay({ onClose }: Props) {
  const [phase, setPhase] = useState<'loading' | 'upsell' | 'closeable'>('loading')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('upsell'), 1500)
    const t2 = setTimeout(() => setPhase('closeable'), 4000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div className="fixed inset-0 z-40 bg-white flex flex-col items-center justify-center px-4">
      <div className="w-8 h-8 border-2 border-[#E8E5E0] border-t-[#1A1A1A] rounded-full animate-spin mb-4" />
      <p className="text-sm font-semibold text-[#1A1A1A] mb-1">Preparando seu relatório preliminar...</p>
      <p className="text-xs text-[#AAA]">Isso levará apenas alguns instantes</p>

      {phase !== 'loading' && (
        <div className="mt-8 bg-[#F4F2EE] rounded-3xl p-6 max-w-sm w-full text-center border border-[#E8E5E0]">
          <p className="text-[9px] font-black tracking-[1.5px] uppercase text-[#999] mb-3">Enquanto isso...</p>
          <p className="text-base font-extrabold text-[#1A1A1A] leading-snug mb-2">
            Se você quer saber quanto vai gastar mensalmente morando em Portugal
          </p>
          <p className="text-xs text-[#777] mb-4">
            Simule seus gastos mensais por região de acordo com o seu perfil de vida.
          </p>
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-xs text-[#AAA] line-through">R$ 37,00</span>
            <span className="text-base font-extrabold text-[#1A1A1A]">R$ 12,00</span>
          </div>
          <p className="text-[10px] text-[#999] mb-4">para quem vem pela Calculadora</p>
          <a
            href="#"
            className="block w-full bg-[#1A1A1A] text-white py-3 rounded-2xl text-sm font-bold hover:bg-[#333] transition-colors text-center"
          >
            Quero acessar por R$ 12 →
          </a>
        </div>
      )}

      {phase === 'closeable' && (
        <button
          onClick={onClose}
          className="mt-6 text-xs text-[#888] underline hover:text-[#444]"
        >
          Fechar e voltar à calculadora
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run tests — confirm pass**

```bash
npm run test:run -- src/components/__tests__/LoadingOverlay.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/LoadingOverlay.tsx src/components/__tests__/LoadingOverlay.test.tsx
git commit -m "feat: LoadingOverlay with phased upsell — 1.5s upsell, 4s close button"
```

---

## Task 8: Update InputPanel (Remove CPLP + Conservative Mode)

**Files:**
- Modify: `src/components/InputPanel.tsx`
- Modify: `src/components/__tests__/InputPanel.test.tsx`

- [ ] **Step 1: Read current InputPanel.tsx**

Read `src/components/InputPanel.tsx` to find the two Toggle components to remove.

- [ ] **Step 2: Remove the CPLP toggle**

In `src/components/InputPanel.tsx`, remove the entire `<Toggle>` block for CPLP:

```typescript
// REMOVE this block entirely:
<Toggle
  label="Cidadão CPLP com Termo de Responsabilidade"
  sub="Brasil, Angola, Cabo Verde…"
  checked={input.hasCPLPTerm}
  onToggle={() => set({ hasCPLPTerm: !input.hasCPLPTerm })}
/>
```

- [ ] **Step 3: Remove the Conservative Mode toggle**

In the same file, remove the entire Conservative Mode conditional block:

```typescript
// REMOVE this block entirely:
{input.visaType === 'D8' && (
  <Toggle
    label="Modo Conservador"
    sub="Apenas Visto D8"
    checked={input.conservativeMode}
    onToggle={() => set({ conservativeMode: !input.conservativeMode })}
  />
)}
```

- [ ] **Step 4: Remove the "Opções" section label and divider if now empty**

After removing both toggles, if the `<SectionLabel>Opções</SectionLabel>` block and its preceding `<div className="h-px...">` now render nothing below them, remove those two elements as well.

The `<div className="h-px bg-[#E8E5E0] my-3.5" />` before `<SectionLabel>Opções</SectionLabel>` and `<SectionLabel>Opções</SectionLabel>` itself should be removed since there's nothing in that section anymore.

- [ ] **Step 5: Update InputPanel tests**

Read `src/components/__tests__/InputPanel.test.tsx`. Remove these two tests that no longer apply:
- `'CPLP toggle calls onChange with hasCPLPTerm: true'`
- `'Modo Conservador toggle only visible for D8'`

Also remove `defaultExtraProps` properties that reference `hasCPLPTerm`/`conservativeMode` if they exist in the test props (they don't — those are in `CalculatorInput`).

- [ ] **Step 6: Run all tests**

```bash
npm run test:run
```

Expected: all pass (the 2 removed tests should just be gone, rest unchanged).

- [ ] **Step 7: Commit**

```bash
git add src/components/InputPanel.tsx src/components/__tests__/InputPanel.test.tsx
git commit -m "feat: remove CPLP and Conservative Mode toggles from InputPanel"
```

---

## Task 9: Update ResultPanel (CompatibilityBadge, Button Copy, Disclaimer)

**Files:**
- Modify: `src/components/ResultPanel.tsx`
- Modify: `src/components/__tests__/ResultPanel.test.tsx`

- [ ] **Step 1: Read current ResultPanel.tsx and its tests**

Read both files before editing.

- [ ] **Step 2: Update ResultPanel.tsx**

Replace `src/components/ResultPanel.tsx` entirely:

```typescript
'use client'
import type { CalculatorInput, CalculatorResult } from '@/lib/types'
import CompatibilityBadge from './CompatibilityBadge'
import ProgressBar from './ProgressBar'
import AlertCard from './AlertCard'
import DownloadPdfButton from './DownloadPdfButton'

function fmt(n: number) {
  return `€ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

interface Props {
  result: CalculatorResult
  input: CalculatorInput
  topVisaScore: number
  onRequestReport: () => void
}

export default function ResultPanel({ result, input, topVisaScore, onRequestReport }: Props) {
  const {
    requiredMonthlyIncome, requiredSavings,
    incomeStatus, savingsStatus,
    incomePercent, savingsPercent,
    alerts,
  } = result

  return (
    <div className="h-full overflow-y-auto p-5 flex flex-col gap-4">
      <p className="text-[9px] font-black tracking-[1.8px] uppercase text-[#666]">
        Resultado em tempo real
      </p>

      <CompatibilityBadge score={topVisaScore} />

      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white rounded-2xl p-3.5 shadow-sm">
          <p className="text-[9px] font-black tracking-wide uppercase text-[#666] mb-1.5">Renda exigida</p>
          <p className="text-xl font-extrabold text-[#1A1A1A] tracking-tight">{fmt(requiredMonthlyIncome)}</p>
          <p className="text-[10px] font-medium text-[#777] mt-1">/mês</p>
        </div>
        <div className="bg-white rounded-2xl p-3.5 shadow-sm">
          <p className="text-[9px] font-black tracking-wide uppercase text-[#666] mb-1.5">Poupança exigida</p>
          <p className="text-xl font-extrabold text-[#1A1A1A] tracking-tight">{fmt(requiredSavings)}</p>
          <p className="text-[10px] font-medium text-[#777] mt-1">em conta PT · 12 meses</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <ProgressBar label="Renda: informada vs. exigida" percent={incomePercent} status={incomeStatus} />
        <ProgressBar label="Poupança: informada vs. exigida" percent={savingsPercent} status={savingsStatus} />
      </div>

      {alerts.length > 0 && (
        <div>
          {alerts.map((alert, i) => (
            <AlertCard key={i} type={alert.type} title={alert.title} message={alert.message} />
          ))}
        </div>
      )}

      <div className="mt-auto">
        <button
          onClick={onRequestReport}
          className="w-full bg-[#1A1A1A] hover:bg-[#333] text-white py-3 rounded-2xl text-sm font-bold transition-colors"
        >
          Receber Relatório Preliminar em PDF (Para mandar para Assessoria Jurídica)
        </button>
        <p className="text-center text-[10px] font-medium text-[#AAA] mt-2">
          Documento em PT-BR · para assessorias jurídicas
        </p>
        <p className="text-center text-[10px] text-[#AAA] mt-3 leading-relaxed px-2">
          Esta calculadora é uma ferramenta informativa e não substitui uma consulta jurídica. Mesmo com alta compatibilidade, detalhes do seu perfil só podem ser avaliados por um profissional.
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Update ResultPanel tests**

Replace `src/components/__tests__/ResultPanel.test.tsx` entirely:

```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/components/DownloadPdfButton', () => ({
  default: () => <button>PDF</button>,
}))

import ResultPanel from '@/components/ResultPanel'
import type { CalculatorInput, CalculatorResult } from '@/lib/types'

const defaultInput: CalculatorInput = {
  visaType: 'D7',
  monthlyIncome: 1000,
  savingsInPortugal: 12000,
  family: { spouses: 0, children: 0, adultDependents: 0 },
  hasCPLPTerm: false,
  conservativeMode: false,
  businessCapital: 0,
}

const eligibleResult: CalculatorResult = {
  requiredMonthlyIncome: 920,
  requiredSavings: 11040,
  incomeStatus: 'pass',
  savingsStatus: 'pass',
  incomePercent: 110,
  savingsPercent: 100,
  overallStatus: 'eligible',
  alerts: [],
}

describe('ResultPanel', () => {
  it('shows required income value', () => {
    render(<ResultPanel result={eligibleResult} input={defaultInput} topVisaScore={99} onRequestReport={vi.fn()} />)
    expect(screen.getByText('€ 920,00')).toBeInTheDocument()
  })

  it('shows required savings value', () => {
    render(<ResultPanel result={eligibleResult} input={defaultInput} topVisaScore={99} onRequestReport={vi.fn()} />)
    expect(screen.getByText('€ 11.040,00')).toBeInTheDocument()
  })

  it('score 99 shows Perfil Altamente Compatível badge', () => {
    render(<ResultPanel result={eligibleResult} input={defaultInput} topVisaScore={99} onRequestReport={vi.fn()} />)
    expect(screen.getByText('Perfil Altamente Compatível')).toBeInTheDocument()
  })

  it('score 80 shows Compatibilidade Moderada badge', () => {
    render(<ResultPanel result={eligibleResult} input={defaultInput} topVisaScore={80} onRequestReport={vi.fn()} />)
    expect(screen.getByText('Compatibilidade Moderada')).toBeInTheDocument()
  })

  it('PDF button shows correct copy', () => {
    render(<ResultPanel result={eligibleResult} input={defaultInput} topVisaScore={99} onRequestReport={vi.fn()} />)
    expect(screen.getByText('Receber Relatório Preliminar em PDF (Para mandar para Assessoria Jurídica)')).toBeInTheDocument()
  })

  it('disclaimer is visible', () => {
    render(<ResultPanel result={eligibleResult} input={defaultInput} topVisaScore={99} onRequestReport={vi.fn()} />)
    expect(screen.getByText(/não substitui uma consulta jurídica/i)).toBeInTheDocument()
  })

  it('clicking button calls onRequestReport', () => {
    const onRequestReport = vi.fn()
    render(<ResultPanel result={eligibleResult} input={defaultInput} topVisaScore={99} onRequestReport={onRequestReport} />)
    screen.getByText('Receber Relatório Preliminar em PDF (Para mandar para Assessoria Jurídica)').click()
    expect(onRequestReport).toHaveBeenCalled()
  })

  it('shows alert when present', () => {
    const resultWithAlert = {
      ...eligibleResult,
      alerts: [{ type: 'warning' as const, title: 'Poupança insuficiente', message: 'Falta R$ 1.000' }],
    }
    render(<ResultPanel result={resultWithAlert} input={defaultInput} topVisaScore={80} onRequestReport={vi.fn()} />)
    expect(screen.getByText('Poupança insuficiente')).toBeInTheDocument()
  })
})
```

- [ ] **Step 4: Run all tests**

```bash
npm run test:run
```

Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/ResultPanel.tsx src/components/__tests__/ResultPanel.test.tsx
git commit -m "feat: ResultPanel — CompatibilityBadge, new button copy, disclaimer"
```

---

## Task 10: Update page.tsx (Full Orchestration)

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Read current page.tsx**

Read `src/app/page.tsx` before editing.

- [ ] **Step 2: Replace page.tsx entirely**

```typescript
'use client'
import { useState, useEffect } from 'react'
import { calculate } from '@/lib/calculator'
import { fetchEurToBrlRate, brlToEur } from '@/lib/exchangeRate'
import { scoreVisas, applyFinancialScore, getTop3Visas, familyFromFamilia } from '@/lib/compatibility'
import type { CalculatorInput, ScreeningAnswers, Step } from '@/lib/types'
import VisaTypeTabs from '@/components/VisaTypeTabs'
import InputPanel from '@/components/InputPanel'
import ResultPanel from '@/components/ResultPanel'
import ScreeningPanel from '@/components/ScreeningPanel'
import VisaCompatibilityCards from '@/components/VisaCompatibilityCards'
import StepIndicator from '@/components/StepIndicator'
import EmailModal from '@/components/EmailModal'
import LoadingOverlay from '@/components/LoadingOverlay'

const initialInput: CalculatorInput = {
  visaType: 'D7',
  monthlyIncome: 0,
  savingsInPortugal: 0,
  family: { spouses: 0, children: 0, adultDependents: 0 },
  hasCPLPTerm: false,
  conservativeMode: false,
  businessCapital: 0,
}

const initialScreening: ScreeningAnswers = { objetivo: null, situacao: null, familia: null }

export default function Home() {
  // Step
  const [step, setStep] = useState<Step>(1)
  const [screening, setScreening] = useState<ScreeningAnswers>(initialScreening)

  // Calculator inputs
  const [input, setInput] = useState<CalculatorInput>(initialInput)
  const [exchangeRate, setExchangeRate] = useState(5.85)
  const [incomeBRL, setIncomeBRL] = useState(0)
  const [savingsBRL, setSavingsBRL] = useState(0)
  const [savingsEUR, setSavingsEUR] = useState(0)
  const [savingsCurrency, setSavingsCurrency] = useState<'BRL' | 'EUR' | null>(null)

  // Modal / overlay
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showLoading, setShowLoading] = useState(false)

  useEffect(() => {
    fetchEurToBrlRate().then(r => setExchangeRate(r.rate))
  }, [])

  // ── Income handlers ──
  function handleIncomeBRLChange(brl: number) {
    setIncomeBRL(brl)
    setInput(prev => ({ ...prev, monthlyIncome: brlToEur(brl, exchangeRate) }))
  }

  // ── Savings handlers ──
  function handleSavingsBRLChange(brl: number) {
    setSavingsBRL(brl)
    if (brl > 0) {
      setSavingsEUR(0)
      setSavingsCurrency('BRL')
      setInput(prev => ({ ...prev, savingsInPortugal: brlToEur(brl, exchangeRate) }))
    } else {
      setSavingsCurrency(null)
      setInput(prev => ({ ...prev, savingsInPortugal: 0 }))
    }
  }

  function handleSavingsEURChange(eur: number) {
    setSavingsEUR(eur)
    if (eur > 0) {
      setSavingsBRL(0)
      setSavingsCurrency('EUR')
      setInput(prev => ({ ...prev, savingsInPortugal: eur }))
    } else {
      setSavingsCurrency(null)
      setInput(prev => ({ ...prev, savingsInPortugal: 0 }))
    }
  }

  // ── Input change ──
  function handleChange(updated: CalculatorInput) {
    setInput(updated.visaType !== 'D8' ? { ...updated, conservativeMode: false } : updated)
  }

  function handleTabChange(visaType: CalculatorInput['visaType']) {
    setInput(prev => ({ ...prev, visaType, conservativeMode: false }))
  }

  // ── Step transition ──
  function handleProceedToStep2() {
    const sorted = scoreVisas(screening)
    const topVisa = sorted[0]?.visaId ?? 'D7'
    const family = familyFromFamilia(screening.familia)
    setInput(prev => ({ ...prev, visaType: topVisa, family }))
    setStep(2)
  }

  function handleBackToStep1() {
    setStep(1)
  }

  // ── Report flow ──
  function handleRequestReport() {
    setShowEmailModal(true)
  }

  function handleEmailConfirm(_name: string, _email: string) {
    // Phase 1: collect only. Sub-project 2 will wire the n8n webhook here.
    setShowEmailModal(false)
    setShowLoading(true)
  }

  function handleLoadingClose() {
    setShowLoading(false)
  }

  // ── Compatibility scores ──
  const result = calculate(input)
  const rawScores = scoreVisas(screening)
  const scoredVisas = step === 2
    ? applyFinancialScore(rawScores, input.visaType, result.incomePercent, result.savingsPercent)
    : rawScores
  const top3 = getTop3Visas(scoredVisas)
  const topVisaScore = top3[0]?.score ?? 0

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#EDEBE7' }}>

      {/* NAV */}
      <header className="bg-white shadow-sm px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🇵🇹</span>
          <span className="text-sm md:text-base font-extrabold text-[#1A1A1A] tracking-tight">
            Calculadora de Elegibilidade PT
          </span>
          <span className="hidden sm:inline bg-[#F0EFED] text-[#555] text-[9px] font-bold px-2 py-0.5 rounded-full">2026</span>
        </div>
        <span className="text-xs text-[#666]">
          RMMG: <strong className="text-[#1A1A1A]">€ 920,00</strong>
        </span>
      </header>

      {/* STEP INDICATOR */}
      <StepIndicator step={step} />

      {/* TABS — only shown in step 2 */}
      {step === 2 && (
        <div className="px-4 md:px-6 pb-0">
          <VisaTypeTabs active={input.visaType} onChange={handleTabChange} />
        </div>
      )}

      {/* MAIN */}
      <main className="flex-1 px-4 md:px-6 pt-2 pb-6">

        {/* Back button for step 2 */}
        {step === 2 && (
          <button
            onClick={handleBackToStep1}
            className="text-xs text-[#666] hover:text-[#1A1A1A] mb-2 flex items-center gap-1"
          >
            ← Voltar ao Rastreio
          </button>
        )}

        {/* Desktop layout */}
        <div className="hidden md:flex gap-3 h-full">
          <div className="bg-white rounded-3xl shadow-sm overflow-hidden flex-shrink-0" style={{ width: '360px' }}>
            {step === 1 ? (
              <ScreeningPanel
                answers={screening}
                onChange={setScreening}
                onNext={handleProceedToStep2}
              />
            ) : (
              <InputPanel
                input={input}
                onChange={handleChange}
                exchangeRate={exchangeRate}
                incomeBRL={incomeBRL}
                onIncomeBRLChange={handleIncomeBRLChange}
                savingsBRL={savingsBRL}
                savingsEUR={savingsEUR}
                savingsCurrency={savingsCurrency}
                onSavingsBRLChange={handleSavingsBRLChange}
                onSavingsEURChange={handleSavingsEURChange}
              />
            )}
          </div>

          <div className="flex-1 bg-white rounded-3xl shadow-sm overflow-hidden">
            {step === 1 ? (
              <div className="p-5">
                <VisaCompatibilityCards scores={top3} step={1} />
              </div>
            ) : (
              <div className="h-full overflow-y-auto p-5 flex flex-col gap-4">
                <VisaCompatibilityCards scores={top3} step={2} activeVisaId={input.visaType} />
                <ResultPanel
                  result={result}
                  input={input}
                  topVisaScore={topVisaScore}
                  onRequestReport={handleRequestReport}
                />
              </div>
            )}
          </div>
        </div>

        {/* Mobile layout */}
        <div className="md:hidden flex flex-col gap-3">
          {step === 1 ? (
            <>
              <div className="bg-white rounded-3xl shadow-sm">
                <ScreeningPanel
                  answers={screening}
                  onChange={setScreening}
                  onNext={handleProceedToStep2}
                />
              </div>
              <div className="bg-white rounded-3xl shadow-sm p-5">
                <VisaCompatibilityCards scores={top3} step={1} />
              </div>
            </>
          ) : (
            <>
              <div className="bg-white rounded-3xl shadow-sm">
                <InputPanel
                  input={input}
                  onChange={handleChange}
                  exchangeRate={exchangeRate}
                  incomeBRL={incomeBRL}
                  onIncomeBRLChange={handleIncomeBRLChange}
                  savingsBRL={savingsBRL}
                  savingsEUR={savingsEUR}
                  savingsCurrency={savingsCurrency}
                  onSavingsBRLChange={handleSavingsBRLChange}
                  onSavingsEURChange={handleSavingsEURChange}
                />
              </div>
              <div className="bg-white rounded-3xl shadow-sm p-5">
                <VisaCompatibilityCards scores={top3} step={2} activeVisaId={input.visaType} />
              </div>
              <div className="bg-white rounded-3xl shadow-sm">
                <ResultPanel
                  result={result}
                  input={input}
                  topVisaScore={topVisaScore}
                  onRequestReport={handleRequestReport}
                />
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="text-center text-[10px] font-medium text-[#AAA] pb-4 px-4">
        Baseado no Decreto-Lei n.º 139/2025 e Portaria n.º 1563/2007 · Documento informativo, não substitui consultoria jurídica
      </footer>

      {/* Modals */}
      {showEmailModal && (
        <EmailModal
          onConfirm={handleEmailConfirm}
          onClose={() => setShowEmailModal(false)}
        />
      )}
      {showLoading && <LoadingOverlay onClose={handleLoadingClose} />}
    </div>
  )
}
```

- [ ] **Step 3: Run all tests**

```bash
npm run test:run
```

Expected: all pass.

- [ ] **Step 4: Run production build**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 5: Verify manually with dev server**

```bash
npm run dev
```

Open http://localhost:3000 and verify:
- [ ] Etapa 1 mostra 3 blocos de perguntas com chips
- [ ] Clicar num chip o seleciona (fica preto); clicar de novo o deseleciona
- [ ] Barras de compatibilidade sobem ao vivo conforme respostas
- [ ] "Próxima Etapa →" fica cinza/desabilitado com 0, 1 ou 2 respostas
- [ ] "Próxima Etapa →" fica preto quando as 3 perguntas estão respondidas
- [ ] Ao clicar "Próxima Etapa →" avança para Etapa 2 com o visto top pré-selecionado
- [ ] StepIndicator mostra "✓" na etapa 1 e "2" ativo na etapa 2
- [ ] "← Voltar ao Rastreio" aparece na Etapa 2 e funciona
- [ ] Sem Modo Conservador e sem Termo CPLP na Etapa 2
- [ ] Clicar no botão de relatório abre o modal de email
- [ ] Validação do modal funciona (nome e email obrigatórios)
- [ ] Confirmar no modal fecha e abre o loading overlay
- [ ] Loading mostra upsell após ~1,5s
- [ ] Botão "Fechar" aparece após ~4s
- [ ] Mobile: layout empilhado funciona corretamente

- [ ] **Step 6: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: v2 complete — step flow, screening, compatibility engine, email modal, loading overlay"
```

---

## Spec Coverage Checklist

| Requisito | Task |
|---|---|
| Etapa 1 com 3 perguntas e chips interativos | Task 3 |
| Barras de compatibilidade ao vivo (Etapa 1) | Task 4 + Task 10 |
| Botão "Próxima Etapa" guarded | Task 3 |
| Indicador de etapa no topo | Task 2 |
| Motor de compatibilidade D1/D2/D4/D7/D8 | Task 1 |
| Score máximo 70% na Etapa 1, 99% total | Task 1 |
| Pré-seleção de visto na Etapa 2 | Task 10 |
| Pré-preenchimento de família na Etapa 2 | Task 1 (familyFromFamilia) + Task 10 |
| VisaCompatibilityCards na Etapa 2 com activeVisaId | Task 4 + Task 10 |
| Remoção de CPLP e Modo Conservador | Task 8 |
| Badge "Perfil Altamente Compatível" a 99% | Task 5 |
| 4 tiers de badge (Baixa/Moderada/Alta/AltamenteCompatível) | Task 5 |
| Novo botão copy com "Para mandar para Assessoria Jurídica" | Task 9 |
| Disclaimer em ambas as etapas | Task 9 + Task 10 (footer) |
| Modal de email com validação | Task 6 |
| Loading overlay com upsell após 1,5s | Task 7 |
| Botão fechar loading após 4s | Task 7 |
| Design B&W consistente | Todas as tasks |
