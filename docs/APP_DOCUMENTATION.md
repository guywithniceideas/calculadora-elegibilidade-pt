# Calculadora de Elegibilidade PT — Documentação Técnica Completa

> **Versão:** 2026 | **Stack:** Next.js 14 + React 18 + TypeScript + Tailwind CSS v4  
> **Deploy:** https://calculadora-elegibilidade-pt.vercel.app  
> **Repositório:** https://github.com/guywithniceideas/calculadora-elegibilidade-pt

---

## Índice

1. [Visão Geral do Produto](#1-visão-geral-do-produto)
2. [Arquitetura e Stack Técnico](#2-arquitetura-e-stack-técnico)
3. [Fluxo de Usuário](#3-fluxo-de-usuário)
4. [Camada de Dados — `src/lib/`](#4-camada-de-dados--srclib)
   - 4.1 [types.ts](#41-typests)
   - 4.2 [constants.ts](#42-constantsts)
   - 4.3 [calculator.ts](#43-calculatorts)
   - 4.4 [compatibility.ts](#44-compatibilityts)
   - 4.5 [exchangeRate.ts](#45-exchangeratets)
5. [Componentes — `src/components/`](#5-componentes--srccomponents)
   - 5.1 [StepIndicator](#51-stepindicator)
   - 5.2 [VisaTypeTabs](#52-visatypetabs)
   - 5.3 [ScreeningPanel](#53-screeningpanel)
   - 5.4 [InputPanel](#54-inputpanel)
   - 5.5 [FamilyBuilder](#55-familybuilder)
   - 5.6 [CompatibilityBadge](#56-compatibilitybadge)
   - 5.7 [VisaCompatibilityCards](#57-visacompatibilitycards)
   - 5.8 [ResultPanel](#58-resultpanel)
   - 5.9 [ProgressBar](#59-progressbar)
   - 5.10 [AlertCard](#510-alertcard)
   - 5.11 [EmailModal](#511-emailmodal)
   - 5.12 [LoadingOverlay](#512-loadingoverlay)
   - 5.13 [PdfDocument](#513-pdfdocument)
   - 5.14 [DownloadPdfButton](#514-downloadpdfbutton)
   - 5.15 [StatusBadge](#515-statusbadge)
6. [Página Principal — `src/app/page.tsx`](#6-página-principal--srcappagetsx)
7. [Sistema de Design](#7-sistema-de-design)
8. [Regras de Negócio — Cálculos dos Vistos](#8-regras-de-negócio--cálculos-dos-vistos)
9. [Motor de Compatibilidade](#9-motor-de-compatibilidade)
10. [Câmbio BRL/EUR](#10-câmbio-brleur)
11. [Geração de PDF](#11-geração-de-pdf)
12. [Integração futura — n8n Webhook (Sub-projeto 2)](#12-integração-futura--n8n-webhook-sub-projeto-2)
13. [Testes](#13-testes)
14. [Deploy e CI/CD](#14-deploy-e-cicd)

---

## 1. Visão Geral do Produto

A **Calculadora de Elegibilidade PT** é um Mini SaaS web que permite a cidadãos brasileiros (e de outros países) verificar, de forma rápida e precisa, se sua situação financeira atende os requisitos mínimos para obtenção de um visto de residência em Portugal.

### Vistos suportados

| Código | Nome | Perfil |
|--------|------|--------|
| **D1** | Trabalho Subordinado | Empregado com contrato formal em empresa portuguesa |
| **D2** | Empreendedor | Empresário, autônomo ou freelancer com operação própria |
| **D4** | Estudante | Graduação, Mestrado ou Doutorado em instituição portuguesa |
| **D7** | Renda Passiva | Aposentados, investidores, detentores de dividendos/aluguéis |
| **D8** | Nômade Digital | Trabalhadores remotos prestando serviço para empresa no exterior |

### Propósito estratégico

- Funcionar como **ferramenta de captação de leads** para o escritório Vilanova Maranhão Advogados / Rodrigo Maranhão
- Gerar um **relatório preliminar em PDF** que o usuário entrega à assessoria jurídica
- Plantar a semente de que o próximo passo é uma **consulta profissional**
- Upsell integrado: workshop de simulação de custos de vida em Portugal

---

## 2. Arquitetura e Stack Técnico

```
calculadora-elegibilidade-pt/
├── src/
│   ├── app/
│   │   ├── globals.css        # Design tokens + classe .btn-cta
│   │   ├── layout.tsx         # HTML shell, metadata, Inter font
│   │   └── page.tsx           # Orquestrador principal (toda a lógica de estado)
│   ├── components/            # 15 componentes React
│   ├── lib/                   # 4 módulos de lógica pura
│   └── test/
│       └── setup.ts           # Configuração do @testing-library/jest-dom
├── public/
│   ├── pt-flag.png            # Bandeira de Portugal (header)
│   ├── vm-logo.png            # Logo Vilanova Maranhão Advogados (footer)
│   └── logo-rm.png            # Logo Rodrigo Maranhão (header + footer)
├── docs/
│   └── superpowers/           # Specs e planos de implementação
├── next.config.ts             # Canvas alias para @react-pdf/renderer
├── vitest.config.ts           # Configuração de testes
└── package.json
```

### Tecnologias

| Tecnologia | Versão | Uso |
|---|---|---|
| Next.js | 16.x | Framework (App Router, SSG) |
| React | 18.x | UI |
| TypeScript | 5.x | Tipagem |
| Tailwind CSS | v4 | Estilização (`@import "tailwindcss"`) |
| @react-pdf/renderer | 4.x | Geração de PDF client-side |
| framer-motion | — | Animação do card de compatibilidade |
| Vitest | 4.x | Testes unitários |
| @testing-library/react | 16.x | Testes de componentes |
| Vercel | — | Hospedagem e CI/CD |

---

## 3. Fluxo de Usuário

```
┌─────────────────────────────────────────────────────────┐
│                      ETAPA 1                             │
│              Rastreio de Perfil                          │
│                                                          │
│  ┌─────────────────────┐  ┌──────────────────────────┐  │
│  │   ScreeningPanel    │  │  VisaCompatibilityCards  │  │
│  │                     │  │  (step=1, sem circular)  │  │
│  │ 1. Qual objetivo?   │  │                          │  │
│  │ 2. Qual situação?   │  │  Barras ao vivo enquanto │  │
│  │ 3. Quem vem junto?  │  │  responde as perguntas   │  │
│  └─────────────────────┘  └──────────────────────────┘  │
│                                                          │
│  [Próxima Etapa →]  ← ativo só com 3 perguntas respondidas
└─────────────────────────────────────────────────────────┘
                            ↓
                    (scroll to top)
┌─────────────────────────────────────────────────────────┐
│                      ETAPA 2                             │
│              Análise de Renda                            │
│                                                          │
│  ┌───────────────────┐  ┌────────────────────────────┐  │
│  │   InputPanel      │  │  ResultPanel               │  │
│  │                   │  │  CompatibilityBadge        │  │
│  │ Renda em BRL→EUR  │  │  Valores exigidos          │  │
│  │ Poupança BRL/EUR  │  │  ProgressBars              │  │
│  │ Agregado familiar │  │  AlertCards                │  │
│  │ D1/D2/D4/D7/D8    │  │  [Botão PDF]               │  │
│  └───────────────────┘  │  VisaCompatibilityCards    │  │
│                          │  (step=2 + circular %)    │  │
│                          └────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↓
                   [Clica no botão PDF]
┌─────────────────────────────────────────────────────────┐
│                   EmailModal                             │
│         Nome + Email → [Receber meu relatório →]        │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                  LoadingOverlay                          │
│  0–3s:   Spinner "Preparando seu relatório..."          │
│  3s+:    ✓ Check + "Enviado por email!" + Upsell        │
│  5s+:    [Fechar e voltar à calculadora]                │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Camada de Dados — `src/lib/`

### 4.1 `types.ts`

Define todos os tipos TypeScript do sistema.

#### Tipos primitivos

```typescript
type VisaType    = 'D7' | 'D8' | 'D2' | 'D1' | 'D4'
type VisaTypeId  = 'D1' | 'D2' | 'D4' | 'D7' | 'D8'  // usado no motor de compatibilidade
type Step        = 1 | 2

type EligibilityStatus = 'eligible' | 'partial' | 'ineligible'
type CriterionStatus   = 'pass' | 'warning' | 'fail' | 'waived'
type AlertType         = 'info' | 'warning' | 'error'

// Respostas do rastreio — union types tipados para segurança
type Objetivo = 'presencial' | 'remoto' | 'empreender' | 'renda_passiva' | 'estudar'
type Situacao = 'empregado' | 'freelancer' | 'empresario' | 'aposentado' | 'investidor' | 'estudante'
type Familia  = 'sozinho' | 'conjuge' | 'conjuge_filhos' | 'filhos'
```

#### Interfaces principais

| Interface | Descrição |
|---|---|
| `FamilyComposition` | `{ spouses, children, adultDependents }` — composição do agregado familiar |
| `CalculatorInput` | Todos os inputs da calculadora: tipo de visto, renda, poupança, família, flags |
| `CalculatorResult` | Resultado completo: valores exigidos, status, percentuais, alertas |
| `Alert` | Uma mensagem de alerta: `{ type, title, message }` |
| `ScreeningAnswers` | Respostas das 3 perguntas do rastreio: `{ objetivo, situacao, familia }` |
| `VisaScore` | Score de compatibilidade de um visto: `{ visaId, label, description, score }` |
| `ExchangeRateResult` | Resultado da API de câmbio: `{ rate, date, source }` |

---

### 4.2 `constants.ts`

Constantes da legislação portuguesa vigente para 2026.

| Constante | Valor | Significado |
|---|---|---|
| `RMMG` | `920` | Retribuição Mínima Mensal Garantida 2026 (Decreto-Lei n.º 139/2025) |
| `D8_FACTOR` | `4` | Multiplicador do D8 (4× RMMG = €3.680/mês) |
| `MONTHS` | `12` | Meses de poupança exigidos para o visto |
| `EXTRA_ADULT_FACTOR` | `0.5` | Fator para cônjuge e dependentes adultos (50% da RMMG) |
| `CHILD_FACTOR` | `0.3` | Fator para filhos (30% da RMMG) |
| `D2_MIN_CAPITAL_WARNING` | `3000` | Threshold mínimo de capital empresarial (aviso de risco) |
| `IRS_HIGH_BRACKET_ANNUAL` | `43086` | Limiar do IRS que dispara aviso fiscal no D8 |

---

### 4.3 `calculator.ts`

Motor de cálculo puro. Sem side-effects, sem dependências de UI.

#### `calculateRequiredIncome(input: CalculatorInput): number`

Calcula a **renda mensal mínima exigida** baseada no tipo de visto e composição familiar.

**Lógica por visto:**

- **D1, D2, D4, D7:**
  ```
  RMMG + (cônjuges + dep.adultos) × RMMG × 0.5 + filhos × RMMG × 0.3
  ```

- **D8 (modo legal — padrão):**
  ```
  max(RMMG × 4, cálculo_familiar_padrão)
  ```
  A base do D8 (€3.680) já cobre a subsistência familiar na maioria dos casos. Só aumenta com famílias muito numerosas (>8 filhos).

- **D8 (modo conservador):**
  ```
  base + cônjuges × base × 0.5 + filhos × base × 0.3
  ```
  Onde `base = RMMG × 4 = €3.680`. Usado quando o usuário ativa o modo conservador (interpretação mais rígida de alguns postos consulares).

**Exemplos de saída:**

| Composição | D7/D1/D2/D4 | D8 |
|---|---|---|
| Titular | €920 | €3.680 |
| Titular + cônjuge | €1.380 | €3.680 |
| Titular + cônjuge + 1 filho | €1.656 | €3.680 |
| Titular + 9 filhos | — | €3.864 |

---

#### `calculateRequiredSavings(input: CalculatorInput): number`

Calcula a **poupança mínima em conta bancária portuguesa**.

```
RMMG × 12 + cônjuges × RMMG × 0.5 × 12 + filhos × RMMG × 0.3 × 12
```

A fórmula é **idêntica para todos os vistos** — a poupança representa 12 meses de subsistência ao nível mínimo, independente do tipo de visto.

**Exemplos:**

| Composição | Poupança exigida |
|---|---|
| Titular | €11.040 |
| Titular + cônjuge | €16.560 |
| Titular + cônjuge + 1 filho | €19.872 |
| Titular + cônjuge + 2 filhos | €23.184 |

---

#### `calculate(input: CalculatorInput): CalculatorResult`

Função principal — orquestra todos os cálculos e retorna o resultado completo.

**Processo interno:**
1. Chama `calculateRequiredIncome` e `calculateRequiredSavings`
2. Calcula `incomeStatus` e `savingsStatus` via `criterionStatus`:
   - `≥ 100%` → `'pass'`
   - `≥ 70%` → `'warning'`
   - `< 70%` → `'fail'`
3. Calcula percentuais (capped a 999%)
4. CPLP ativo → `savingsStatus = 'waived'`, `savingsPercent = 100`
5. Determina `overallStatus`:
   - `'eligible'` quando renda passa E poupança passa/dispensada
   - `'ineligible'` quando renda falha
   - `'partial'` nos demais casos
6. Constrói array de alertas via `buildAlerts`

---

#### `buildAlerts(input, requiredSavings): Alert[]` *(privada)*

Gera alertas contextuais baseados na situação do usuário:

| Condição | Alerta |
|---|---|
| Poupança < exigida | ⚠️ "Poupança insuficiente" — mostra gap em EUR |
| CPLP ativo | ℹ️ Explica o Termo de Responsabilidade |
| D8 + conservador + família | ℹ️ "Modo Conservador ativo" |
| D8 + renda × 12 > €43.086 | ⚠️ "Atenção: IRS progressivo" |
| D1 | ℹ️ Exige contrato de trabalho + IEFP |
| D4 | ℹ️ Exige carta de aceitação da instituição |
| D2 + capital < €3.000 | 🚨 "Capital empresarial insuficiente" |

---

### 4.4 `compatibility.ts`

Motor de compatibilidade de vistos. Pontuação baseada nas respostas do rastreio.

#### `scoreVisas(answers: ScreeningAnswers): VisaScore[]`

Pontua os 5 vistos com base nas respostas qualitativas. Retorna array ordenado descrescente.

**Pontuação base:** `15 pts` para todos os vistos.

**Pontos por objetivo:**

| Objetivo | Visto beneficiado | Pontos |
|---|---|---|
| `presencial` | D1 | +50 |
| `remoto` | D8 | +50 |
| `empreender` | D2 | +50 |
| `renda_passiva` | D7 | +50 |
| `estudar` | D4 | +50 |

**Pontos por situação profissional:**

| Situação | Visto | Pontos |
|---|---|---|
| `empregado` | D1 | +35 |
| `empregado` | D8 | +20 (só se objetivo = remoto) |
| `freelancer` | D2 | +35 |
| `freelancer` | D8 | +35 |
| `empresario` | D2 | +35 |
| `aposentado` | D7 | +35 |
| `investidor` | D7 | +35 |
| `estudante` | D4 | +35 |

**Regra especial:** CLT (`empregado`) com objetivo diferente de `remoto` perde os +20 do D8.

**Cap:** score máximo na Etapa 1 = **70%**.

---

#### `applyFinancialScore(visaScores, activeVisaId, incomePercent, savingsPercent): VisaScore[]`

Adiciona bônus financeiro ao visto ativo após o usuário preencher a calculadora (Etapa 2).

```
incomeBonus  = incomePercent  >= 100 ? 20 : round(incomePercent  / 100 × 20)
savingsBonus = savingsPercent >= 100 ? 9  : round(savingsPercent / 100 × 9)
score final  = min(score_etapa1 + incomeBonus + savingsBonus, 99)
```

**Score máximo total: 99% (nunca 100%)** — decisão de marketing para gerar curiosidade sobre "o 1% que falta".

---

#### `getTop3Visas(visaScores): VisaScore[]`

Retorna os 3 vistos mais compatíveis, ordenados por score.

- Se todos os scores estão no nível base (sem respostas ainda): retorna `D8, D7, D2` com score `0`
- Caso contrário: re-ordena e retorna os 3 primeiros

---

#### `familyFromFamilia(familia): FamilyComposition`

Converte a resposta da pergunta "Quem vem com você?" em composição familiar para pré-preencher o FamilyBuilder.

| Resposta | spouses | children | adultDependents |
|---|---|---|---|
| `'sozinho'` / null | 0 | 0 | 0 |
| `'conjuge'` | 1 | 0 | 0 |
| `'conjuge_filhos'` | 1 | 1 | 0 |
| `'filhos'` | 0 | 1 | 0 |

---

### 4.5 `exchangeRate.ts`

Gerencia a conversão de moeda BRL ↔ EUR.

#### `fetchEurToBrlRate(): Promise<ExchangeRateResult>`

Busca a cotação ao vivo via **Frankfurter API** (gratuita, sem API key, atualizada pelo BCE).

```
GET https://api.frankfurter.app/latest?from=EUR&to=BRL
```

- Cache de **1 hora** via `next: { revalidate: 3600 }`
- **Fallback:** `5.85 BRL/EUR` se a API falhar
- Retorna `{ rate, date, source: 'live' | 'fallback' }`

#### `brlToEur(brl, rate): number`
Converte BRL para EUR. Arredondado a 2 casas decimais.

#### `eurToBrl(eur, rate): number`
Converte EUR para BRL. Arredondado a 2 casas decimais.

---

## 5. Componentes — `src/components/`

### 5.1 `StepIndicator`

**Props:** `{ step: Step }`

Exibe o progresso entre as duas etapas do fluxo.

- **Etapa 1 ativa:** círculo `1` preto
- **Etapa 1 concluída:** círculo `✓` preto + linha conectora em `#998a72`
- **Etapa 2 ativa:** círculo `2` preto
- **Etapa 2 futura:** círculo `2` com borda cinza

---

### 5.2 `VisaTypeTabs`

**Props:** `{ active: VisaType, onChange: (v: VisaType) => void }`

Abas de seleção do tipo de visto na Etapa 2. Exibe os 5 vistos em ordem numérica: D1 · D2 · D4 · D7 · D8. A aba ativa tem `bg-[#1A1A1A] text-white`. Scroll horizontal automático no mobile.

---

### 5.3 `ScreeningPanel`

**Props:** `{ answers: ScreeningAnswers, onChange, onNext }`

Painel esquerdo da Etapa 1. Contém 3 blocos de perguntas com chips interativos.

**Perguntas e opções:**

1. **Qual seu objetivo em Portugal?**
   - Trabalhar presencialmente para uma empresa portuguesa → `presencial`
   - Trabalhar remotamente para empresa fora de Portugal → `remoto`
   - Empreender / abrir empresa / ser autônomo → `empreender`
   - Viver de renda passiva (aposentadoria, aluguéis, dividendos) → `renda_passiva`
   - Estudar (Graduação, Mestrado e Doutorado) → `estudar`

2. **Qual sua situação profissional?**
   - Empregado (CLT ou equivalente) → `empregado`
   - Freelancer / prestador de serviços independente → `freelancer`
   - Empresário / sócio de empresa → `empresario`
   - Aposentado / pensionista → `aposentado`
   - Investidor / vivo de renda → `investidor`
   - Estudante → `estudante`

3. **Quem vem com você?**
   - Vou sozinho → `sozinho`
   - Cônjuge / Parceiro → `conjuge`
   - Cônjuge e Filhos → `conjuge_filhos`
   - Só com Filhos → `filhos`

**Comportamento:**
- Chips são radio (seleção única por pergunta)
- Botão "Próxima Etapa →" desabilitado até as 3 respostas estarem preenchidas
- Sem estado interno — tudo controlado pelo pai via `onChange`

---

### 5.4 `InputPanel`

**Props:**
```typescript
{
  input: CalculatorInput
  onChange: (input: CalculatorInput) => void
  exchangeRate: number
  incomeBRL: number
  onIncomeBRLChange: (brl: number) => void
  savingsBRL: number
  savingsEUR: number
  savingsCurrency: 'BRL' | 'EUR' | null
  onSavingsBRLChange: (brl: number) => void
  onSavingsEURChange: (eur: number) => void
}
```

Painel esquerdo da Etapa 2. Contém todos os inputs da calculadora.

**Seções:**

1. **Renda mensal comprovável**
   - Input BRL com conversão automática para EUR exibida em tempo real
   - Cotação ao vivo com indicador de fonte

2. **Poupança em conta PT**
   - Dois campos lado a lado: BRL e EUR
   - Exclusão mútua: preencher um desabilita o outro (opacity 40%)
   - Conversão automática exibida abaixo do campo preenchido

3. **Dados do D2 (condicional)**
   - Campo "Capital alocado à empresa (€)" — visível apenas quando `visaType === 'D2'`

4. **Agregado Familiar**
   - Delega ao `FamilyBuilder`

---

### 5.5 `FamilyBuilder`

**Props:** `{ family: FamilyComposition, onChange: (family) => void }`

Chips interativos para montar o agregado familiar.

- **Titular:** sempre presente, não removível, badge "Você"
- **Cônjuge:** botão "+ Cônjuge" vira chip com ×. Máximo 1.
- **Filhos:** botão "+ Filho" adiciona chips ilimitados, cada um com ×
- **Dep. Adulto:** botão "+ Dep. Adulto" adiciona chips ilimitados, cada um com ×

Sem estado interno — todo controlado via `onChange`.

---

### 5.6 `CompatibilityBadge`

**Props:** `{ score: number }`

Card escuro (`#1A1914`) que exibe o resultado de compatibilidade com gráfico de onda decorativo em `#998a72`.

**Tiers de score:**

| Score | Badge exibido |
|---|---|
| 99 | **"Perfil Altamente Compatível"** |
| 90–98 | "Compatibilidade Alta" |
| 75–89 | "Compatibilidade Moderada" |
| 0–74 | "Compatibilidade Baixa" |

**Nota estratégica:** o score nunca chega a 100% — máximo é 99% — para incentivar o usuário a buscar a assessoria e descobrir "o que falta".

**Elementos visuais:**
- Label "RESULTADO EM TEMPO REAL" em caps muito muted
- Badge "Resultado" com borda fina
- Título grande bold branco
- Gráfico de onda financeiro (SVG) em `#998a72` com gradient de fade, pontos nos picos

---

### 5.7 `VisaCompatibilityCards`

**Props:** `{ scores: VisaScore[], step: 1 | 2, activeVisaId?: VisaTypeId }`

Exibe os 3 vistos mais compatíveis com barras de progresso.

**Comportamento por etapa:**

- **Etapa 1:** exibe 3 cards brancos com barras. Barras atualizam ao vivo conforme o usuário responde o rastreio.
- **Etapa 2:** exibe um card dark especial "Melhor Compatibilidade" no topo com **circular progress** em `#998a72`, seguido pelos 3 cards brancos com barras.

**Card circular (Etapa 2):**
- Background `#1A1914`
- Label "MELHOR COMPATIBILIDADE" em `#998a72`
- Título do visto bold branco
- Descrição legível (`rgba(255,255,255,0.65)`)
- SVG circular: r=32, stroke=7px, cor `#998a72`, percentual 18px bold

**Barras:** cor uniforme `#998a72` em todos os cards — sem código de cores por score.

**Animação:** card featured usa `framer-motion` com fade + scale suave ao montar.

---

### 5.8 `ResultPanel`

**Props:** `{ result: CalculatorResult, input: CalculatorInput, topVisaScore: number, onRequestReport: () => void }`

Painel direito da Etapa 2. Exibe todos os resultados da calculadora.

**Estrutura:**
1. Label "RESULTADO EM TEMPO REAL"
2. `CompatibilityBadge` com `topVisaScore`
3. Grid 2 colunas: "Renda exigida" e "Poupança exigida"
4. Card com `ProgressBar` para renda e poupança (cor `#998a72`)
5. `AlertCard` para cada alerta gerado pela calculadora
6. Botão CTA: **"Receber Relatório Preliminar em PDF (Para mandar para Assessoria Jurídica)"** — cor `#998a72`, sem animações
7. Disclaimer legal

---

### 5.9 `ProgressBar`

**Props:** `{ label, sublabel?, percent, status: CriterionStatus }`

Barra de progresso com label e percentual.

- Preenchimento: `#998a72` para todos os status (pass, warning, fail)
- `waived`: preenchimento `#DCDCDC` + texto "Dispensado"
- Percentual exibido sem código de cor

---

### 5.10 `AlertCard`

**Props:** `{ type: AlertType, title, message }`

Card de alerta contextual.

- Background `#F9F6F2`, borda `#EAE1D6`
- Ícone `!` quadrado preto à esquerda
- Título bold + mensagem em texto normal
- Sem diferenciação visual por tipo (info/warning/error) — todos iguais no estilo atual

---

### 5.11 `EmailModal`

**Props:** `{ onConfirm: (name, email) => void, onClose: () => void }`

Modal de coleta de dados antes de gerar o relatório.

**Campos:**
- "Seu nome completo" — obrigatório
- "Seu melhor email" — obrigatório, validado com regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

**Validação on-blur** — erros aparecem ao sair do campo, não ao digitar.

**Erros exibidos:**
- "Nome obrigatório"
- "Email inválido"

Ao confirmar com dados válidos, chama `onConfirm(name, email)`.

**Nota:** na versão atual (Sub-projeto 1), os dados são coletados mas não enviados. O envio via webhook n8n será implementado no Sub-projeto 2.

---

### 5.12 `LoadingOverlay`

**Props:** `{ onClose: () => void }`

Tela de loading em 3 fases após o usuário confirmar o email.

| Fase | Tempo | Conteúdo |
|---|---|---|
| `loading` | 0–3s | Spinner animado + "Preparando seu relatório preliminar..." |
| `done` | 3s+ | ✓ Check + "Relatório Preliminar enviado por email!" + Card de upsell |
| `closeable` | 5s+ | Botão "Fechar e voltar à calculadora" aparece |

**Card de upsell:**
- Título: "Se você quer saber quanto vai gastar mensalmente morando em Portugal"
- Preço: ~~R$ 37,00~~ → R$ 12,00 para quem vem pela Calculadora
- CTA: "Quero acessar por R$ 12 →" (link para LP do workshop — a ser configurado)

---

### 5.13 `PdfDocument`

**Props:** `{ input: CalculatorInput, result: CalculatorResult, generatedAt: string }`

Documento PDF gerado com `@react-pdf/renderer`. Estrutura em A4, PT-BR.

**Seções do PDF:**
1. **Cabeçalho:** "Relatório de Elegibilidade Migratória" + data de geração + referência RMMG 2026
2. **Resultado:** status em destaque (ELEGÍVEL / PARCIALMENTE / NÃO ELEGÍVEL)
3. **Perfil do Requerente:** tipo de visto, composição familiar, CPLP, modo conservador
4. **Critérios Financeiros:** tabela com Critério | Exigido | Informado | Atingimento
5. **Observações:** alertas contextuais em caixas amarelas
6. **Rodapé legal:** referências à Portaria n.º 1563/2007 e Decreto-Lei n.º 139/2025

---

### 5.14 `DownloadPdfButton`

**Props:** `{ input: CalculatorInput, result: CalculatorResult }`

Wrapper client-only para `PDFDownloadLink` do `@react-pdf/renderer`.

- Importado via `dynamic(() => Promise.resolve(Button), { ssr: false })` para evitar erros de SSR
- Nome do arquivo gerado: `elegibilidade-{tipo}-{data}.pdf`
- Texto do botão: "Gerando PDF..." enquanto processa, depois o texto normal

---

### 5.15 `StatusBadge`

**Props:** `{ status: EligibilityStatus }`

Badge legado (criado na versão inicial). Atualmente substituído pelo `CompatibilityBadge` no `ResultPanel`. Mantido no codebase mas não usado diretamente na interface principal.

---

## 6. Página Principal — `src/app/page.tsx`

Componente raiz. Contém **todo o estado da aplicação** e orquestra a comunicação entre componentes.

### Estado gerenciado

```typescript
// Navegação
step: Step                          // 1 | 2
screening: ScreeningAnswers         // respostas do rastreio

// Calculadora
input: CalculatorInput              // dados do formulário
exchangeRate: number                // cotação EUR/BRL ao vivo
incomeBRL: number                   // renda bruta em BRL
savingsBRL: number                  // poupança em BRL
savingsEUR: number                  // poupança em EUR
savingsCurrency: 'BRL'|'EUR'|null   // qual moeda o usuário preencheu

// Modal e overlay
showEmailModal: boolean
showLoading: boolean
```

### Valores derivados (computados a cada render)

```typescript
result        = calculate(input)                    // resultado financeiro
rawScores     = scoreVisas(screening)               // scores da etapa 1
scoredVisas   = step === 2                          // com ou sem bônus financeiro
                ? applyFinancialScore(rawScores, input.visaType, ...)
                : rawScores
top3          = getTop3Visas(scoredVisas)           // 3 vistos mais compatíveis
topVisaScore  = top3[0]?.score ?? 0                 // score do visto mais compatível
```

### Handlers principais

| Handler | O que faz |
|---|---|
| `handleIncomeBRLChange(brl)` | Converte BRL→EUR via taxa ao vivo e atualiza `input.monthlyIncome` |
| `handleSavingsBRLChange(brl)` | Converte BRL→EUR, trava campo EUR, atualiza `input.savingsInPortugal` |
| `handleSavingsEURChange(eur)` | Trava campo BRL, atualiza `input.savingsInPortugal` diretamente |
| `handleChange(updated)` | Atualiza input; reseta `conservativeMode` ao sair do D8 |
| `handleTabChange(visaType)` | Troca aba; reseta `conservativeMode` |
| `handleProceedToStep2()` | Determina o visto top → pré-preenche aba e família → avança etapa → scroll ao topo |
| `handleBackToStep1()` | Volta para a Etapa 1 |
| `handleRequestReport()` | Abre o EmailModal |
| `handleEmailConfirm(name, email)` | Fecha modal → abre LoadingOverlay (Sub-projeto 2: enviará ao n8n) |
| `handleLoadingClose()` | Fecha o overlay |

### Layout responsivo

- **Desktop (`md:`):** split panel — painel esquerdo + painel direito lado a lado
  - Etapa 1: perguntas `flex-1` (mais largo) + barras compat 260px fixos
  - Etapa 2: calculadora 360px fixos + resultados `flex-1`
- **Mobile (`md:hidden`):** coluna única empilhada
  - Etapa 1: ScreeningPanel → VisaCompatibilityCards
  - Etapa 2: InputPanel → ResultPanel → VisaCompatibilityCards

---

## 7. Sistema de Design

### Paleta de cores

| Token | Hex | Uso |
|---|---|---|
| `--bg` | `#F2F2F2` | Fundo da página |
| `--white` | `#FFFFFF` | Cards, painéis, nav |
| `--text` | `#1A1A1A` | Texto primário, chips selecionados, botões pretos |
| `--mid` | `#444444` | Texto médio |
| `--muted` | `#666666` | Labels, texto secundário |
| `--faint` | `#999999` | Texto muito sutil, hints |
| `--border` | `#E0E0E0` | Divisores e bordas |
| `--input-bg` | `#EFEFEF` | Fundo de inputs e chips não selecionados |
| Acento | `#998a72` | Barras de compat, circular progress, botão CTA, linha do step concluído |
| Card escuro | `#1A1914` | Cards de resultado e melhor compatibilidade |

### Tipografia

- **Fonte:** Inter (Google Fonts, subsets: `latin`)
- **Pesos:** 300, 400, 500, 600, 700, 800
- **Labels de seção:** `9px`, `font-black`, `tracking-[1.8px]`, uppercase
- **Perguntas do rastreio:** `17px`, `font-semibold`
- **Valores principais:** `20px`, `font-extrabold`
- **Título do resultado:** `26px`, `font-extrabold`

### Bordas e raios

- Cards principais: `rounded-3xl` (24px)
- Cards internos: `rounded-2xl` (16px)
- Cards menores: `rounded-xl` (12px)
- Chips/pills: `rounded-full` (99px)
- Botões: `rounded-2xl` (16px)

---

## 8. Regras de Negócio — Cálculos dos Vistos

### Base legal

- **RMMG 2026:** €920/mês (Decreto-Lei n.º 139/2025, vigência 01/01/2026)
- **Portaria n.º 1563/2007:** define os multiplicadores do agregado familiar
- **Lei n.º 23/2007 (Lei de Estrangeiros):** exige 12 meses de meios de subsistência

### Cálculo da renda mínima por visto

```
D1, D2, D4, D7:
  Renda = 920 + (cônjuges + dep.adultos) × 460 + filhos × 276

D8 (modo legal):
  Renda = max(3680, cálculo_D7_standard)

D8 (modo conservador):
  Renda = 3680 + (cônjuges + dep.adultos) × 1840 + filhos × 1104
```

### Cálculo da poupança mínima (todos os vistos)

```
Poupança = 11040 + (cônjuges + dep.adultos) × 5520 + filhos × 3312
```

### Nota sobre o D8 e a família

O multiplicador 4× do D8 já cobre a subsistência familiar em praticamente todos os casos reais. Apenas com 9+ filhos a renda familiar standard (modo legal) superaria €3.680. Esta foi uma correção de lógica implementada para refletir a realidade jurídica do visto.

---

## 9. Motor de Compatibilidade

### Scoring em 2 etapas

**Etapa 1 — Qualitativo (0–70%)**
- Base: 15 pts para todos os vistos
- Objetivo compatível: +50 pts
- Situação compatível: +35 pts (ou +20 pts para D8 com CLT)
- Cap: 70 pts

**Etapa 2 — Financeiro (+29% máximo)**
- Renda ≥ exigida: +20 pts
- Poupança ≥ exigida: +9 pts
- Total máximo: **99%**

### Padrão de defaults

Antes de qualquer resposta, os 3 vistos padrão são `D8, D7, D2` com score `0` — refletindo os vistos mais solicitados por brasileiros.

---

## 10. Câmbio BRL/EUR

A aplicação usa câmbio **ao vivo** do Banco Central Europeu via Frankfurter API:

```
GET https://api.frankfurter.app/latest?from=EUR&to=BRL
```

- **Cache:** 1 hora (Next.js `revalidate`)
- **Fallback:** `5.85 BRL/EUR` se API indisponível
- **Aplicação:** convertida no `useEffect` do `page.tsx` ao montar a aplicação

---

## 11. Geração de PDF

O PDF é gerado **100% client-side** usando `@react-pdf/renderer`. Não passa pelo servidor.

- O componente `DownloadPdfButton` é carregado dinamicamente (`ssr: false`) para evitar erros de servidor
- O botão exibe "Gerando PDF..." durante a renderização
- O arquivo é salvo como `elegibilidade-{tipo}-{YYYY-MM-DD}.pdf`
- Idioma: PT-BR com formatação `pt-BR` (vírgula decimal, ponto de milhar)

### Configuração `next.config.ts`

```typescript
webpack: (config) => {
  config.resolve.alias.canvas = false  // evita erro de canvas no browser
  return config
}
```

---

## 12. Integração futura — n8n Webhook (Sub-projeto 2)

A arquitetura já está preparada para receber a integração de email via n8n.

### O que será enviado

```json
{
  "email": "usuario@email.com",
  "nome": "Nome do Usuário",
  "vistoSelecionado": "D8",
  "respostasEtapa1": { "objetivo": "remoto", "situacao": "freelancer", "familia": "sozinho" },
  "resultadoCalculo": { "rendaExigida": 3680, "compatibilidade": 99 },
  "emailHtml": "<html>...mensagem personalizada...</html>",
  "pdfBase64": "JVBERi0xLjQ..."
}
```

### Workflow n8n (a configurar)

1. **Webhook** → recebe o payload
2. **Code node** → decodifica `pdfBase64` para arquivo binário
3. **Send Email** → envia com HTML personalizado + PDF em anexo

### Onde implementar no código

No `page.tsx`, função `handleEmailConfirm`:

```typescript
function handleEmailConfirm(name: string, email: string) {
  // IMPLEMENTAR: POST para process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL
  setShowEmailModal(false)
  setShowLoading(true)
}
```

---

## 13. Testes

**Framework:** Vitest 4.x + @testing-library/react

**Cobertura:** 109 testes em 16 arquivos

| Módulo/Componente | Testes | O que cobre |
|---|---|---|
| `calculator.test.ts` | 27 | Todas as fórmulas D1/D2/D4/D7/D8, alertas, edge cases |
| `compatibility.test.ts` | 20 | Scoring, bônus financeiro, top3, familyFromFamilia |
| `exchangeRate.test.ts` | 5 | Conversão BRL↔EUR, casos de borda (rate=0) |
| `AlertCard.test.tsx` | 3 | Renderização, bordas por tipo |
| `CompatibilityBadge.test.tsx` | 5 | Labels por tier de score |
| `EmailModal.test.tsx` | 5 | Campos, validação, submit, close |
| `FamilyBuilder.test.tsx` | 5 | Adicionar/remover membros, visibilidade dos botões |
| `InputPanel.test.tsx` | 6 | Labels, condicional D2, CPLP/conservador (removidos da UI) |
| `LoadingOverlay.test.tsx` | 5 | Fases de loading (fake timers) |
| `ProgressBar.test.tsx` | 2 | Renderização de label e % |
| `ResultPanel.test.tsx` | 8 | Badge por score, valores, disclaimer, botão CTA |
| `ScreeningPanel.test.tsx` | 6 | Labels, chips, botão guarded |
| `StatusBadge.test.tsx` | 3 | Labels por status |
| `StepIndicator.test.tsx` | 3 | Círculos por step |
| `VisaCompatibilityCards.test.tsx` | 4 | Labels, percentuais, borda ativa |
| `VisaTypeTabs.test.tsx` | 3 | Abas, onChange, classe active |

**Executar testes:**
```bash
npm run test        # watch mode
npm run test:run    # single run
```

---

## 14. Deploy e CI/CD

### Vercel

- **URL de produção:** https://calculadora-elegibilidade-pt.vercel.app
- **Organização Vercel:** `vma-s-projects`
- **Projeto:** `calculadora-elegibilidade-pt`
- **Branch de deploy:** `master`

### Fluxo de deploy

```
git push origin master
        ↓
Vercel detecta o push automaticamente
        ↓
Build: next build (TypeScript check + static generation)
        ↓
Deploy em ~2 minutos
```

**Deploy manual (quando necessário):**
```bash
vercel --prod
```

### Variáveis de ambiente a configurar (Sub-projeto 2)

```env
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://seu-n8n.cloud/webhook/xyz
```

---

*Documentação gerada em 2026-06-05. Para atualizações, editar este arquivo e commitar.*
