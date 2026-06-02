const FALLBACK_RATE = 5.85 // BRL per 1 EUR (fallback if API fails)

export interface ExchangeRateResult {
  rate: number        // BRL per 1 EUR, e.g. 5.85
  date: string        // ISO date from API, e.g. "2026-06-02"
  source: 'live' | 'fallback'
}

export function brlToEur(brl: number, rate: number): number {
  if (!rate || rate <= 0) return 0
  return Math.round((brl / rate) * 100) / 100
}

export function eurToBrl(eur: number, rate: number): number {
  if (!rate || rate <= 0) return 0
  return Math.round(eur * rate * 100) / 100
}

export async function fetchEurToBrlRate(): Promise<ExchangeRateResult> {
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=EUR&to=BRL', {
      next: { revalidate: 3600 }, // cache for 1 hour in Next.js
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const rate = data?.rates?.BRL
    if (!rate || typeof rate !== 'number') throw new Error('Invalid rate')
    return { rate, date: data.date ?? '', source: 'live' }
  } catch {
    return { rate: FALLBACK_RATE, date: '', source: 'fallback' }
  }
}
