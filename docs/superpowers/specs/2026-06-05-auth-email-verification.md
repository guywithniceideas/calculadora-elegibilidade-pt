# Design: Sistema de Login por Verificação de Email

**Data:** 2026-06-05  
**Status:** Aprovado  
**Dependências:** Resend (API key configurada), `jose` (JWT), variáveis de ambiente configuradas

---

## 1. Visão Geral

Adicionar um gate de autenticação via OTP por email que bloqueia o acesso ao app até o usuário verificar seu email. O EmailModal existente é removido — o email e nome já são conhecidos pela sessão.

---

## 2. Fluxo Completo

```
Abre o app
  ├── Tem Session JWT válido no cookie?
  │     Sim → App carrega (name + email disponíveis)
  │     Não → EmailVerificationGate renderiza
  │             ├── Passo 1: nome + email → POST /api/auth/send-code
  │             │   → Resend envia código de 6 dígitos
  │             └── Passo 2: código → POST /api/auth/verify-code
  │                 → Session JWT criado → App carrega

Clica em "Receber Relatório Preliminar"
  → LoadingOverlay direto (sem modal)
  → Email/nome da sessão usados no Sub-projeto 2 (n8n)
```

---

## 3. Rotas API

### `POST /api/auth/send-code`

**Body:** `{ name: string, email: string }`

**Processo:**
1. Valida email (regex) e nome (não vazio)
2. Gera código de 6 dígitos aleatório: `crypto.randomInt(100000, 999999).toString()`
3. Hash do código: `sha256(code + AUTH_SECRET)`
4. Cria OTP JWT com `jose`:
   ```json
   { "name": "João", "email": "joao@email.com", "codeHash": "...", "attempts": 0 }
   ```
   Expiração: 10 minutos. Assinado com `AUTH_SECRET`.
5. Define cookie `otp_token` (httpOnly, secure, sameSite=lax, 10 min)
6. Envia email via Resend com código limpo
7. Retorna `{ success: true }`

**Email enviado (HTML):**
```
Assunto: Seu código de acesso — Calculadora de Elegibilidade PT

Olá, {name}!

Seu código de verificação é:

    {code}

Válido por 10 minutos.
```

---

### `POST /api/auth/verify-code`

**Body:** `{ code: string }`

**Processo:**
1. Lê e verifica OTP JWT do cookie `otp_token`
2. Se expirado → `{ error: 'expired' }`
3. Hash do código enviado: `sha256(code + AUTH_SECRET)`
4. Compara com `codeHash` do JWT
5. Se incorreto:
   - Incrementa `attempts` no JWT (re-assina e re-seta cookie)
   - Se `attempts >= 3` → destroi cookie OTP → `{ error: 'max_attempts' }`
   - Senão → `{ error: 'invalid', attemptsLeft: 3 - attempts }`
6. Se correto:
   - Destroi cookie `otp_token`
   - Cria Session JWT: `{ name, email }`, expiração 7 dias
   - Define cookie `session_token` (httpOnly, secure, sameSite=lax, 7 dias)
   - Retorna `{ success: true, name, email }`

---

### `GET /api/auth/me`

**Processo:**
1. Lê e verifica Session JWT do cookie `session_token`
2. Se válido → `200 { name, email }`
3. Se inválido/expirado → `401 { error: 'unauthenticated' }`

---

### `POST /api/auth/logout`

**Processo:**
1. Limpa cookie `session_token` (maxAge=0)
2. Retorna `{ success: true }`

---

## 4. Componente `EmailVerificationGate`

**Props:** `{ onVerified: (name: string, email: string) => void }`

**Estado interno:**
```typescript
step: 'email' | 'code'
name: string
email: string
loading: boolean
error: string | null
resendCooldown: number  // segundos restantes para reenvio
```

### Passo 1 — Formulário de nome e email

- Campo "Seu nome completo" (obrigatório)
- Campo "Seu email" (obrigatório, validado)
- Botão "Enviar código →" (desabilitado durante loading)
- Ao submeter: `POST /api/auth/send-code` → avança para step `'code'`

### Passo 2 — Input do código

- Saudação: "Olá, {name}! Código enviado para {email}"
- Link "← Trocar email" → volta para step `'email'`
- 6 inputs individuais (1 dígito cada), foco automático no próximo ao digitar
- Botão "Verificar e acessar →"
- Ao submeter: `POST /api/auth/verify-code` → chama `onVerified(name, email)`
- Erros exibidos abaixo do input de código
- "Não recebeu? Reenviar código" com cooldown de 30s

**Erros mapeados:**

| Código de erro da API | Mensagem exibida |
|---|---|
| `invalid` | `Código incorreto. {X} tentativa(s) restante(s).` |
| `expired` | `Código expirado. Solicite um novo.` → volta ao Passo 1 |
| `max_attempts` | `Muitas tentativas. Solicite um novo código.` → volta ao Passo 1 |

### Visual

Mesma paleta do app (fundo `#F2F2F2`, cards brancos, Inter). Centralizado na tela. Logo `pt-flag.png` + nome do app no topo. Botões em `#1A1A1A`.

---

## 5. Mudanças em `layout.tsx` / `page.tsx`

### `layout.tsx`
Sem mudança.

### `page.tsx`

**Novo estado:**
```typescript
const [authState, setAuthState] = useState<
  'loading' | 'unauthenticated' | 'authenticated'
>('loading')
const [userName, setUserName] = useState('')
const [userEmail, setUserEmail] = useState('')
```

**useEffect ao montar:**
```typescript
useEffect(() => {
  fetch('/api/auth/me')
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(({ name, email }) => {
      setUserName(name)
      setUserEmail(email)
      setAuthState('authenticated')
    })
    .catch(() => setAuthState('unauthenticated'))
}, [])
```

**Render condicional:**
```typescript
if (authState === 'loading') return <LoadingSpinner />
if (authState === 'unauthenticated') return (
  <EmailVerificationGate onVerified={(name, email) => {
    setUserName(name)
    setUserEmail(email)
    setAuthState('authenticated')
  }} />
)
// App normal...
```

**Mudanças no botão de PDF:**
- Remove `showEmailModal` e `handleRequestReport` que abria o modal
- Botão chama `handleRequestReport` que agora vai direto para `setShowLoading(true)`
- `userName` e `userEmail` disponíveis para passar ao LoadingOverlay / Sub-projeto 2

---

## 6. O que é Removido

- `src/components/EmailModal.tsx` — substituído pelo gate
- `src/components/__tests__/EmailModal.test.tsx` — removido junto
- State `showEmailModal` em `page.tsx`
- Prop `onRequestReport` em `ResultPanel` é mantida mas simplificada

---

## 7. Dependências a instalar

```bash
npm install resend jose
```

- **`resend`** — SDK oficial para envio de email
- **`jose`** — Biblioteca JWT que funciona em Edge Runtime e Node.js (já suportado pela Vercel)

---

## 8. Variáveis de ambiente

| Variável | Descrição | Onde está |
|---|---|---|
| `RESEND_API_KEY` | Key da conta Resend | `.env.local` + Vercel |
| `AUTH_SECRET` | String aleatória 64 chars para assinar JWTs | `.env.local` + Vercel |
| `AUTH_EMAIL_FROM` | Email remetente verificado no Resend | `.env.local` + Vercel |

---

## 9. Arquivos novos/modificados

| Arquivo | Ação |
|---|---|
| `src/app/api/auth/send-code/route.ts` | Criar |
| `src/app/api/auth/verify-code/route.ts` | Criar |
| `src/app/api/auth/me/route.ts` | Criar |
| `src/app/api/auth/logout/route.ts` | Criar |
| `src/components/EmailVerificationGate.tsx` | Criar |
| `src/app/page.tsx` | Modificar — auth state + conditional render |
| `src/components/EmailModal.tsx` | Deletar |
| `src/components/__tests__/EmailModal.test.tsx` | Deletar |
| `src/components/ResultPanel.tsx` | Simplificar botão CTA |

---

## 10. Critérios de Sucesso

- [ ] App exige verificação de email ao abrir
- [ ] Cookie de sessão persiste 7 dias
- [ ] Código de 6 dígitos é enviado por email via Resend
- [ ] Código expira em 10 minutos
- [ ] Máximo 3 tentativas incorretas antes de exigir novo código
- [ ] Nome e email disponíveis na sessão para uso no PDF/email
- [ ] Botão de PDF vai direto para loading (sem modal)
- [ ] `pt-flag.png` usado no gate (sem emoji)
- [ ] Funciona em mobile e desktop
