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
