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
    case 'conjuge':        return { spouses: 1, children: 0, adultDependents: 0 }
    case 'conjuge_filhos': return { spouses: 1, children: 1, adultDependents: 0 }
    case 'filhos':         return { spouses: 0, children: 1, adultDependents: 0 }
    default:               return { spouses: 0, children: 0, adultDependents: 0 }
  }
}
