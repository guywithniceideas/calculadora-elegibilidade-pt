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
      className="block w-full bg-[#1A1A1A] hover:bg-[#333] text-white py-3 rounded-2xl text-sm font-bold transition-colors text-center"
    >
      {({ loading }) => loading ? 'Gerando PDF...' : '📄 Baixar Relatório de Elegibilidade (PDF)'}
    </PDFDownloadLink>
  )
}

export default dynamic(() => Promise.resolve(Button), { ssr: false })
