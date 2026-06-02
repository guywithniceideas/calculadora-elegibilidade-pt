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
