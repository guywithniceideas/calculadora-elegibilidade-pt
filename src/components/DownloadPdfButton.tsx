'use client'
import { useState } from 'react'
import { downloadCalculatorPdf } from '@/lib/generatePdf'
import type { CalculatorInput, CalculatorResult } from '@/lib/types'

interface Props {
  input: CalculatorInput
  result: CalculatorResult
  label?: string
}

export default function DownloadPdfButton({ input, result, label = 'Baixar Relatório de Elegibilidade (PDF)' }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      await downloadCalculatorPdf(input, result)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="block w-full bg-[#1A1A1A] hover:bg-[#333] disabled:opacity-60 text-white py-3 rounded-2xl text-sm font-bold transition-colors text-center"
    >
      {loading ? 'Gerando PDF...' : label}
    </button>
  )
}
