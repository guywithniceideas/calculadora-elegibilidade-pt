'use client'
// Stub — will be replaced in Task 10 with full PDF implementation
import type { CalculatorInput, CalculatorResult } from '@/lib/types'

interface Props {
  input: CalculatorInput
  result: CalculatorResult
}

export default function DownloadPdfButton({ input, result }: Props) {
  return (
    <button className="block w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg text-sm font-semibold transition-colors text-center">
      📄 Baixar Relatório de Elegibilidade (PDF)
    </button>
  )
}
