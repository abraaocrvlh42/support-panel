# 🎫 Painel de Chamados de Suporte

Interface interna para gestão de chamados de suporte para pequenos comércios.

| Camada | Stack |
|---|---|
| **Frontend** | React 18 · Vite · TypeScript · CSS Modules |
| **Backend**  | Node.js · Express · TypeScript · PostgreSQL |

🔗 **Demo:** https://support-panel-sigma.vercel.app
🔗 **API:** https://support-panel-m470.onrender.com

---

## 📋 Índice

- [Visão geral](#-visão-geral)
- [Estrutura do repositório](#-estrutura-do-repositório)
- [Como criar o projeto do zero com Vite](#-como-criar-o-projeto-do-zero-com-vite)
- [Como rodar localmente](#-como-rodar-localmente)
- [Variáveis de ambiente](#-variáveis-de-ambiente)
- [Endpoints da API](#-endpoints-da-api)
- [Estrutura de pastas](#-estrutura-de-pastas)
- [Arquitetura](#-arquitetura)
- [Funcionalidades](#-funcionalidades)
- [Stack](#-stack)
- [Deploy](#-deploy)

---

## 🖥 Visão geral

O painel permite que times internos de suporte:

- Visualizem todos os chamados abertos, em andamento e resolvidos
- Criem novos chamados com título, cliente, descrição e prioridade
- Atualizem o status de qualquer chamado diretamente pela interface
- Deletem chamados existentes
- Filtrem por status e busquem por título ou nome do cliente

A aplicação tem **dois modos de operação**:

| Modo | Quando usar | Persistência |
|---|---|---|
| **Mock** | Desenvolvimento de UI sem backend | Em memória (reseta ao recarregar) |
| **API**  | Uso completo com dados reais | PostgreSQL |

---

## 📁 Estrutura do repositório

```
support-panel/
├── README.md
├── DECISOES.md
├── .gitignore
├── front-end/    # React + Vite + TypeScript
└── back-end/     # Node.js + Express + TypeScript + PostgreSQL
```

---

## 🚀 Como criar o projeto do zero com Vite

```bash
npm create vite@latest front-end -- --template react-ts
cd front-end
npm install
npm run dev
```

> A flag `--template react-ts` configura React + TypeScript automaticamente.

---

## ▶️ Como rodar localmente

### Pré-requisitos

- **Node.js 18+** → [nodejs.org](https://nodejs.org)
- **npm** (já incluído no Node.js)
- **PostgreSQL** instalado localmente (apenas para o modo API)

---

### Modo mock (só frontend)

Ideal para trabalhar na UI sem precisar do backend.

```bash
cd front-end
npm install
npm run dev
```

Acesse **http://localhost:5173**

> Os dados são simulados em memória com delay artificial. Resetam ao recarregar — comportamento esperado nesse modo.

---

### Modo API (frontend + backend)

**Terminal 1 — Backend:**

```bash
cd back-end
npm install
npm run dev
```

Confirme em `http://localhost:3000/health`:
```json
{ "status": "ok", "timestamp": "..." }
```

**Terminal 2 — Frontend:**

```bash
cd front-end
npm install
npm run dev
```

Acesse **http://localhost:5173**

---

### Scripts disponíveis

**Frontend:**

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento com HMR |
| `npm run build` | Build de produção em `/dist` |
| `npm run preview` | Visualiza o build localmente |

**Backend:**

| Comando | O que faz |
|---|---|
| `npm run dev` | Desenvolvimento com hot-reload (`tsx watch`) |
| `npm run build` | Compila TypeScript → `dist/` |
| `npm start` | Roda o build compilado |

---

## 🔑 Variáveis de ambiente

### Backend — `back-end/.env`

```env
DATABASE_URL=postgresql://user:senha@localhost:5432/support_panel
FRONTEND_URL=http://localhost:5173
PORT=3000
```

### Frontend — `front-end/.env`

```env
VITE_API_URL=http://localhost:3000
```

> Sem o `.env` no frontend, o app roda automaticamente em modo mock.

---

## 📡 Endpoints da API

Base URL: `http://localhost:3000`

### `GET /tickets`

Retorna todos os chamados ordenados por data de criação (mais recente primeiro).

**Response `200`:**
```json
[
  {
    "id": "001",
    "title": "Sistema de PDV travando na abertura",
    "client": "Mercearia São João",
    "description": "O sistema trava toda vez que tentamos abrir caixa.",
    "status": "open",
    "priority": "high",
    "createdAt": "2025-03-04T08:30:00Z"
  }
]
```

---

### `POST /tickets`

Cria um novo chamado. Status inicial é sempre `open`.

**Body:**
```json
{
  "title": "Título do problema",
  "client": "Nome do cliente",
  "description": "Descrição detalhada",
  "priority": "low" | "medium" | "high"
}
```

**Response `201`:** chamado criado completo.

**Response `400`:**
```json
{
  "error": "Dados inválidos.",
  "fields": { "title": "Título é obrigatório." }
}
```

---

### `PATCH /tickets/:id/status`

Atualiza o status de um chamado.

**Body:**
```json
{ "status": "open" | "in_progress" | "resolved" }
```

**Response `200`:** chamado atualizado completo.

**Response `404`:**
```json
{ "error": "Chamado #999 não encontrado." }
```

---

### `DELETE /tickets/:id`

Deleta um chamado permanentemente.

**Response `204`:** sem corpo.

**Response `404`:**
```json
{ "error": "Chamado #999 não encontrado." }
```

---

### `GET /health`

**Response `200`:**
```json
{ "status": "ok", "timestamp": "2025-03-04T10:00:00.000Z" }
```

---

## 📁 Estrutura de pastas

### Frontend (`front-end/`)

```
front-end/
├── index.html
├── vite.config.ts                  # Alias @/ → src/
├── tsconfig.app.json
├── .env                            # VITE_API_URL (criar manualmente)
└── src/
    ├── main.tsx                    # Ponto de entrada React
    ├── App.tsx                     # Componente raiz
    ├── App.module.css
    ├── styles/
    │   └── global.css              # Design tokens (CSS variables) e reset
    ├── types/
    │   └── index.ts                # Ticket, TicketStatus, FilterState…
    ├── data/
    │   ├── mockTickets.ts          # Seed para o modo mock
    │   └── constants.ts            # Labels e opções de filtro
    ├── services/
    │   └── ticketService.ts        # Camada de dados — mock ou API real
    ├── hooks/
    │   ├── useTickets.ts           # Estado: fetch, create, update, delete
    │   └── useToast.ts             # Notificações toast
    ├── utils/
    │   └── date.ts                 # Formatação de data/hora
    └── components/
        ├── layout/
        │   └── AppHeader           # Cabeçalho com contadores por status
        ├── ui/                     # Componentes genéricos reutilizáveis
        │   ├── StatusBadge
        │   ├── PriorityBadge
        │   └── Toast
        └── tickets/                # Componentes do domínio
            ├── TicketFilters       # Busca + filtros + botão criar
            ├── TicketList          # Lista + estados (loading, vazio, erro)
            ├── TicketRow           # Linha com status e delete inline
            ├── TicketDetail        # Painel de detalhes
            ├── CreateTicketModal   # Modal de criação com validação
            └── ErrorBanner         # Banner de erro com retry
```

### Backend (`back-end/`)

```
back-end/
├── tsconfig.json
├── package.json
├── .env                            # DATABASE_URL, FRONTEND_URL, PORT
└── src/
    ├── server.ts                   # Express, middlewares, inicializa DB
    ├── types/
    │   └── index.ts                # Ticket, TicketStatus, TicketPriority…
    ├── db/
    │   └── database.ts             # Pool PostgreSQL, migration, seed, helpers
    ├── routes/
    │   └── tickets.ts              # GET, POST, PATCH, DELETE
    ├── controllers/
    │   └── ticketsController.ts    # Validação, lógica, queries SQL
    └── middlewares/
        └── errorHandler.ts         # Erros globais + 404
```

---

## 🏗 Arquitetura

### Camada de dados isolada no frontend

O `ticketService.ts` é a única parte do frontend que conhece a origem dos dados. Todos os componentes consomem sempre a mesma interface:

```ts
ticketService.getAll()
ticketService.create(payload)
ticketService.updateStatus(id, status)
ticketService.delete(id)
```

Internamente seleciona o adapter correto com base na variável de ambiente:

```
VITE_API_URL definida  →  apiAdapter  →  fetch() → Express → PostgreSQL
VITE_API_URL ausente   →  mockAdapter →  dados em memória
```

### Fluxo de dados

```
Componente React
      ↕  props / callbacks
useTickets (hook)
      ↕  chamadas async
ticketService
      ↕
  mockAdapter            apiAdapter
  (in-memory)            fetch() → Express → PostgreSQL
```

### Separação de camadas no backend

```
server.ts       →  Express, middlewares, inicializa DB antes de subir o servidor
routes/         →  define endpoints, delega para controllers
controllers/    →  validação de input, lógica de negócio, queries SQL ($1, $2…)
db/             →  pool de conexão singleton, migration, seed, helpers tipados
middlewares/    →  errorHandler global, 404
```

---

## ✅ Funcionalidades

| Feature | Detalhes |
|---|---|
| Listagem | id, título, cliente, status, prioridade, data de criação |
| Filtro por status | Todos / Aberto / Em andamento / Resolvido |
| Busca por texto | Título ou nome do cliente em tempo real |
| Criar chamado | Modal com validação dos campos obrigatórios |
| Atualizar status | Select inline por linha, persiste imediatamente |
| Deletar chamado | Botão na linha com confirmação, remove permanentemente |
| Painel de detalhes | Expande ao clicar em uma linha |
| Loading | Spinner animado durante requisições |
| Estado vazio | Mensagem contextual (sem dados vs. sem resultados) |
| Estado de erro | Banner com mensagem amigável + retry |
| Responsividade | Desktop: tabela · Mobile: cards empilhados |
| Toasts | Feedback ao criar, atualizar e deletar chamados |
| Acessibilidade | `aria-label`, `role`, `aria-live`, navegação por teclado |

---

## 🛠 Stack

| Tecnologia | Por quê |
|---|---|
| **React 18** | Requisito do desafio. Hooks modernos, sem class components |
| **Vite** | Build rápido, HMR nativo, TypeScript out-of-the-box |
| **TypeScript** | Tipagem estrita em todo o projeto — frontend e backend |
| **CSS Modules** | Escopo local, zero runtime, sem dependências de estilo |
| **IBM Plex Mono + Sans** | Estética industrial adequada a painel interno de suporte |
| **Express** | Minimalista, maduro, ótima tipagem com `@types/express` |
| **PostgreSQL + pg** | Banco relacional robusto, persistência real em produção |
| **tsx** | Executa TypeScript diretamente no dev, sem build intermediário |

---

## 🚀 Deploy

| Serviço | Plataforma | URL |
|---|---|---|
| Frontend | Vercel | https://support-panel-sigma.vercel.app |
| Backend | Render | https://support-panel-m470.onrender.com |
| Banco de dados | Render PostgreSQL | interno |

### Variáveis em produção

**Render (backend):**

| Key | Valor |
|---|---|
| `DATABASE_URL` | Internal Database URL do PostgreSQL no Render |
| `FRONTEND_URL` | URL do frontend no Vercel |
| `NODE_ENV` | `production` |

**Vercel (frontend):**

| Key | Valor |
|---|---|
| `VITE_API_URL` | URL do backend no Render |

### Deploy automático

Ambas as plataformas fazem deploy automático a cada `git push` na branch `main`.
