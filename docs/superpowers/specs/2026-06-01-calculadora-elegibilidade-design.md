# Design: Calculadora de Elegibilidade para Vistos D7, D8 e D2 — Portugal 2026

**Data:** 2026-06-01  
**Status:** Aprovado pelo usuário  
**Stack:** Next.js 14 + React 18 + Tailwind CSS + @react-pdf/renderer  
**Deploy:** Vercel (plano gratuito)  
**Idioma:** Português (PT-BR)

---

## 1. Objetivo

Mini SaaS que calcula em tempo real se a renda e poupança de um candidato à imigração portuguesa atendem os requisitos financeiros mínimos dos Vistos D7, D8 ou D2 — e gera um PDF de elegibilidade formatado para envio a escritórios de assessoria jurídica.

---

## 2. Público-alvo

Brasileiros (e demais cidadãos de países terceiros) que planejam emigrar para Portugal e querem saber, antes de contratar uma assessoria, se estão financeiramente qualificados para o visto desejado.

---

## 3. Stack e Justificativas

| Decisão | Escolha | Motivo |
|---|---|---|
| Framework | Next.js 14 (App Router) | Deploy na Vercel, SSR, fácil de escalar |
| UI | React 18 + Tailwind CSS | Produtividade, sem dependência de UI lib pesada |
| PDF | @react-pdf/renderer | PDF programático limpo, client-side, sem servidor |
| Deploy | Vercel (gratuito) | Zero configuração, HTTPS automático, CI integrado |
| Idioma | PT-BR | Público-alvo é majoritariamente brasileiro |

---

## 4. Layout: Dashboard Dividido

A tela principal é dividida em dois painéis:

- **Painel esquerdo (inputs):** tipo de visto, renda, poupança, composição familiar, toggles
- **Painel direito (resultado):** cálculo ao vivo, barras de progresso, alertas, botão PDF

Nenhum botão "Calcular" — o resultado atualiza automaticamente a cada mudança de input (estado React).

---

## 5. Identidade Visual

| Token | Valor |
|---|---|
| Background principal | `#0f172a` (slate-950) |
| Background painel | `#1e293b` (slate-800) |
| Borda/divisor | `#334155` (slate-700) |
| Acento primário | `#6366f1` (indigo-500) |
| Sucesso / Elegível | `#10b981` (emerald-500) |
| Alerta / Gap | `#f59e0b` (amber-500) |
| Erro / Inelegível | `#ef4444` (red-500) |
| Texto principal | `#f1f5f9` (slate-100) |
| Texto secundário | `#94a3b8` (slate-400) |

---

## 6. Funcionalidades

### 6.1 Seleção de Tipo de Visto (Abas)
Três abas no topo do painel de inputs:
- **D7 — Renda Passiva** (aposentadoria, dividendos, aluguéis, juros)
- **D8 — Nômade Digital** (trabalho remoto para empresa fora de Portugal)
- **D2 — Empreendedor** (empresa própria, freelancer com CNPJ/NIF)

Ao trocar de aba, os campos específicos de cada visto aparecem/somem e o cálculo é refeito.

### 6.2 Inputs do Painel Esquerdo

**Campos comuns (todos os vistos):**
- Renda mensal comprovável (€ ou R$ com conversão opcional)
- Poupança atual em conta portuguesa (€)

**Agregado familiar (interativo):**
- Titular sempre presente (não removível)
- Botão `+ Cônjuge` — adiciona 1 adulto extra (máximo 1)
- Botão `+ Filho` — adiciona menor (pode clicar múltiplas vezes, até 10)
- Botão `+ Dependente adulto` — adiciona adulto extra além do cônjuge
- Cada membro adicionado aparece como chip removível com ×

**Toggles:**
- **CPLP com Termo de Responsabilidade** (Sim/Não) — desativa a exigência de poupança estática quando ativo, exibe nota explicativa
- **Modo Conservador** (apenas D8) — recalcula incrementos familiares sobre €3.680 em vez de €920

**Campo exclusivo D2:**
- Capital alocado à empresa (€) — exibe alerta se abaixo de €3.000

### 6.3 Motor de Cálculo (constantes de 2026)

```
RMMG = €920,00
FATOR_D8 = 4  → base D8 = €3.680
MESES = 12

Poupança exigida:
  Titular:     RMMG × 12 = €11.040
  Cônjuge:     RMMG × 0,5 × 12 = €5.520
  Filho:       RMMG × 0,3 × 12 = €3.312
  Dep. adulto: RMMG × 0,5 × 12 = €5.520

Renda mensal exigida:
  D7 / D2:
    = RMMG × 1,0
    + cônjuges × RMMG × 0,5
    + filhos × RMMG × 0,3
    + dep.adultos × RMMG × 0,5

  D8 (modo legal):
    = RMMG × 4
    + cônjuges × RMMG × 0,5
    + filhos × RMMG × 0,3

  D8 (modo conservador):
    = RMMG × 4
    + cônjuges × (RMMG × 4) × 0,5
    + filhos × (RMMG × 4) × 0,3
```

### 6.4 Painel Direito — Resultado em Tempo Real

**Badge de status (atualiza ao vivo):**
- ✅ Verde: "Perfil Elegível" — renda E poupança atingem os mínimos
- ⚠️ Âmbar: "Parcialmente Elegível" — um dos dois critérios não atinge
- ❌ Vermelho: "Não Elegível" — ambos abaixo do mínimo

**Cards de valores:**
- Renda exigida (calculada) vs. renda informada
- Poupança exigida (calculada) vs. poupança informada

**Barras de progresso:**
- Verde quando ≥ 100%, âmbar entre 70-99%, vermelho abaixo de 70%
- Porcentagem numérica exibida ao lado

**Alertas contextuais (aparecem condicionalmente):**
- Gap de poupança: "Você precisa de mais €X na conta em Portugal"
- D8 modo conservador ativo: explicação da ambiguidade legal
- CPLP ativo: explicação do Termo de Responsabilidade
- D2 capital baixo: "Capital abaixo de €3.000 representa alto risco de indeferimento"
- D8 tributação: aviso sobre IRS progressivo se renda superar €43.086/ano

### 6.5 Geração de PDF

Ao clicar "Baixar Relatório de Elegibilidade (PDF)", o app gera e baixa um PDF client-side com:

**Estrutura do documento:**
1. Cabeçalho — logo, título "Relatório de Elegibilidade Migratória", data de geração
2. Tipo de visto selecionado e composição familiar
3. Tabela: Critério | Exigido | Informado | Status
4. Resultado geral (Elegível / Parcialmente Elegível / Não Elegível)
5. Alertas e observações relevantes
6. Rodapé legal: "Baseado na RMMG 2026 (Decreto-Lei nº 139/2025) e Portaria nº 1563/2007. Este documento é informativo e não substitui consultoria jurídica."

**Formato:** A4, PT-BR, cores institucionais (versão clara mesmo no app dark mode — PDF sempre claro para impressão).

---

## 7. Estados da Interface

| Estado | Painel Esquerdo | Painel Direito |
|---|---|---|
| Inicial (sem dados) | Placeholders | "Preencha os dados ao lado" |
| Digitando | Inputs com valores | Cálculo ao vivo |
| Elegível completo | Verde nas barras | Badge verde + PDF habilitado |
| Gap de poupança | Normal | Badge âmbar + alerta de gap |
| Não elegível | Normal | Badge vermelho + quanto falta |
| CPLP ativo | Toggle verde | Nota sobre Termo, poupança dispensada |

---

## 8. Estrutura de Arquivos (Next.js App Router)

```
src/
  app/
    page.tsx              ← página principal
    layout.tsx            ← layout global (dark bg, fonte)
  components/
    VisaTypeTabs.tsx      ← abas D7/D8/D2
    InputPanel.tsx        ← painel esquerdo completo
    FamilyBuilder.tsx     ← chips de membros da família
    ResultPanel.tsx       ← painel direito completo
    StatusBadge.tsx       ← badge Elegível/Âmbar/Vermelho
    ProgressBar.tsx       ← barra de progresso com %
    AlertCard.tsx         ← alertas contextuais
    PdfDocument.tsx       ← documento @react-pdf/renderer
  lib/
    calculator.ts         ← motor de cálculo puro (sem UI)
    constants.ts          ← RMMG, fatores, etc.
    types.ts              ← tipos TypeScript
```

---

## 9. Não está no escopo (v1)

- Autenticação / contas de usuário
- Salvar simulações no servidor
- Cálculo de IRS detalhado (apenas aviso contextual)
- Suporte a outros vistos (D1, D3, etc.)
- Versão em inglês
- Painel admin / analytics

---

## 10. Critérios de Sucesso

- [ ] Cálculo correto para D7, D8 e D2 com todas as combinações familiares
- [ ] Modo Conservador D8 exibe valores distintos do modo legal
- [ ] Toggle CPLP desativa corretamente a exigência de poupança
- [ ] PDF gerado sem erros, formatado profissionalmente em PT-BR
- [ ] App funciona na Vercel sem configuração adicional de servidor
- [ ] Interface responsiva (funciona em telas de laptop — não precisa ser mobile-first)
