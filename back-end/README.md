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
- [Como rodar](#-como-rodar)
  - [Modo mock (só frontend)](#modo-mock-só-frontend)
  - [Modo API (frontend + backend)](#modo-api-frontend--backend)
- [Endpoints da API](#-endpoints-da-api)
- [Estrutura de pastas](#-estrutura-de-pastas)
- [Arquitetura](#-arquitetura)
- [Funcionalidades](#-funcionalidades)

---

## 🖥 Visão geral

O painel permite que times internos de suporte:

- Visualizem todos os chamados (abertos, em andamento e resolvidos)
- Criem novos chamados com título, cliente, descrição e prioridade
- Atualizem o status de qualquer chamado diretamente pela interface
- Filtrem por status e busquem por título ou nome do cliente

A aplicação tem **dois modos de operação**:

| Modo | Quando usar | Persistência |
|---|---|---|
| **Mock** | Desenvolvimento de UI sem precisar do backend | Em memória (reseta ao recarregar) |
| **API** | Uso completo com dados reais | SQLite em arquivo (`data/tickets.db`) |

---

## 📁 Estrutura do repositório

```
support-panel/
├── front-end/    # React + Vite + TypeScript
└── back-end/     # Node.js + Express + TypeScript
```

---

## 🚀 Como rodar

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

> Os dados são simulados em memória com delay artificial para imitar latência de rede. Resetam ao recarregar a página — comportamento esperado nesse modo.

---

### Modo API (frontend + backend)

Dados reais persistidos em SQLite. Abra dois terminais.

**Terminal 1 — Backend:**

```bash
cd back-end
npm install
npm run dev
```

Confirme que está rodando acessando `http://localhost:3000/health`:
```json
{ "status": "ok", "timestamp": "..." }
```

**Terminal 2 — Frontend:**

```bash
cd front-end

# Crie o .env apontando para a API
echo "VITE_API_URL=http://localhost:3000" > .env

npm install
npm run dev
```

Acesse **http://localhost:5173**

> O frontend detecta `VITE_API_URL` automaticamente. Sem o `.env`, volta ao modo mock — sem alterar nenhum código.

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

**Response `400`** (campos inválidos):
```json
{
  "error": "Dados inválidos.",
  "fields": {
    "title": "Título é obrigatório.",
    "description": "Descrição é obrigatória."
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

Verifica se a API está no ar.

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
├── vite.config.ts           # Configura alias @/ → src/
├── tsconfig.app.json
├── .env                     # Crie manualmente (ver "Como rodar")
└── src/
    ├── main.tsx             # Ponto de entrada React
    ├── App.tsx              # Componente raiz
    ├── App.module.css
    ├── styles/
    │   └── global.css       # Design tokens (CSS variables) e reset
    ├── types/
    │   └── index.ts         # Ticket, TicketStatus, FilterState…
    ├── data/
    │   ├── mockTickets.ts   # Dados de seed para o modo mock
    │   └── constants.ts     # Labels e opções de filtro
    ├── services/
    │   └── ticketService.ts # Camada de dados — seleciona mock ou API
    ├── hooks/
    │   ├── useTickets.ts    # Estado principal: fetch, create, updateStatus
    │   └── useToast.ts      # Notificações toast
    ├── utils/
    │   └── date.ts          # Helpers de formatação de data/hora
    └── components/
        ├── layout/
        │   └── AppHeader    # Cabeçalho com contadores por status
        ├── ui/              # Componentes genéricos reutilizáveis
        │   ├── StatusBadge
        │   ├── PriorityBadge
        │   └── Toast
        └── tickets/         # Componentes do domínio de chamados
            ├── TicketFilters      # Busca + filtros de status + botão criar
            ├── TicketList         # Lista + estados (loading, vazio, erro)
            ├── TicketRow          # Linha individual com select de status
            ├── TicketDetail       # Painel de detalhes ao selecionar linha
            ├── CreateTicketModal  # Modal de criação com validação
            └── ErrorBanner        # Banner de erro com botão retry
```

### Backend (`back-end/`)

```
back-end/
├── tsconfig.json
├── package.json
├── data/                        # Criada automaticamente
│   └── tickets.db               # Banco SQLite (gerado na 1ª execução)
└── src/
    ├── server.ts                # Express app, middlewares, porta 3000
    ├── types/
    │   └── index.ts             # Ticket, TicketStatus, TicketPriority…
    ├── db/
    │   └── database.ts          # Conexão SQLite, migration, seed, helpers
    ├── routes/
    │   └── tickets.ts           # Define GET, POST, PATCH
    ├── controllers/
    │   └── ticketsController.ts # Validação, lógica de negócio, queries SQL
    └── middlewares/
        └── errorHandler.ts      # Erro global + handler 404
```

---

## 🏗 Arquitetura

### Troca de fonte de dados sem alterar a UI

O `ticketService.ts` contém dois adapters e seleciona qual usar com base na variável de ambiente:

```
VITE_API_URL definida  →  apiAdapter  →  fetch() → Express → SQLite
VITE_API_URL ausente   →  mockAdapter →  dados em memória
```

Nenhum componente React sabe de onde os dados vêm. Para trocar a fonte de dados, só o `ticketService.ts` muda.

### Fluxo de dados

```
Componente React
      ↕  props / callbacks
useTickets (hook)
      ↕  chamadas async
ticketService (adapter)
      ↕
  mockAdapter          apiAdapter
  (in-memory)          fetch() → Express → SQLite
```

### Separação de camadas no backend

```
server.ts         →  configuração Express, middlewares, start
routes/           →  define endpoints e aponta para controllers
controllers/      →  validação de input, lógica, queries SQL
db/database.ts    →  conexão única (singleton), migration, seed, helpers tipados
middlewares/      →  errorHandler global, 404
```

### Por que `sql.js`?

O `sql.js` é SQLite compilado para WebAssembly — roda em JavaScript puro, sem compilação nativa. Isso significa que funciona em qualquer sistema operacional (Windows, macOS, Linux) sem precisar de Python, Visual Studio ou ferramentas de build adicionais.

### Por que `tsx` no desenvolvimento?

O `tsx` executa TypeScript diretamente sem etapa de compilação, com hot-reload via `tsx watch`. É mais simples que manter `ts-node` + `nodemon` separados. Para produção, o código é compilado com `tsc` e rodado com `node dist/server.js`.

---

## ✅ Funcionalidades

| Feature | Detalhes |
|---|---|
| Listagem de chamados | id, título, cliente, status, prioridade, data |
| Filtro por status | Todos / Aberto / Em andamento / Resolvido |
| Busca por texto | Título ou nome do cliente em tempo real |
| Criar chamado | Modal com validação de campos obrigatórios |
| Atualizar status | Select inline por linha, persiste imediatamente |
| Painel de detalhes | Expande ao clicar em uma linha |
| Estado de loading | Spinner animado durante requisições |
| Estado vazio | Mensagem contextual (sem dados vs. sem resultados) |
| Estado de erro | Banner com mensagem + botão "Tentar novamente" |
| Responsividade | Desktop: tabela · Mobile: cards empilhados |
| Toasts | Feedback visual para criar chamado e alterar status |
| Acessibilidade | `aria-label`, `role`, `aria-live`, navegação por teclado |
