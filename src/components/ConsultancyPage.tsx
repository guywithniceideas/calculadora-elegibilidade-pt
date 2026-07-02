'use client'
import { motion } from 'framer-motion'
import DownloadPdfButton from './DownloadPdfButton'
import type { CalculatorInput, CalculatorResult } from '@/lib/types'

const WHATSAPP_URL =
  'https://api.whatsapp.com/send/?phone=351937186286&text&type=phone_number&app_absent=0'

const BENEFITS = [
  'Análise jurídica personalizada do seu perfil',
  'Orientação completa na documentação exigida',
  'Acompanhamento junto à AIMA ao longo do processo',
  'Suporte para toda a família incluída no processo',
]

interface Props {
  input: CalculatorInput
  result: CalculatorResult
  onBack: () => void
}

export default function ConsultancyPage({ input, result, onBack }: Props) {
  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <div className="w-full">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#E0E0E0] shadow-sm text-xs font-semibold text-[#444] hover:bg-[#EFEFEF] hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Voltar para a Análise
        </button>
      </div>

      <div className="glass-card rounded-3xl w-full max-w-2xl mx-auto overflow-hidden">
        {/* Header */}
        <div className="p-8 pb-6 text-center border-b border-[#F0F0F0]">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            className="w-14 h-14 rounded-full bg-[#1A1A1A] flex items-center justify-center mb-4 mx-auto"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </motion.div>

          <p className="text-[9px] font-black tracking-[1.8px] uppercase text-[#666] mb-2">
            Análise Concluída
          </p>
          <p className="text-xs font-semibold text-[#16a34a] mb-2">
            ✓ Seu relatório em PDF já está sendo baixado
          </p>
          <h2 className="text-xl font-extrabold text-[#1A1A1A] tracking-tight leading-snug">
            Quer garantir o seu processo com<br className="hidden sm:block" /> apoio jurídico especializado?
          </h2>
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col gap-6">
          <p className="text-sm text-[#555] leading-relaxed">
            A calculadora deu uma visão inicial do seu perfil — mas cada caso tem particularidades
            que só um especialista consegue avaliar corretamente. No{' '}
            <strong className="text-[#1A1A1A]">Vilanova Maranhão Advogados</strong>, analisamos
            os detalhes jurídicos do seu processo, orientamos na documentação e acompanhamos cada
            etapa até à concessão do visto.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BENEFITS.map((item) => (
              <div key={item} className="flex items-start gap-2.5 bg-[#F8F8F8] rounded-2xl p-3.5">
                <div className="w-5 h-5 rounded-full bg-[#1A1A1A] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-[#333] leading-relaxed">{item}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full bg-[#25D366] hover:bg-[#1ebe5d] active:scale-[0.98] text-white py-4 rounded-2xl text-sm font-bold transition-all text-center"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Falar com um Especialista no WhatsApp
            </a>

            <DownloadPdfButton input={input} result={result} label="Baixar novamente em PDF" />
          </div>

          <p className="text-center text-[10px] text-[#AAA] leading-relaxed px-2">
            Esta calculadora é uma ferramenta informativa e não substitui uma consulta jurídica.
            Mesmo com alta compatibilidade, os detalhes do seu perfil só podem ser avaliados por um profissional.
          </p>
        </div>
      </div>
    </div>
  )
}
