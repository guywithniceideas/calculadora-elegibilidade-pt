import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Calculadora de Elegibilidade PT',
  description: 'Calcule se sua renda atende os requisitos financeiros para os Vistos D7, D8 e D2 de Portugal.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" style={{ background: '#EDEBE7' }}>
      <body className={`${inter.className} min-h-screen`} style={{ background: '#EDEBE7', color: '#1A1A1A' }}>
        {children}
      </body>
    </html>
  )
}
