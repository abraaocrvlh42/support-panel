# 🎫 Painel de Chamados de Suporte

Interface interna para gestão de chamados de suporte para pequenos comércios.

| Camada | Stack |
|---|---|
| **Frontend** | React 18 · Vite · TypeScript · CSS Modules |
| **Backend**  | Node.js · Express · TypeScript · SQLite (`sql.js`) |

---

## 📋 Índice

- [Visão geral](#-visão-geral)
- [Estrutura do repositório](#-estrutura-do-repositório)
- [Como criar o projeto do zero com Vite](#-como-criar-o-projeto-do-zero-com-vite)
- [Como rodar](#-como-rodar)
  - [Modo mock](#modo-mock-só-frontend)
  - [Modo API](#modo-api-frontend--backend)
- [Endpoints da API](#-endpoints-da-api)
- [Estrutura de pastas](#-estrutura-de-pastas)
- [Arquitetura](#-arquitetura)
- [Funcionalidades](#-funcionalidades)
- [Stack](#-stack)

---

## 🖥 Visão geral

O painel permite que times internos de suporte:

- Visualizem todos os chamados abertos, em andamento e resolvidos
- Criem novos chamados com título, cliente, descrição e prioridade
- Atualizem o status de qualquer chamado diretamente pela interface
- Filtrem por status e busquem por título ou nome do cliente

A aplicação tem **dois modos de operação**:

| Modo | Quando usar | Persistência |
|---|---|---|
| **Mock** | Desenvolvimento de UI sem backend | Em memória (reseta ao recarregar) |
| **API**  | Uso completo com dados reais | SQLite em arquivo (`data/tickets.db`) |

---

## 📁 Estrutura do repositório

```
support-panel/
├── front-end/    # React + Vite + TypeScript
└── back-end/     # Node.js + Express + TypeScript
```

---

## 🚀 Como criar o projeto do zero com Vite

Se quiser recriar o frontend do zero:

```bash
npm create vite@latest front-end -- --template react-ts
cd front-end
npm install
npm run dev
```

> A flag `--template react-ts` configura React + TypeScript automaticamente.

---

## ▶️ Como rodar

### Pré-requisitos

- **Node.js 18+** → [nodejs.org](https://nodejs.org)
- **npm** (já incluído no Node.js)

---

### Modo mock (só frontend)

Ideal para trabalhar na UI sem precisar do backend rodando.

```bash
cd front-end
npm install
npm run dev
```

Acesse **http://localhost:5173**

> Os dados são simulados em memória com delay artificial. Resetam ao recarregar — comportamento esperado nesse modo.

---

### Modo API (frontend + backend)

Dados reais persistidos em SQLite. Abra dois terminais.

**Terminal 1 — Backend:**

```bash
cd back-end
npm install
npm run dev
```

Confirme que está rodando em `http://localhost:3000/health`:
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

> O frontend aponta para `http://localhost:3000` via constante `API_URL` no arquivo
> `front-end/src/services/ticketService.ts`. Para trocar a URL, edite essa constante.

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
  "description": "Descrição detalhada do problema",
  "priority": "low" | "medium" | "high"
}
```

**Response `201`:** chamado criado completo.

**Response `400`:**
```json
{
  "error": "Dados inválidos.",
  "fields": {
    "title": "Título é obrigatório."
  }
}
```

---

### `PATCH /tickets/:id/status`

Atualiza o status de um chamado existente.

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
    │   ├── useTickets.ts           # Estado principal: fetch, create, updateStatus
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
            ├── TicketRow           # Linha com select de status inline
            ├── TicketDetail        # Painel de detalhes
            ├── CreateTicketModal   # Modal de criação com validação
            └── ErrorBanner         # Banner de erro com retry
```

### Backend (`back-end/`)

```
back-end/
├── tsconfig.json
├── package.json
├── data/
│   └── tickets.db                  # Criado automaticamente na 1ª execução
└── src/
    ├── server.ts                   # Express, middlewares, porta 3000
    ├── types/
    │   └── index.ts                # Ticket, TicketStatus, TicketPriority…
    ├── db/
    │   └── database.ts             # Conexão SQLite, migration, seed, helpers
    ├── routes/
    │   └── tickets.ts              # GET, POST, PATCH
    ├── controllers/
    │   └── ticketsController.ts    # Validação, lógica, queries SQL
    └── middlewares/
        └── errorHandler.ts         # Erros globais + 404
```

---

## 🏗 Arquitetura

### Camada de dados isolada

O `ticketService.ts` é a única parte do frontend que sabe de onde os dados vêm.
Componentes e hooks consomem sempre a mesma interface:

```ts
ticketService.getAll()
ticketService.create(payload)
ticketService.updateStatus(id, status)
```

Para trocar mock por API real, apenas o `ticketService.ts` muda — nenhum componente é afetado.

### Fluxo de dados

```
Componente React
      ↕  props / callbacks
useTickets (hook)
      ↕  chamadas async
ticketService
      ↕
  mockAdapter            apiAdapter
  (in-memory)            fetch() → Express → SQLite
```

### Separação de camadas no backend

```
server.ts       →  Express, middlewares globais, start
routes/         →  define endpoints, delega para controllers
controllers/    →  validação, lógica de negócio, queries SQL
db/             →  conexão singleton, migration, seed, helpers tipados
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
| Painel de detalhes | Expande ao clicar em uma linha |
| Loading | Spinner animado durante requisições |
| Estado vazio | Mensagem contextual (sem dados vs. sem resultados) |
| Estado de erro | Banner com mensagem amigável + retry |
| Responsividade | Desktop: tabela · Mobile: cards empilhados |
| Toasts | Feedback ao criar chamado e alterar status |
| Acessibilidade | `aria-label`, `role`, `aria-live`, navegação por teclado |

---

## 🛠 Stack

| Tecnologia | Por quê |
|---|---|
| **React 18** | Requisito do desafio. Hooks modernos, sem class components |
| **Vite** | Build rápido, HMR nativo, suporte TypeScript sem configuração extra |
| **TypeScript** | Tipagem estrita em todo o projeto — frontend e backend |
| **CSS Modules** | Escopo local por componente, zero runtime, sem dependências de estilo |
| **IBM Plex Mono + Sans** | Estética industrial adequada a um painel interno de suporte |
| **Express** | Minimalista, maduro, ótima tipagem com `@types/express` |
| **sql.js** | SQLite em WebAssembly — sem compilação nativa, funciona em qualquer OS |
| **tsx** | Executa TypeScript diretamente no dev, sem step de build intermediário |
