# Design: V2 — Rastreio de Perfil + Compatibilidade de Vistos

**Data:** 2026-06-02  
**Status:** Aprovado pelo usuário  
**Fase:** Sub-projeto 1 (Frontend only — email via n8n é Sub-projeto 2)

---

## 1. Visão Geral

Adicionar uma Etapa 1 de rastreio de perfil antes da calculadora existente. O app passa a ter duas etapas sequenciais com um motor de compatibilidade que mostra os 3 vistos mais próximos do perfil do usuário com barras de progresso ao vivo.

---

## 2. Vistos Suportados

| Visto | Nome | Perfil |
|---|---|---|
| D1 | Trabalho Subordinado | Empregado com contrato em empresa portuguesa |
| D2 | Empreendedor | Empresário, autônomo, freelancer |
| D4 | Estudante | Graduação, Mestrado, Doutorado |
| D7 | Renda Passiva | Aposentado, pensionista, investidor, dividendos |
| D8 | Nômade Digital | Trabalho remoto para empresa fora de Portugal |

---

## 3. Arquitetura de Navegação

- **Página única** com estado de etapa (`step: 1 | 2`)
- Sem mudança de URL
- Indicador de etapa no topo (abaixo do nav):
  - Etapa ativa: círculo preto preenchido
  - Etapa concluída: círculo preto com check
  - Etapa futura: círculo cinza outline
  - Labels: `1 · Perfil do Visto` e `2 · Análise de Renda`
- Botão "Próxima Etapa →" só ativa quando as 3 perguntas da Etapa 1 estão respondidas
- Botão "← Voltar" na Etapa 2 para retornar à Etapa 1

---

## 4. Etapa 1 — Rastreio de Perfil

### 4.1 Layout
- **Painel esquerdo:** 3 blocos de perguntas com chips interativos
- **Painel direito:** 3 cards de compatibilidade de vistos (atualiza ao vivo)

### 4.2 Perguntas e Opções

**Pergunta 1 — Qual seu objetivo em Portugal?** (seleção única)
- Trabalhar presencialmente para uma empresa portuguesa
- Trabalhar remotamente para empresa fora de Portugal
- Empreender / abrir empresa / ser autônomo
- Viver de renda passiva (aposentadoria, aluguéis, dividendos)
- Estudar (Graduação, Mestrado e Doutorado)

**Pergunta 2 — Qual sua situação profissional?** (seleção única)
- Empregado (CLT ou equivalente)
- Freelancer / prestador de serviços independente
- Empresário / sócio de empresa
- Aposentado / pensionista
- Investidor / vivo de renda
- Estudante

**Pergunta 3 — Quem vem com você?** (seleção única)
- Vou sozinho
- Cônjuge / Parceiro
- Cônjuge e Filhos
- Só com Filhos

### 4.3 UI dos Chips
- Mesmo padrão visual do FamilyBuilder: pills clicáveis
- Selecionado: `bg-[#1A1A1A] text-white`
- Não selecionado: `bg-[#F4F2EE] text-[#555] border border-dashed border-[#CCC]`
- Clicar num chip deseleciona o anterior da mesma pergunta (radio behavior)
- Sem emojis

---

## 5. Motor de Compatibilidade

### 5.1 Scoring — Etapa 1 (qualitativo, máximo 70%)

```
Pontuação por visto:
  objetivo_match:  +50 pts
  situacao_match:  +35 pts
  familia_bonus:   +15 pts (base para todos os vistos)
  max Etapa 1:      70 pts = 70%
```

**Matriz objetivo × visto:**
| Objetivo | D1 | D2 | D4 | D7 | D8 |
|---|---|---|---|---|---|
| Trabalho presencial | ✓ | — | — | — | — |
| Trabalho remoto | — | — | — | — | ✓ |
| Empreender / autônomo | — | ✓ | — | — | — |
| Renda passiva | — | — | — | ✓ | — |
| Estudar | — | — | ✓ | — | — |

**Matriz situação × visto:**
| Situação | D1 | D2 | D4 | D7 | D8 |
|---|---|---|---|---|---|
| Empregado CLT | ✓ | — | — | — | ✓ (parcial) |
| Freelancer / autônomo | — | ✓ | — | — | ✓ |
| Empresário / sócio | — | ✓ | — | — | — |
| Aposentado / pensionista | — | — | — | ✓ | — |
| Investidor / vivo de renda | — | — | — | ✓ | — |
| Estudante | — | — | ✓ | — | — |

**Nota sobre D8 e CLT:** Empregado CLT com objetivo "trabalho remoto" recebe pontuação completa no D8. CLT sem objetivo remoto não pontua no D8.

### 5.2 Scoring — Etapa 2 (financeiro, +29% máximo)

```
Renda ≥ exigida:    +20 pts
Poupança ≥ exigida: +9 pts
max total:          99 pts = 99% (nunca 100%)
```

### 5.3 Exibição dos 3 Vistos

- Ordena todos os 5 vistos por score decrescente
- Exibe os 3 com maior score
- Se score = 0 para todos: mostra D7, D8, D2 como padrão (os mais comuns)
- Na Etapa 2: o visto mais compatível com a Etapa 1 é pré-selecionado na aba de vistos

### 5.4 Cores das Barras de Compatibilidade
- 0–39%: `#8B2E2E` (vermelho escuro)
- 40–74%: `#8B6A1A` (âmbar escuro)
- 75–99%: `#2E6B3E` (verde escuro)

---

## 6. Cards de Compatibilidade no Painel Direito

```
┌─────────────────────────────────────┐
│ D8 — Nômade Digital         72%    │
│ ████████████████░░░░░░░░           │
│ Trabalho remoto para o exterior    │
└─────────────────────────────────────┘
```

- Cada card: nome do visto + percentual + barra + descrição curta (1 linha)
- Na Etapa 2: visto com maior score tem borda mais escura (`border-[#1A1A1A]`)
- Os outros dois ficam em `border-[#E8E5E0]`

---

## 7. Etapa 2 — Análise de Renda (calculadora existente, atualizada)

### 7.1 Remoções
- Toggle "Termo de Responsabilidade CPLP" removido
- Toggle "Modo Conservador" removido
- Emojis removidos do mobile (flags 🇧🇷 🇪🇺 mantidas — indicam moeda)

### 7.2 Painel direito na Etapa 2
- Parte superior: 3 cards de compatibilidade (agora com score financeiro incluído)
- Parte inferior: resultados da calculadora (valores exigidos, barras de renda/poupança, alertas)

### 7.3 Badge de resultado
- Score < 75%: "Compatibilidade Baixa"
- Score 75–89%: "Compatibilidade Moderada"
- Score 90–98%: "Compatibilidade Alta"
- Score = 99%: **"Perfil Altamente Compatível"** (sem asterisco, sem disclaimer)

### 7.4 Campo de email
- Aparece abaixo dos alertas, acima do botão
- Label: "Seu email para receber o relatório"
- Placeholder: "seu@email.com"
- Campo de nome: "Seu nome completo"

### 7.5 Botão de PDF
- Texto: "Receber Relatório Preliminar em PDF (Para mandar para Assessoria Jurídica)"

---

## 8. Modal de Email

Abre ao clicar no botão de relatório:

- Campo: "Seu nome completo"
- Campo: "Seu melhor email"
- Botão: "Receber meu relatório →"
- Botão fechar (×) no canto superior
- Validação: ambos os campos obrigatórios, email com formato válido
- Ao confirmar: fecha o modal, inicia loading screen

---

## 9. Tela de Loading + Upsell do Workshop

**Fase 1 — Loading (0 a 1,5s):**
- Overlay branco sobre o app
- Spinner sóbrio centralizado
- Texto: "Preparando seu relatório preliminar..."

**Fase 2 — Upsell (após 1,5s):**
- Loading persiste acima
- Card de upsell aparece abaixo com transição suave:

```
Se você quer saber quanto vai gastar
mensalmente morando em Portugal

Simule seus gastos mensais por região
de acordo com o seu perfil de vida.

~~R$ 37,00~~  →  R$ 12,00
para quem vem pela Calculadora

[ Quero acessar por R$ 12 →  ]   ← sem link (href="#")
```

**Fase 3 — Botão de fechar (após 4s):**
- "Fechar e voltar à calculadora" aparece
- Clicar fecha o overlay e retorna ao app normalmente
- *Nota: na Fase 1 do produto, o email é coletado mas não enviado ainda (Sub-projeto 2)*

---

## 10. Disclaimer

Texto pequeno (`text-[10px] text-[#AAA]`) no rodapé do painel direito em ambas as etapas:

> *Esta calculadora é uma ferramenta informativa e não substitui uma consulta jurídica. Mesmo com alta compatibilidade, detalhes do seu perfil só podem ser avaliados por um profissional.*

---

## 11. Novos Arquivos e Modificações

| Arquivo | Ação | Responsabilidade |
|---|---|---|
| `src/lib/compatibility.ts` | Criar | Motor de scoring de vistos |
| `src/lib/types.ts` | Modificar | Novos tipos: ScreeningAnswers, VisaScore, Step |
| `src/components/StepIndicator.tsx` | Criar | Indicador de etapa no topo |
| `src/components/ScreeningPanel.tsx` | Criar | Painel esquerdo da Etapa 1 (3 blocos de chips) |
| `src/components/VisaCompatibilityCards.tsx` | Criar | Painel direito com 3 cards de compatibilidade |
| `src/components/EmailModal.tsx` | Criar | Modal de nome + email |
| `src/components/LoadingOverlay.tsx` | Criar | Loading screen + upsell |
| `src/components/InputPanel.tsx` | Modificar | Remover CPLP e Modo Conservador |
| `src/components/ResultPanel.tsx` | Modificar | Novo badge, campo email, novo botão, disclaimer |
| `src/app/page.tsx` | Modificar | Estado de etapa, orquestração do fluxo completo |

---

## 12. Critérios de Sucesso

- [ ] Etapa 1 exibe 3 perguntas com chips interativos
- [ ] Barras de compatibilidade atualizam ao vivo conforme respostas
- [ ] Botão "Próxima Etapa" só ativa com 3 perguntas respondidas
- [ ] Etapa 2 pré-seleciona o visto mais compatível do perfil
- [ ] Score máximo é 99%, nunca 100%
- [ ] Badge "Perfil Altamente Compatível" aparece apenas a 99%
- [ ] Modal de email valida nome + email antes de prosseguir
- [ ] Loading screen exibe upsell após 1,5s
- [ ] Botão de fechar aparece após 4s
- [ ] Disclaimer aparece nas duas etapas
- [ ] Sem Modo Conservador e sem Termo CPLP na Etapa 2
- [ ] Design idêntico ao existente (B&W, #EDEBE7, Inter)
