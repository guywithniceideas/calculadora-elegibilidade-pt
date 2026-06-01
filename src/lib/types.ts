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
