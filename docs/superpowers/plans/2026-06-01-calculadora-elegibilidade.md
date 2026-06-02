# Calculadora de Elegibilidade Portugal — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js 14 SaaS that calculates D7/D8/D2 visa financial eligibility in real time and generates a downloadable PDF report in PT-BR.

**Architecture:** Split-panel dashboard — left panel collects inputs (visa type, income, savings, family composition, toggles), right panel shows live calculation results. All logic lives in pure functions in `lib/calculator.ts`. PDF is generated client-side via `@react-pdf/renderer` wrapped in a `dynamic()` import to avoid SSR issues.

**Tech Stack:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, @react-pdf/renderer, Vitest + @testing-library/react

---

## File Map

| File | Responsibility |
|---|---|
| `src/lib/types.ts` | All TypeScript interfaces and type aliases |
| `src/lib/constants.ts` | RMMG, factors, 2026 values |
| `src/lib/calculator.ts` | Pure calculation functions, alert builder |
| `src/components/StatusBadge.tsx` | Eligible/Partial/Ineligible badge |
| `src/components/ProgressBar.tsx` | Colored progress bar with percentage |
| `src/components/AlertCard.tsx` | Contextual info/warning/error alerts |
| `src/components/FamilyBuilder.tsx` | Interactive chips for family members |
| `src/components/InputPanel.tsx` | Full left panel (income, savings, family, toggles) |
| `src/components/ResultPanel.tsx` | Full right panel (results, alerts, PDF button) |
| `src/components/VisaTypeTabs.tsx` | D7 / D8 / D2 tab switcher |
| `src/components/DownloadPdfButton.tsx` | Client-only PDF download button |
| `src/components/PdfDocument.tsx` | @react-pdf/renderer document template |
| `src/app/page.tsx` | Page assembly, shared state via useState |
| `src/app/layout.tsx` | Dark background, font, metadata |
| `src/app/globals.css` | Base Tailwind imports |
| `src/test/setup.ts` | @testing-library/jest-dom setup |
| `vitest.config.ts` | Vitest + jsdom + path alias |

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `vitest.config.ts`, `src/test/setup.ts`, `src/app/layout.tsx`, `src/app/globals.css`

- [ ] **Step 1: Scaffold Next.js project**

Run inside `f:\Calculadora de Elegibilidade`:

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

When prompted:
- Would you like to use Turbopack? → **No**
- Accept all other defaults

- [ ] **Step 2: Install dependencies**

```bash
npm install @react-pdf/renderer
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 3: Configure Vitest**

Create `vitest.config.ts` (overwrite if exists):

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 4: Create test setup file**

Create `src/test/setup.ts`:

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Add test script to package.json**

In `package.json`, add to `"scripts"`:

```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 6: Update layout.tsx with dark background and metadata**

Replace `src/app/layout.tsx` entirely:

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ElegiPortugal — Calculadora de Elegibilidade',
  description: 'Calcule se você atende os requisitos financeiros para os Vistos D7, D8 e D2 de Portugal.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="bg-slate-950">
      <body className={`${inter.className} bg-slate-950 text-slate-100 min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 7: Update globals.css**

Replace `src/app/globals.css` entirely:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 8: Verify dev server starts**

```bash
npm run dev
```

Expected: server starts on http://localhost:3000, no errors in terminal.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js project with Vitest and @react-pdf/renderer"
```

---

## Task 2: Types and Constants

**Files:**
- Create: `src/lib/types.ts`, `src/lib/constants.ts`

- [ ] **Step 1: Create constants**

Create `src/lib/constants.ts`:

```typescript
export const RMMG = 920
export const D8_FACTOR = 4
export const MONTHS = 12
export const EXTRA_ADULT_FACTOR = 0.5
export const CHILD_FACTOR = 0.3
export const D2_MIN_CAPITAL_WARNING = 3000
export const IRS_HIGH_BRACKET_ANNUAL = 43086
```

- [ ] **Step 2: Create types**

Create `src/lib/types.ts`:

```typescript
export type VisaType = 'D7' | 'D8' | 'D2'
export type EligibilityStatus = 'eligible' | 'partial' | 'ineligible'
export type CriterionStatus = 'pass' | 'warning' | 'fail' | 'waived'
export type AlertType = 'info' | 'warning' | 'error'

export interface FamilyComposition {
  spouses: number
  children: number
  adultDependents: number
}

export interface CalculatorInput {
  visaType: VisaType
  monthlyIncome: number
  savingsInPortugal: number
  family: FamilyComposition
  hasCPLPTerm: boolean
  conservativeMode: boolean
  businessCapital: number
}

export interface Alert {
  type: AlertType
  title: string
  message: string
}

export interface CalculatorResult {
  requiredMonthlyIncome: number
  requiredSavings: number
  incomeStatus: CriterionStatus
  savingsStatus: CriterionStatus
  incomePercent: number
  savingsPercent: number
  overallStatus: EligibilityStatus
  alerts: Alert[]
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/
git commit -m "feat: add types and 2026 constants (RMMG €920)"
```

---

## Task 3: Calculator Logic (TDD)

**Files:**
- Create: `src/lib/calculator.ts`, `src/lib/__tests__/calculator.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/lib/__tests__/calculator.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { calculate, calculateRequiredIncome, calculateRequiredSavings } from '@/lib/calculator'
import type { CalculatorInput } from '@/lib/types'

const base: CalculatorInput = {
  visaType: 'D7',
  monthlyIncome: 0,
  savingsInPortugal: 0,
  family: { spouses: 0, children: 0, adultDependents: 0 },
  hasCPLPTerm: false,
  conservativeMode: false,
  businessCapital: 0,
}

describe('calculateRequiredIncome — D7', () => {
  it('titular sozinho: €920', () => {
    expect(calculateRequiredIncome({ ...base, visaType: 'D7' })).toBe(920)
  })
  it('titular + cônjuge: €1380', () => {
    expect(calculateRequiredIncome({ ...base, visaType: 'D7', family: { spouses: 1, children: 0, adultDependents: 0 } })).toBe(1380)
  })
  it('titular + 1 filho: €1196', () => {
    expect(calculateRequiredIncome({ ...base, visaType: 'D7', family: { spouses: 0, children: 1, adultDependents: 0 } })).toBe(1196)
  })
  it('casal + 2 filhos: €1932', () => {
    expect(calculateRequiredIncome({ ...base, visaType: 'D7', family: { spouses: 1, children: 2, adultDependents: 0 } })).toBe(1932)
  })
})

describe('calculateRequiredIncome — D8', () => {
  it('titular sozinho: €3680', () => {
    expect(calculateRequiredIncome({ ...base, visaType: 'D8' })).toBe(3680)
  })
  it('modo legal, titular + cônjuge: €4140', () => {
    expect(calculateRequiredIncome({ ...base, visaType: 'D8', family: { spouses: 1, children: 0, adultDependents: 0 } })).toBe(4140)
  })
  it('modo conservador, titular + cônjuge: €5520', () => {
    expect(calculateRequiredIncome({
      ...base,
      visaType: 'D8',
      conservativeMode: true,
      family: { spouses: 1, children: 0, adultDependents: 0 },
    })).toBe(5520)
  })
  it('modo conservador, titular + cônjuge + 1 filho: €6624', () => {
    expect(calculateRequiredIncome({
      ...base,
      visaType: 'D8',
      conservativeMode: true,
      family: { spouses: 1, children: 1, adultDependents: 0 },
    })).toBe(6624)
  })
})

describe('calculateRequiredIncome — D2', () => {
  it('mesmo que D7: €920 sozinho', () => {
    expect(calculateRequiredIncome({ ...base, visaType: 'D2' })).toBe(920)
  })
})

describe('calculateRequiredSavings', () => {
  it('titular sozinho: €11040', () => {
    expect(calculateRequiredSavings({ ...base })).toBe(11040)
  })
  it('titular + cônjuge: €16560', () => {
    expect(calculateRequiredSavings({ ...base, family: { spouses: 1, children: 0, adultDependents: 0 } })).toBe(16560)
  })
  it('titular + 1 filho: €14352', () => {
    expect(calculateRequiredSavings({ ...base, family: { spouses: 0, children: 1, adultDependents: 0 } })).toBe(14352)
  })
  it('casal + 2 filhos: €23184', () => {
    expect(calculateRequiredSavings({ ...base, family: { spouses: 1, children: 2, adultDependents: 0 } })).toBe(23184)
  })
})

describe('calculate — overall status', () => {
  it('renda e poupança ok → eligible', () => {
    const result = calculate({ ...base, visaType: 'D7', monthlyIncome: 920, savingsInPortugal: 11040 })
    expect(result.overallStatus).toBe('eligible')
  })
  it('apenas renda ok, poupança baixa → partial', () => {
    const result = calculate({ ...base, visaType: 'D7', monthlyIncome: 920, savingsInPortugal: 5000 })
    expect(result.overallStatus).toBe('partial')
  })
  it('ambos baixos → ineligible', () => {
    const result = calculate({ ...base, visaType: 'D7', monthlyIncome: 400, savingsInPortugal: 1000 })
    expect(result.overallStatus).toBe('ineligible')
  })
  it('CPLP ativo dispensa poupança → eligible se renda ok', () => {
    const result = calculate({ ...base, visaType: 'D7', monthlyIncome: 920, savingsInPortugal: 0, hasCPLPTerm: true })
    expect(result.overallStatus).toBe('eligible')
    expect(result.savingsStatus).toBe('waived')
  })
})

describe('calculate — alerts', () => {
  it('gap de poupança gera alerta warning', () => {
    const result = calculate({ ...base, visaType: 'D7', monthlyIncome: 920, savingsInPortugal: 5000 })
    expect(result.alerts.some(a => a.type === 'warning' && a.title === 'Poupança insuficiente')).toBe(true)
  })
  it('CPLP ativo gera alerta info', () => {
    const result = calculate({ ...base, visaType: 'D7', monthlyIncome: 920, savingsInPortugal: 0, hasCPLPTerm: true })
    expect(result.alerts.some(a => a.title === 'CPLP — Termo de Responsabilidade')).toBe(true)
  })
  it('D2 capital baixo gera alerta error', () => {
    const result = calculate({ ...base, visaType: 'D2', monthlyIncome: 920, savingsInPortugal: 11040, businessCapital: 500 })
    expect(result.alerts.some(a => a.type === 'error' && a.title === 'Capital empresarial insuficiente')).toBe(true)
  })
  it('D8 renda alta gera alerta IRS', () => {
    const result = calculate({ ...base, visaType: 'D8', monthlyIncome: 4000, savingsInPortugal: 11040 })
    expect(result.alerts.some(a => a.title === 'Atenção: IRS progressivo')).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
npm run test:run -- src/lib/__tests__/calculator.test.ts
```

Expected: FAIL — "Cannot find module '@/lib/calculator'"

- [ ] **Step 3: Implement calculator.ts**

Create `src/lib/calculator.ts`:

```typescript
import {
  RMMG, D8_FACTOR, MONTHS, EXTRA_ADULT_FACTOR, CHILD_FACTOR,
  D2_MIN_CAPITAL_WARNING, IRS_HIGH_BRACKET_ANNUAL,
} from './constants'
import type { CalculatorInput, CalculatorResult, CriterionStatus, Alert } from './types'

export function calculateRequiredIncome(input: CalculatorInput): number {
  const { visaType, family, conservativeMode } = input
  const extras = family.spouses + family.adultDependents

  if (visaType === 'D8') {
    const base = RMMG * D8_FACTOR
    if (conservativeMode) {
      return base + extras * base * EXTRA_ADULT_FACTOR + family.children * base * CHILD_FACTOR
    }
    return base + extras * RMMG * EXTRA_ADULT_FACTOR + family.children * RMMG * CHILD_FACTOR
  }

  return RMMG + extras * RMMG * EXTRA_ADULT_FACTOR + family.children * RMMG * CHILD_FACTOR
}

export function calculateRequiredSavings(input: CalculatorInput): number {
  const { family } = input
  const extras = family.spouses + family.adultDependents
  return (
    RMMG * MONTHS +
    extras * RMMG * EXTRA_ADULT_FACTOR * MONTHS +
    family.children * RMMG * CHILD_FACTOR * MONTHS
  )
}

function criterionStatus(actual: number, required: number): CriterionStatus {
  const pct = actual / required
  if (pct >= 1) return 'pass'
  if (pct >= 0.7) return 'warning'
  return 'fail'
}

function fmt(n: number) {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function buildAlerts(input: CalculatorInput, requiredSavings: number): Alert[] {
  const alerts: Alert[] = []
  const { visaType, conservativeMode, hasCPLPTerm, monthlyIncome, savingsInPortugal, businessCapital } = input

  if (!hasCPLPTerm && savingsInPortugal < requiredSavings) {
    const gap = requiredSavings - savingsInPortugal
    alerts.push({
      type: 'warning',
      title: 'Poupança insuficiente',
      message: `Você precisa de mais €${fmt(gap)} na conta em Portugal para atingir o mínimo de 12 meses.`,
    })
  }

  if (hasCPLPTerm) {
    alerts.push({
      type: 'info',
      title: 'CPLP — Termo de Responsabilidade',
      message: 'A exigência de poupança estática está dispensada. Um fiador residente em Portugal assume responsabilidade pelo seu sustento e eventuais custos de repatriação.',
    })
  }

  if (visaType === 'D8' && conservativeMode) {
    alerts.push({
      type: 'info',
      title: 'Modo Conservador ativo',
      message: 'Os incrementos familiares estão calculados sobre €3.680 (base D8) em vez de €920 (RMMG). Isso garante aprovação em 100% dos postos consulares.',
    })
  }

  if (visaType === 'D8' && monthlyIncome * 12 > IRS_HIGH_BRACKET_ANNUAL) {
    alerts.push({
      type: 'warning',
      title: 'Atenção: IRS progressivo',
      message: `Sua renda anual (€${fmt(monthlyIncome * 12)}) ultrapassa €43.086, atingindo a faixa de 43,1% do IRS. Sem enquadramento IFICI, o imposto reduzirá significativamente sua renda líquida em Portugal.`,
    })
  }

  if (visaType === 'D2' && businessCapital < D2_MIN_CAPITAL_WARNING) {
    alerts.push({
      type: 'error',
      title: 'Capital empresarial insuficiente',
      message: `Capital de €${fmt(businessCapital)} representa alto risco de indeferimento por ausência de substância econômica. Recomendado mínimo: €3.000.`,
    })
  }

  return alerts
}

export function calculate(input: CalculatorInput): CalculatorResult {
  const requiredMonthlyIncome = calculateRequiredIncome(input)
  const requiredSavings = calculateRequiredSavings(input)

  const incomeStatus = criterionStatus(input.monthlyIncome, requiredMonthlyIncome)
  const savingsStatus: CriterionStatus = input.hasCPLPTerm
    ? 'waived'
    : criterionStatus(input.savingsInPortugal, requiredSavings)

  const incomePercent = Math.min(Math.round((input.monthlyIncome / requiredMonthlyIncome) * 100), 999)
  const savingsPercent = input.hasCPLPTerm
    ? 100
    : Math.min(Math.round((input.savingsInPortugal / requiredSavings) * 100), 999)

  const alerts = buildAlerts(input, requiredSavings)

  const bothOk = incomeStatus === 'pass' && (savingsStatus === 'pass' || savingsStatus === 'waived')
  const anyFail = incomeStatus === 'fail' || savingsStatus === 'fail'
  const overallStatus = bothOk ? 'eligible' : anyFail ? 'ineligible' : 'partial'

  return {
    requiredMonthlyIncome,
    requiredSavings,
    incomeStatus,
    savingsStatus,
    incomePercent,
    savingsPercent,
    overallStatus,
    alerts,
  }
}
```

- [ ] **Step 4: Run tests — confirm they pass**

```bash
npm run test:run -- src/lib/__tests__/calculator.test.ts
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/
git commit -m "feat: calculator engine with D7/D8/D2 logic and alert builder"
```

---

## Task 4: StatusBadge and ProgressBar Components (TDD)

**Files:**
- Create: `src/components/StatusBadge.tsx`, `src/components/ProgressBar.tsx`
- Create: `src/components/__tests__/StatusBadge.test.tsx`, `src/components/__tests__/ProgressBar.test.tsx`

- [ ] **Step 1: Write failing tests for StatusBadge**

Create `src/components/__tests__/StatusBadge.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import StatusBadge from '@/components/StatusBadge'

describe('StatusBadge', () => {
  it('renders "Perfil Elegível" for eligible', () => {
    render(<StatusBadge status="eligible" />)
    expect(screen.getByText('Perfil Elegível')).toBeInTheDocument()
  })
  it('renders "Parcialmente Elegível" for partial', () => {
    render(<StatusBadge status="partial" />)
    expect(screen.getByText('Parcialmente Elegível')).toBeInTheDocument()
  })
  it('renders "Não Elegível" for ineligible', () => {
    render(<StatusBadge status="ineligible" />)
    expect(screen.getByText('Não Elegível')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Write failing tests for ProgressBar**

Create `src/components/__tests__/ProgressBar.test.tsx`:

```typescript
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ProgressBar from '@/components/ProgressBar'

describe('ProgressBar', () => {
  it('renders percentage label', () => {
    const { getByText } = render(<ProgressBar percent={75} status="warning" label="Poupança" />)
    expect(getByText('75%')).toBeInTheDocument()
  })
  it('renders label', () => {
    const { getByText } = render(<ProgressBar percent={110} status="pass" label="Renda" />)
    expect(getByText('Renda')).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Run tests — confirm they fail**

```bash
npm run test:run -- src/components/__tests__/
```

Expected: FAIL — module not found.

- [ ] **Step 4: Implement StatusBadge**

Create `src/components/StatusBadge.tsx`:

```typescript
import type { EligibilityStatus } from '@/lib/types'

const config: Record<EligibilityStatus, { label: string; icon: string; classes: string }> = {
  eligible: {
    label: 'Perfil Elegível',
    icon: '✅',
    classes: 'bg-emerald-950 border border-emerald-500 text-emerald-400',
  },
  partial: {
    label: 'Parcialmente Elegível',
    icon: '⚠️',
    classes: 'bg-amber-950 border border-amber-500 text-amber-400',
  },
  ineligible: {
    label: 'Não Elegível',
    icon: '❌',
    classes: 'bg-red-950 border border-red-500 text-red-400',
  },
}

export default function StatusBadge({ status }: { status: EligibilityStatus }) {
  const { label, icon, classes } = config[status]
  return (
    <div className={`flex items-center gap-3 rounded-lg px-4 py-3 ${classes}`}>
      <span className="text-xl">{icon}</span>
      <div>
        <p className="font-bold text-sm">{label}</p>
        <p className="text-xs opacity-75">
          {status === 'eligible' && 'Sua renda e poupança atendem os requisitos'}
          {status === 'partial' && 'Um dos critérios não foi atingido'}
          {status === 'ineligible' && 'Renda e/ou poupança abaixo do mínimo'}
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Implement ProgressBar**

Create `src/components/ProgressBar.tsx`:

```typescript
import type { CriterionStatus } from '@/lib/types'

const barColor: Record<CriterionStatus, string> = {
  pass: 'bg-emerald-500',
  warning: 'bg-amber-500',
  fail: 'bg-red-500',
  waived: 'bg-slate-500',
}

const labelColor: Record<CriterionStatus, string> = {
  pass: 'text-emerald-400',
  warning: 'text-amber-400',
  fail: 'text-red-400',
  waived: 'text-slate-400',
}

interface Props {
  label: string
  sublabel?: string
  percent: number
  status: CriterionStatus
}

export default function ProgressBar({ label, sublabel, percent, status }: Props) {
  const displayPct = Math.min(percent, 100)
  return (
    <div className="mb-3">
      <div className="flex justify-between items-baseline mb-1">
        <div>
          <span className="text-slate-300 text-xs">{label}</span>
          {sublabel && <span className="text-slate-500 text-xs ml-1">{sublabel}</span>}
        </div>
        <span className={`text-xs font-semibold ${labelColor[status]}`}>
          {status === 'waived' ? 'Dispensado' : `${percent}%`}
        </span>
      </div>
      <div className="bg-slate-800 h-1.5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor[status]}`}
          style={{ width: `${displayPct}%` }}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Run tests — confirm they pass**

```bash
npm run test:run -- src/components/__tests__/
```

Expected: all PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/
git commit -m "feat: StatusBadge and ProgressBar components"
```

---

## Task 5: AlertCard Component (TDD)

**Files:**
- Create: `src/components/AlertCard.tsx`, `src/components/__tests__/AlertCard.test.tsx`

- [ ] **Step 1: Write failing test**

Create `src/components/__tests__/AlertCard.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import AlertCard from '@/components/AlertCard'

describe('AlertCard', () => {
  it('renders title and message', () => {
    render(<AlertCard type="warning" title="Título" message="Mensagem do alerta." />)
    expect(screen.getByText('Título')).toBeInTheDocument()
    expect(screen.getByText('Mensagem do alerta.')).toBeInTheDocument()
  })
  it('applies warning border for warning type', () => {
    const { container } = render(<AlertCard type="warning" title="T" message="M" />)
    expect(container.firstChild).toHaveClass('border-amber-500')
  })
  it('applies red border for error type', () => {
    const { container } = render(<AlertCard type="error" title="T" message="M" />)
    expect(container.firstChild).toHaveClass('border-red-500')
  })
})
```

- [ ] **Step 2: Run test — confirm fail**

```bash
npm run test:run -- src/components/__tests__/AlertCard.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement AlertCard**

Create `src/components/AlertCard.tsx`:

```typescript
import type { AlertType } from '@/lib/types'

const styles: Record<AlertType, { border: string; title: string; icon: string }> = {
  info: { border: 'border-indigo-500', title: 'text-indigo-300', icon: 'ℹ️' },
  warning: { border: 'border-amber-500', title: 'text-amber-300', icon: '⚠️' },
  error: { border: 'border-red-500', title: 'text-red-300', icon: '🚨' },
}

interface Props {
  type: AlertType
  title: string
  message: string
}

export default function AlertCard({ type, title, message }: Props) {
  const { border, title: titleColor, icon } = styles[type]
  return (
    <div className={`border-l-2 ${border} bg-slate-800 rounded-r-md px-3 py-2 mb-2`}>
      <p className={`text-xs font-semibold mb-0.5 ${titleColor}`}>
        {icon} {title}
      </p>
      <p className="text-xs text-slate-400">{message}</p>
    </div>
  )
}
```

- [ ] **Step 4: Run test — confirm pass**

```bash
npm run test:run -- src/components/__tests__/AlertCard.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/AlertCard.tsx src/components/__tests__/AlertCard.test.tsx
git commit -m "feat: AlertCard component for contextual alerts"
```

---

## Task 6: FamilyBuilder Component (TDD)

**Files:**
- Create: `src/components/FamilyBuilder.tsx`, `src/components/__tests__/FamilyBuilder.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `src/components/__tests__/FamilyBuilder.test.tsx`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import FamilyBuilder from '@/components/FamilyBuilder'
import type { FamilyComposition } from '@/lib/types'

const empty: FamilyComposition = { spouses: 0, children: 0, adultDependents: 0 }

describe('FamilyBuilder', () => {
  it('always shows Titular chip', () => {
    render(<FamilyBuilder family={empty} onChange={vi.fn()} />)
    expect(screen.getByText('Titular')).toBeInTheDocument()
  })

  it('clicking + Cônjuge calls onChange with spouses: 1', () => {
    const onChange = vi.fn()
    render(<FamilyBuilder family={empty} onChange={onChange} />)
    fireEvent.click(screen.getByText('+ Cônjuge'))
    expect(onChange).toHaveBeenCalledWith({ spouses: 1, children: 0, adultDependents: 0 })
  })

  it('clicking + Filho calls onChange with children: 1', () => {
    const onChange = vi.fn()
    render(<FamilyBuilder family={empty} onChange={onChange} />)
    fireEvent.click(screen.getByText('+ Filho'))
    expect(onChange).toHaveBeenCalledWith({ spouses: 0, children: 1, adultDependents: 0 })
  })

  it('+ Cônjuge button is hidden when spouses is already 1', () => {
    render(<FamilyBuilder family={{ ...empty, spouses: 1 }} onChange={vi.fn()} />)
    expect(screen.queryByText('+ Cônjuge')).not.toBeInTheDocument()
  })

  it('shows remove button on Cônjuge chip when spouses: 1', () => {
    const onChange = vi.fn()
    render(<FamilyBuilder family={{ ...empty, spouses: 1 }} onChange={onChange} />)
    const removeBtn = screen.getByLabelText('Remover cônjuge')
    fireEvent.click(removeBtn)
    expect(onChange).toHaveBeenCalledWith({ spouses: 0, children: 0, adultDependents: 0 })
  })
})
```

- [ ] **Step 2: Run test — confirm fail**

```bash
npm run test:run -- src/components/__tests__/FamilyBuilder.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement FamilyBuilder**

Create `src/components/FamilyBuilder.tsx`:

```typescript
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
  const removeChild = (i: number) => onChange({ ...family, children: Math.max(0, children - 1) })
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
            onClick={() => removeChild(i)}
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
```

- [ ] **Step 4: Run tests — confirm pass**

```bash
npm run test:run -- src/components/__tests__/FamilyBuilder.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/FamilyBuilder.tsx src/components/__tests__/FamilyBuilder.test.tsx
git commit -m "feat: FamilyBuilder with interactive chips for spouse/children/dependents"
```

---

## Task 7: VisaTypeTabs Component (TDD)

**Files:**
- Create: `src/components/VisaTypeTabs.tsx`, `src/components/__tests__/VisaTypeTabs.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `src/components/__tests__/VisaTypeTabs.test.tsx`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import VisaTypeTabs from '@/components/VisaTypeTabs'

describe('VisaTypeTabs', () => {
  it('renders all three tabs', () => {
    render(<VisaTypeTabs active="D7" onChange={vi.fn()} />)
    expect(screen.getByText(/D7/)).toBeInTheDocument()
    expect(screen.getByText(/D8/)).toBeInTheDocument()
    expect(screen.getByText(/D2/)).toBeInTheDocument()
  })

  it('clicking D8 tab calls onChange with D8', () => {
    const onChange = vi.fn()
    render(<VisaTypeTabs active="D7" onChange={onChange} />)
    fireEvent.click(screen.getByText(/D8/))
    expect(onChange).toHaveBeenCalledWith('D8')
  })

  it('active tab has indigo background', () => {
    render(<VisaTypeTabs active="D2" onChange={vi.fn()} />)
    const d2Tab = screen.getByText(/D2/).closest('button')
    expect(d2Tab).toHaveClass('bg-indigo-600')
  })
})
```

- [ ] **Step 2: Run test — confirm fail**

```bash
npm run test:run -- src/components/__tests__/VisaTypeTabs.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement VisaTypeTabs**

Create `src/components/VisaTypeTabs.tsx`:

```typescript
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
```

- [ ] **Step 4: Run tests — confirm pass**

```bash
npm run test:run -- src/components/__tests__/VisaTypeTabs.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/VisaTypeTabs.tsx src/components/__tests__/VisaTypeTabs.test.tsx
git commit -m "feat: VisaTypeTabs — D7/D8/D2 switcher"
```

---

## Task 8: InputPanel Component

**Files:**
- Create: `src/components/InputPanel.tsx`, `src/components/__tests__/InputPanel.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `src/components/__tests__/InputPanel.test.tsx`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import InputPanel from '@/components/InputPanel'
import type { CalculatorInput } from '@/lib/types'

const defaultInput: CalculatorInput = {
  visaType: 'D7',
  monthlyIncome: 0,
  savingsInPortugal: 0,
  family: { spouses: 0, children: 0, adultDependents: 0 },
  hasCPLPTerm: false,
  conservativeMode: false,
  businessCapital: 0,
}

describe('InputPanel', () => {
  it('renders renda input', () => {
    render(<InputPanel input={defaultInput} onChange={vi.fn()} />)
    expect(screen.getByLabelText('Renda mensal comprovável (€)')).toBeInTheDocument()
  })

  it('renders poupança input', () => {
    render(<InputPanel input={defaultInput} onChange={vi.fn()} />)
    expect(screen.getByLabelText('Poupança em conta PT (€)')).toBeInTheDocument()
  })

  it('changing renda calls onChange with updated monthlyIncome', () => {
    const onChange = vi.fn()
    render(<InputPanel input={defaultInput} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Renda mensal comprovável (€)'), { target: { value: '1500' } })
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ monthlyIncome: 1500 }))
  })

  it('CPLP toggle calls onChange with hasCPLPTerm: true', () => {
    const onChange = vi.fn()
    render(<InputPanel input={defaultInput} onChange={onChange} />)
    fireEvent.click(screen.getByLabelText('Cidadão CPLP com Termo de Responsabilidade'))
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ hasCPLPTerm: true }))
  })

  it('Modo Conservador toggle only visible for D8', () => {
    const { rerender } = render(<InputPanel input={defaultInput} onChange={vi.fn()} />)
    expect(screen.queryByLabelText('Modo Conservador')).not.toBeInTheDocument()
    rerender(<InputPanel input={{ ...defaultInput, visaType: 'D8' }} onChange={vi.fn()} />)
    expect(screen.getByLabelText('Modo Conservador')).toBeInTheDocument()
  })

  it('Capital da empresa field only visible for D2', () => {
    const { rerender } = render(<InputPanel input={defaultInput} onChange={vi.fn()} />)
    expect(screen.queryByLabelText('Capital alocado à empresa (€)')).not.toBeInTheDocument()
    rerender(<InputPanel input={{ ...defaultInput, visaType: 'D2' }} onChange={vi.fn()} />)
    expect(screen.getByLabelText('Capital alocado à empresa (€)')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests — confirm fail**

```bash
npm run test:run -- src/components/__tests__/InputPanel.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement InputPanel**

Create `src/components/InputPanel.tsx`:

```typescript
'use client'
import type { CalculatorInput } from '@/lib/types'
import FamilyBuilder from './FamilyBuilder'

interface Props {
  input: CalculatorInput
  onChange: (input: CalculatorInput) => void
}

function Toggle({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <button
      aria-label={label}
      onClick={onToggle}
      className="w-full flex items-center justify-between bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-xs text-left"
    >
      <span className="text-slate-300">{label}</span>
      <div className={`w-8 h-4 rounded-full relative transition-colors ${checked ? 'bg-indigo-600' : 'bg-slate-600'}`}>
        <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all ${checked ? 'left-4' : 'left-0.5'}`} />
      </div>
    </button>
  )
}

function NumericInput({ id, label, value, onChange }: { id: string; label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="block text-slate-400 text-xs mb-1">{label}</label>
      <input
        id={id}
        type="number"
        min={0}
        value={value || ''}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        placeholder="0,00"
        className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
      />
    </div>
  )
}

export default function InputPanel({ input, onChange }: Props) {
  const set = (patch: Partial<CalculatorInput>) => onChange({ ...input, ...patch })

  return (
    <div className="h-full overflow-y-auto p-4">
      <p className="text-indigo-400 text-[10px] uppercase tracking-widest mb-3">Dados do Requerente</p>

      <NumericInput
        id="income"
        label="Renda mensal comprovável (€)"
        value={input.monthlyIncome}
        onChange={v => set({ monthlyIncome: v })}
      />
      <NumericInput
        id="savings"
        label="Poupança em conta PT (€)"
        value={input.savingsInPortugal}
        onChange={v => set({ savingsInPortugal: v })}
      />

      {input.visaType === 'D2' && (
        <NumericInput
          id="business-capital"
          label="Capital alocado à empresa (€)"
          value={input.businessCapital}
          onChange={v => set({ businessCapital: v })}
        />
      )}

      <div className="h-px bg-slate-700 my-3" />
      <p className="text-indigo-400 text-[10px] uppercase tracking-widest mb-3">Agregado Familiar</p>
      <FamilyBuilder family={input.family} onChange={family => set({ family })} />

      <div className="h-px bg-slate-700 my-3" />
      <p className="text-indigo-400 text-[10px] uppercase tracking-widest mb-3">Opções</p>

      <div className="space-y-2">
        <Toggle
          label="Cidadão CPLP com Termo de Responsabilidade"
          checked={input.hasCPLPTerm}
          onToggle={() => set({ hasCPLPTerm: !input.hasCPLPTerm })}
        />
        {input.visaType === 'D8' && (
          <Toggle
            label="Modo Conservador"
            checked={input.conservativeMode}
            onToggle={() => set({ conservativeMode: !input.conservativeMode })}
          />
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests — confirm pass**

```bash
npm run test:run -- src/components/__tests__/InputPanel.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/InputPanel.tsx src/components/__tests__/InputPanel.test.tsx
git commit -m "feat: InputPanel with income, savings, family and toggle inputs"
```

---

## Task 9: ResultPanel Component

**Files:**
- Create: `src/components/ResultPanel.tsx`, `src/components/__tests__/ResultPanel.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `src/components/__tests__/ResultPanel.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ResultPanel from '@/components/ResultPanel'
import type { CalculatorResult } from '@/lib/types'

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

const partialResult: CalculatorResult = {
  ...eligibleResult,
  savingsStatus: 'warning',
  savingsPercent: 80,
  overallStatus: 'partial',
  alerts: [{ type: 'warning', title: 'Poupança insuficiente', message: 'Precisa de mais €2.000' }],
}

describe('ResultPanel', () => {
  it('shows required income value', () => {
    render(<ResultPanel result={eligibleResult} onDownloadPdf={vi.fn()} />)
    expect(screen.getByText('€ 920,00')).toBeInTheDocument()
  })

  it('shows required savings value', () => {
    render(<ResultPanel result={eligibleResult} onDownloadPdf={vi.fn()} />)
    expect(screen.getByText('€ 11.040,00')).toBeInTheDocument()
  })

  it('shows alert title when alerts exist', () => {
    render(<ResultPanel result={partialResult} onDownloadPdf={vi.fn()} />)
    expect(screen.getByText('Poupança insuficiente')).toBeInTheDocument()
  })

  it('PDF button is present', () => {
    render(<ResultPanel result={eligibleResult} onDownloadPdf={vi.fn()} />)
    expect(screen.getByText(/Baixar Relatório/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests — confirm fail**

```bash
npm run test:run -- src/components/__tests__/ResultPanel.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement ResultPanel**

Create `src/components/ResultPanel.tsx`:

```typescript
'use client'
import type { CalculatorResult } from '@/lib/types'
import StatusBadge from './StatusBadge'
import ProgressBar from './ProgressBar'
import AlertCard from './AlertCard'

function fmt(n: number) {
  return `€ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

interface Props {
  result: CalculatorResult
  onDownloadPdf: () => void
}

export default function ResultPanel({ result, onDownloadPdf }: Props) {
  const {
    requiredMonthlyIncome, requiredSavings,
    incomeStatus, savingsStatus,
    incomePercent, savingsPercent,
    overallStatus, alerts,
  } = result

  return (
    <div className="h-full overflow-y-auto p-4 flex flex-col gap-4">
      <p className="text-emerald-400 text-[10px] uppercase tracking-widest">Resultado em tempo real</p>

      <StatusBadge status={overallStatus} />

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-800 rounded-lg p-3">
          <p className="text-slate-400 text-[10px] mb-1">Renda exigida</p>
          <p className="text-slate-100 text-base font-bold">{fmt(requiredMonthlyIncome)}</p>
          <p className="text-slate-500 text-[10px]">/mês</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-3">
          <p className="text-slate-400 text-[10px] mb-1">Poupança exigida</p>
          <p className="text-slate-100 text-base font-bold">{fmt(requiredSavings)}</p>
          <p className="text-slate-500 text-[10px]">em conta PT (12 meses)</p>
        </div>
      </div>

      <div>
        <ProgressBar
          label={`Renda: informada vs. exigida`}
          percent={incomePercent}
          status={incomeStatus}
        />
        <ProgressBar
          label={`Poupança: informada vs. exigida`}
          percent={savingsPercent}
          status={savingsStatus}
        />
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
          onClick={onDownloadPdf}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg text-sm font-semibold transition-colors"
        >
          📄 Baixar Relatório de Elegibilidade (PDF)
        </button>
        <p className="text-center text-slate-500 text-[10px] mt-2">
          Documento em PT-BR formatado para assessorias jurídicas
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests — confirm pass**

```bash
npm run test:run -- src/components/__tests__/ResultPanel.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/ResultPanel.tsx src/components/__tests__/ResultPanel.test.tsx
git commit -m "feat: ResultPanel with live results, progress bars and alerts"
```

---

## Task 10: PdfDocument and Download Button

**Files:**
- Create: `src/components/PdfDocument.tsx`, `src/components/DownloadPdfButton.tsx`

- [ ] **Step 1: Create PdfDocument**

Create `src/components/PdfDocument.tsx`:

```typescript
import {
  Document, Page, Text, View, StyleSheet,
} from '@react-pdf/renderer'
import type { CalculatorInput, CalculatorResult } from '@/lib/types'

const VISA_LABELS: Record<string, string> = {
  D7: 'D7 — Renda Passiva',
  D8: 'D8 — Nômade Digital',
  D2: 'D2 — Empreendedor',
}

const STATUS_LABELS: Record<string, string> = {
  eligible: 'ELEGÍVEL',
  partial: 'PARCIALMENTE ELEGÍVEL',
  ineligible: 'NÃO ELEGÍVEL',
}

function fmt(n: number) {
  return `€ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 10, color: '#1e293b', padding: 40 },
  header: { marginBottom: 24, borderBottom: '2px solid #6366f1', paddingBottom: 12 },
  title: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#1e293b', marginBottom: 4 },
  subtitle: { fontSize: 10, color: '#64748b' },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#6366f1', marginBottom: 6, textTransform: 'uppercase' },
  row: { flexDirection: 'row', borderBottom: '1px solid #e2e8f0', paddingVertical: 5 },
  cell: { flex: 1, fontSize: 10 },
  cellBold: { flex: 1, fontSize: 10, fontFamily: 'Helvetica-Bold' },
  statusEligible: { color: '#16a34a', fontFamily: 'Helvetica-Bold', fontSize: 14, marginBottom: 8 },
  statusPartial: { color: '#d97706', fontFamily: 'Helvetica-Bold', fontSize: 14, marginBottom: 8 },
  statusIneligible: { color: '#dc2626', fontFamily: 'Helvetica-Bold', fontSize: 14, marginBottom: 8 },
  alertBox: { backgroundColor: '#fef9c3', padding: 8, marginBottom: 6, borderRadius: 4 },
  alertTitle: { fontFamily: 'Helvetica-Bold', fontSize: 9, marginBottom: 2 },
  alertMsg: { fontSize: 9, color: '#64748b' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 8, color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: 8 },
})

interface Props {
  input: CalculatorInput
  result: CalculatorResult
  generatedAt: string
}

export default function PdfDocument({ input, result, generatedAt }: Props) {
  const { visaType, family, hasCPLPTerm, conservativeMode } = input
  const { requiredMonthlyIncome, requiredSavings, incomePercent, savingsPercent, overallStatus, alerts } = result

  const totalMembers = 1 + family.spouses + family.children + family.adultDependents

  const statusStyle = overallStatus === 'eligible' ? s.statusEligible : overallStatus === 'partial' ? s.statusPartial : s.statusIneligible

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Cabeçalho */}
        <View style={s.header}>
          <Text style={s.title}>🇵🇹 Relatório de Elegibilidade Migratória</Text>
          <Text style={s.subtitle}>ElegiPortugal · Gerado em {generatedAt} · Baseado na RMMG 2026 (€920)</Text>
        </View>

        {/* Resultado geral */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Resultado</Text>
          <Text style={statusStyle}>{STATUS_LABELS[overallStatus]}</Text>
        </View>

        {/* Perfil */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Perfil do Requerente</Text>
          <View style={s.row}><Text style={s.cellBold}>Tipo de Visto</Text><Text style={s.cell}>{VISA_LABELS[visaType]}</Text></View>
          <View style={s.row}><Text style={s.cellBold}>Total de membros</Text><Text style={s.cell}>{totalMembers} ({1} titular, {family.spouses} cônjuge(s), {family.children} filho(s), {family.adultDependents} dep. adulto(s))</Text></View>
          <View style={s.row}><Text style={s.cellBold}>CPLP com Termo</Text><Text style={s.cell}>{hasCPLPTerm ? 'Sim' : 'Não'}</Text></View>
          {visaType === 'D8' && <View style={s.row}><Text style={s.cellBold}>Modo Conservador</Text><Text style={s.cell}>{conservativeMode ? 'Ativo' : 'Inativo'}</Text></View>}
        </View>

        {/* Critérios */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Critérios Financeiros</Text>
          <View style={[s.row, { backgroundColor: '#f8fafc' }]}>
            <Text style={s.cellBold}>Critério</Text>
            <Text style={s.cellBold}>Exigido</Text>
            <Text style={s.cellBold}>Informado</Text>
            <Text style={s.cellBold}>Atingimento</Text>
          </View>
          <View style={s.row}>
            <Text style={s.cell}>Renda mensal</Text>
            <Text style={s.cell}>{fmt(requiredMonthlyIncome)}</Text>
            <Text style={s.cell}>{fmt(input.monthlyIncome)}</Text>
            <Text style={s.cell}>{incomePercent}%</Text>
          </View>
          <View style={s.row}>
            <Text style={s.cell}>Poupança em PT</Text>
            <Text style={s.cell}>{hasCPLPTerm ? 'Dispensado (CPLP)' : fmt(requiredSavings)}</Text>
            <Text style={s.cell}>{fmt(input.savingsInPortugal)}</Text>
            <Text style={s.cell}>{hasCPLPTerm ? 'N/A' : `${savingsPercent}%`}</Text>
          </View>
        </View>

        {/* Alertas */}
        {alerts.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Observações</Text>
            {alerts.map((a, i) => (
              <View key={i} style={s.alertBox}>
                <Text style={s.alertTitle}>{a.title}</Text>
                <Text style={s.alertMsg}>{a.message}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Rodapé */}
        <View style={s.footer}>
          <Text>Baseado na RMMG 2026 (Decreto-Lei n.º 139/2025) e Portaria n.º 1563/2007 · Este documento é informativo e não substitui consultoria jurídica especializada.</Text>
        </View>
      </Page>
    </Document>
  )
}
```

- [ ] **Step 2: Create DownloadPdfButton (client-only)**

Create `src/components/DownloadPdfButton.tsx`:

```typescript
'use client'
import dynamic from 'next/dynamic'
import { PDFDownloadLink } from '@react-pdf/renderer'
import PdfDocument from './PdfDocument'
import type { CalculatorInput, CalculatorResult } from '@/lib/types'

interface Props {
  input: CalculatorInput
  result: CalculatorResult
}

function Button({ input, result }: Props) {
  const now = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
  const filename = `elegibilidade-${input.visaType.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.pdf`

  return (
    <PDFDownloadLink
      document={<PdfDocument input={input} result={result} generatedAt={now} />}
      fileName={filename}
      className="block w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg text-sm font-semibold transition-colors text-center"
    >
      {({ loading }) => loading ? 'Gerando PDF...' : '📄 Baixar Relatório de Elegibilidade (PDF)'}
    </PDFDownloadLink>
  )
}

export default dynamic(() => Promise.resolve(Button), { ssr: false })
```

- [ ] **Step 3: Update ResultPanel to use DownloadPdfButton**

In `src/components/ResultPanel.tsx`, replace the `import` block at the top and the button at the bottom:

Add import after existing imports:
```typescript
import DownloadPdfButton from './DownloadPdfButton'
```

Add `input` to the Props interface:
```typescript
interface Props {
  result: CalculatorResult
  input: CalculatorInput
  onDownloadPdf?: () => void
}
```

Replace the `<button onClick={onDownloadPdf}>` block with:
```typescript
<DownloadPdfButton input={input} result={result} />
```

Remove the `onDownloadPdf` prop from the function signature (no longer needed as a callback).

Full updated `src/components/ResultPanel.tsx`:

```typescript
'use client'
import type { CalculatorInput, CalculatorResult } from '@/lib/types'
import StatusBadge from './StatusBadge'
import ProgressBar from './ProgressBar'
import AlertCard from './AlertCard'
import DownloadPdfButton from './DownloadPdfButton'

function fmt(n: number) {
  return `€ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

interface Props {
  result: CalculatorResult
  input: CalculatorInput
}

export default function ResultPanel({ result, input }: Props) {
  const {
    requiredMonthlyIncome, requiredSavings,
    incomeStatus, savingsStatus,
    incomePercent, savingsPercent,
    overallStatus, alerts,
  } = result

  return (
    <div className="h-full overflow-y-auto p-4 flex flex-col gap-4">
      <p className="text-emerald-400 text-[10px] uppercase tracking-widest">Resultado em tempo real</p>

      <StatusBadge status={overallStatus} />

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-800 rounded-lg p-3">
          <p className="text-slate-400 text-[10px] mb-1">Renda exigida</p>
          <p className="text-slate-100 text-base font-bold">{fmt(requiredMonthlyIncome)}</p>
          <p className="text-slate-500 text-[10px]">/mês</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-3">
          <p className="text-slate-400 text-[10px] mb-1">Poupança exigida</p>
          <p className="text-slate-100 text-base font-bold">{fmt(requiredSavings)}</p>
          <p className="text-slate-500 text-[10px]">em conta PT (12 meses)</p>
        </div>
      </div>

      <div>
        <ProgressBar
          label="Renda: informada vs. exigida"
          percent={incomePercent}
          status={incomeStatus}
        />
        <ProgressBar
          label="Poupança: informada vs. exigida"
          percent={savingsPercent}
          status={savingsStatus}
        />
      </div>

      {alerts.length > 0 && (
        <div>
          {alerts.map((alert, i) => (
            <AlertCard key={i} type={alert.type} title={alert.title} message={alert.message} />
          ))}
        </div>
      )}

      <div className="mt-auto">
        <DownloadPdfButton input={input} result={result} />
        <p className="text-center text-slate-500 text-[10px] mt-2">
          Documento em PT-BR formatado para assessorias jurídicas
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Update ResultPanel tests to match new Props**

In `src/components/__tests__/ResultPanel.test.tsx`, remove `onDownloadPdf` from all renders. Add `input` prop. Also mock `DownloadPdfButton` since it uses dynamic import:

Replace the full test file:

```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/components/DownloadPdfButton', () => ({
  default: () => <button>Baixar Relatório de Elegibilidade (PDF)</button>,
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

const partialResult: CalculatorResult = {
  ...eligibleResult,
  savingsStatus: 'warning',
  savingsPercent: 80,
  overallStatus: 'partial',
  alerts: [{ type: 'warning', title: 'Poupança insuficiente', message: 'Precisa de mais €2.000' }],
}

describe('ResultPanel', () => {
  it('shows required income value', () => {
    render(<ResultPanel result={eligibleResult} input={defaultInput} />)
    expect(screen.getByText('€ 920,00')).toBeInTheDocument()
  })

  it('shows required savings value', () => {
    render(<ResultPanel result={eligibleResult} input={defaultInput} />)
    expect(screen.getByText('€ 11.040,00')).toBeInTheDocument()
  })

  it('shows alert title when alerts exist', () => {
    render(<ResultPanel result={partialResult} input={defaultInput} />)
    expect(screen.getByText('Poupança insuficiente')).toBeInTheDocument()
  })

  it('PDF button is present', () => {
    render(<ResultPanel result={eligibleResult} input={defaultInput} />)
    expect(screen.getByText(/Baixar Relatório/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 5: Run all tests**

```bash
npm run test:run
```

Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/PdfDocument.tsx src/components/DownloadPdfButton.tsx src/components/ResultPanel.tsx src/components/__tests__/ResultPanel.test.tsx
git commit -m "feat: PDF document generation with DownloadPdfButton (client-only)"
```

---

## Task 11: Page Assembly

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Implement page.tsx**

Replace `src/app/page.tsx` entirely:

```typescript
'use client'
import { useState } from 'react'
import { calculate } from '@/lib/calculator'
import type { CalculatorInput } from '@/lib/types'
import VisaTypeTabs from '@/components/VisaTypeTabs'
import InputPanel from '@/components/InputPanel'
import ResultPanel from '@/components/ResultPanel'

const initialInput: CalculatorInput = {
  visaType: 'D7',
  monthlyIncome: 0,
  savingsInPortugal: 0,
  family: { spouses: 0, children: 0, adultDependents: 0 },
  hasCPLPTerm: false,
  conservativeMode: false,
  businessCapital: 0,
}

export default function Home() {
  const [input, setInput] = useState<CalculatorInput>(initialInput)

  function handleChange(updated: CalculatorInput) {
    // Limpa conservativeMode ao trocar de visto
    if (updated.visaType !== 'D8') {
      setInput({ ...updated, conservativeMode: false })
    } else {
      setInput(updated)
    }
  }

  function handleTabChange(visaType: CalculatorInput['visaType']) {
    setInput(prev => ({ ...prev, visaType, conservativeMode: false }))
  }

  const result = calculate(input)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🇵🇹</span>
          <span className="text-slate-100 font-bold">ElegiPortugal</span>
          <span className="bg-slate-700 text-slate-400 text-[10px] px-2 py-0.5 rounded ml-1">2026</span>
        </div>
        <span className="text-slate-500 text-xs">
          RMMG vigente: <span className="text-indigo-400 font-semibold">€ 920,00</span>
        </span>
      </header>

      {/* Tabs */}
      <div className="px-6 pt-4 pb-0">
        <VisaTypeTabs active={input.visaType} onChange={handleTabChange} />
      </div>

      {/* Dashboard */}
      <main className="flex flex-1 gap-0 mx-6 mt-2 mb-6 border border-slate-700 rounded-xl overflow-hidden">
        <div className="w-[380px] min-w-[320px] border-r border-slate-700 bg-slate-800/50">
          <InputPanel input={input} onChange={handleChange} />
        </div>
        <div className="flex-1 bg-slate-950">
          <ResultPanel result={result} input={input} />
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-slate-600 text-[10px] pb-4">
        Baseado no Decreto-Lei n.º 139/2025 e Portaria n.º 1563/2007 · Documento informativo, não substitui consultoria jurídica
      </footer>
    </div>
  )
}
```

- [ ] **Step 2: Start dev server and verify manually**

```bash
npm run dev
```

Open http://localhost:3000 and verify:
- [ ] Tabs D7/D8/D2 funcionam e trocam o visto
- [ ] Digitando renda o resultado atualiza em tempo real
- [ ] Digitando poupança o resultado atualiza
- [ ] Adicionando cônjuge aumenta a renda exigida em €460
- [ ] Adicionando filho aumenta a renda exigida em €276
- [ ] Toggle CPLP dispensa a poupança e muda o badge
- [ ] Toggle Modo Conservador aparece só no D8
- [ ] Campo Capital da Empresa aparece só no D2
- [ ] Botão de PDF aparece no painel direito

- [ ] **Step 3: Run all tests**

```bash
npm run test:run
```

Expected: all PASS.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: assemble dashboard — InputPanel + ResultPanel + live calculation"
```

---

## Task 12: Deploy na Vercel

**Files:**
- Create: `.gitignore` (update), `next.config.ts` (verify)

- [ ] **Step 1: Verify .gitignore has node_modules and .next**

Check `.gitignore` contains:
```
node_modules/
.next/
.env*.local
.superpowers/
```

If `.superpowers/` is missing, add it.

- [ ] **Step 2: Final production build test**

```bash
npm run build
```

Expected: build completes with no errors. If `@react-pdf/renderer` causes a build error about Node.js modules, add to `next.config.ts`:

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias.canvas = false
    return config
  },
}

export default nextConfig
```

- [ ] **Step 3: Commit and push to GitHub**

```bash
git add -A
git commit -m "chore: production build config and .gitignore"
git remote add origin https://github.com/SEU_USUARIO/calculadora-elegibilidade.git
git push -u origin main
```

- [ ] **Step 4: Deploy na Vercel**

1. Acesse https://vercel.com e faça login com o GitHub
2. Clique em **"Add New… → Project"**
3. Importe o repositório `calculadora-elegibilidade`
4. Framework: **Next.js** (detectado automaticamente)
5. Clique **Deploy**

Expected: URL pública gerada em ~2 minutos, ex: `https://calculadora-elegibilidade.vercel.app`

- [ ] **Step 5: Smoke test na URL pública**

Acesse a URL e verifique:
- [ ] Interface carrega com dark mode
- [ ] Cálculo funciona em tempo real
- [ ] Botão PDF gera o download do arquivo correto

---

## Checklist de Cobertura do Spec

| Requisito do Spec | Implementado em |
|---|---|
| Cálculo D7 correto | Task 3 — `calculator.ts` |
| Cálculo D8 modo legal | Task 3 — `calculateRequiredIncome` |
| Cálculo D8 modo conservador | Task 3 — `conservativeMode` branch |
| Cálculo D2 (igual D7) | Task 3 — `D2` case |
| Poupança 12 meses RMMG | Task 3 — `calculateRequiredSavings` |
| Toggle CPLP dispensa poupança | Task 3 — `hasCPLPTerm` + Task 8 |
| Alerta capital D2 < €3000 | Task 3 — `buildAlerts` |
| Alerta IRS D8 > €43.086/ano | Task 3 — `buildAlerts` |
| FamilyBuilder interativo | Task 6 |
| Abas D7/D8/D2 | Task 7 |
| Dashboard dividido ao vivo | Task 11 |
| PDF PT-BR com tabela de critérios | Task 10 |
| Deploy Vercel | Task 12 |
