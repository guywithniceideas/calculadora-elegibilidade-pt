import { describe, it, expect } from 'vitest'
import { brlToEur, eurToBrl } from '@/lib/exchangeRate'

describe('brlToEur', () => {
  it('converts correctly', () => {
    expect(brlToEur(5850, 5.85)).toBe(1000)
  })
  it('returns 0 for zero input', () => {
    expect(brlToEur(0, 5.85)).toBe(0)
  })
  it('returns 0 for zero rate', () => {
    expect(brlToEur(1000, 0)).toBe(0)
  })
})

describe('eurToBrl', () => {
  it('converts correctly', () => {
    expect(eurToBrl(1000, 5.85)).toBe(5850)
  })
  it('returns 0 for zero input', () => {
    expect(eurToBrl(0, 5.85)).toBe(0)
  })
})
