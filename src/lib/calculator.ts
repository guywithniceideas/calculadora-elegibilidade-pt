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
  const overallStatus = bothOk ? 'eligible' : incomeStatus === 'fail' ? 'ineligible' : 'partial'

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
