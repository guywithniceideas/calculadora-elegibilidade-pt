import {
  Document, Page, Text, View, StyleSheet,
} from '@react-pdf/renderer'
import type { CalculatorInput, CalculatorResult } from '@/lib/types'

const VISA_LABELS: Record<string, string> = {
  D7: 'D7 — Renda Passiva',
  D8: 'D8 — Nômade Digital',
  D2: 'D2 — Empreendedor',
}

const STATUS_LABELS: Record<string, string> = {
  eligible: 'ELEGÍVEL',
  partial: 'PARCIALMENTE ELEGÍVEL',
  ineligible: 'NÃO ELEGÍVEL',
}

function fmt(n: number) {
  return `€ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 10, color: '#1e293b', padding: 40 },
  header: { marginBottom: 24, borderBottom: '2px solid #6366f1', paddingBottom: 12 },
  title: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#1e293b', marginBottom: 4 },
  subtitle: { fontSize: 10, color: '#64748b' },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#6366f1', marginBottom: 6, textTransform: 'uppercase' },
  row: { flexDirection: 'row', borderBottom: '1px solid #e2e8f0', paddingVertical: 5 },
  cell: { flex: 1, fontSize: 10 },
  cellBold: { flex: 1, fontSize: 10, fontFamily: 'Helvetica-Bold' },
  statusEligible: { color: '#16a34a', fontFamily: 'Helvetica-Bold', fontSize: 14, marginBottom: 8 },
  statusPartial: { color: '#d97706', fontFamily: 'Helvetica-Bold', fontSize: 14, marginBottom: 8 },
  statusIneligible: { color: '#dc2626', fontFamily: 'Helvetica-Bold', fontSize: 14, marginBottom: 8 },
  alertBox: { backgroundColor: '#fef9c3', padding: 8, marginBottom: 6, borderRadius: 4 },
  alertTitle: { fontFamily: 'Helvetica-Bold', fontSize: 9, marginBottom: 2 },
  alertMsg: { fontSize: 9, color: '#64748b' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 8, color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: 8 },
})

interface Props {
  input: CalculatorInput
  result: CalculatorResult
  generatedAt: string
}

export default function PdfDocument({ input, result, generatedAt }: Props) {
  const { visaType, family, hasCPLPTerm, conservativeMode } = input
  const { requiredMonthlyIncome, requiredSavings, incomePercent, savingsPercent, overallStatus, alerts } = result

  const totalMembers = 1 + family.spouses + family.children + family.adultDependents

  const statusStyle = overallStatus === 'eligible' ? s.statusEligible : overallStatus === 'partial' ? s.statusPartial : s.statusIneligible

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Cabeçalho */}
        <View style={s.header}>
          <Text style={s.title}>Relatório de Elegibilidade Migratória</Text>
          <Text style={s.subtitle}>Calculadora de Elegibilidade PT · Gerado em {generatedAt} · Baseado na RMMG 2026 (€920)</Text>
        </View>

        {/* Resultado geral */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Resultado</Text>
          <Text style={statusStyle}>{STATUS_LABELS[overallStatus]}</Text>
        </View>

        {/* Perfil */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Perfil do Requerente</Text>
          <View style={s.row}>
            <Text style={s.cellBold}>Tipo de Visto</Text>
            <Text style={s.cell}>{VISA_LABELS[visaType]}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.cellBold}>Total de membros</Text>
            <Text style={s.cell}>{totalMembers} ({1} titular, {family.spouses} cônjuge(s), {family.children} filho(s), {family.adultDependents} dep. adulto(s))</Text>
          </View>
          <View style={s.row}>
            <Text style={s.cellBold}>CPLP com Termo</Text>
            <Text style={s.cell}>{hasCPLPTerm ? 'Sim' : 'Não'}</Text>
          </View>
          {visaType === 'D8' && (
            <View style={s.row}>
              <Text style={s.cellBold}>Modo Conservador</Text>
              <Text style={s.cell}>{conservativeMode ? 'Ativo' : 'Inativo'}</Text>
            </View>
          )}
        </View>

        {/* Critérios */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Critérios Financeiros</Text>
          <View style={[s.row, { backgroundColor: '#f8fafc' }]}>
            <Text style={s.cellBold}>Critério</Text>
            <Text style={s.cellBold}>Exigido</Text>
            <Text style={s.cellBold}>Informado</Text>
            <Text style={s.cellBold}>Atingimento</Text>
          </View>
          <View style={s.row}>
            <Text style={s.cell}>Renda mensal</Text>
            <Text style={s.cell}>{fmt(requiredMonthlyIncome)}</Text>
            <Text style={s.cell}>{fmt(input.monthlyIncome)}</Text>
            <Text style={s.cell}>{incomePercent}%</Text>
          </View>
          <View style={s.row}>
            <Text style={s.cell}>Poupança em PT</Text>
            <Text style={s.cell}>{hasCPLPTerm ? 'Dispensado (CPLP)' : fmt(requiredSavings)}</Text>
            <Text style={s.cell}>{fmt(input.savingsInPortugal)}</Text>
            <Text style={s.cell}>{hasCPLPTerm ? 'N/A' : `${savingsPercent}%`}</Text>
          </View>
        </View>

        {/* Alertas */}
        {alerts.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Observações</Text>
            {alerts.map((a, i) => (
              <View key={i} style={s.alertBox}>
                <Text style={s.alertTitle}>{a.title}</Text>
                <Text style={s.alertMsg}>{a.message}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Rodapé */}
        <View style={s.footer}>
          <Text>Baseado na RMMG 2026 (Decreto-Lei n.º 139/2025) e Portaria n.º 1563/2007 · Documento informativo, não substitui consultoria jurídica especializada.</Text>
          <Text style={{ marginTop: 4 }}>Vilanova Maranhão Advogados · @rodrigomaranhao.adv · Dúvidas? Fale connosco no WhatsApp: +351 937 186 286</Text>
        </View>
      </Page>
    </Document>
  )
}
