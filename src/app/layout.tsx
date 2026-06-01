import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ElegiPortugal — Calculadora de Elegibilidade',
  description: 'Calcule se você atende os requisitos financeiros para os Vistos D7, D8 e D2 de Portugal.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="bg-slate-950">
      <body className={`${inter.className} bg-slate-950 text-slate-100 min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
