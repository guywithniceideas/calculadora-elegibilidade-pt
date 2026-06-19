import { pdf } from '@react-pdf/renderer'
import PdfDocument from '@/components/PdfDocument'
import type { CalculatorInput, CalculatorResult } from './types'

export async function downloadCalculatorPdf(input: CalculatorInput, result: CalculatorResult) {
  const now = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
  const filename = `elegibilidade-${input.visaType.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.pdf`

  const blob = await pdf(<PdfDocument input={input} result={result} generatedAt={now} />).toBlob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
