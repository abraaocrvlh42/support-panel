# 🗄️ Support Panel — Backend

API REST para o Painel de Chamados de Suporte.
Construída com **Node.js + Express + SQLite** (via `better-sqlite3`).

---

## 📋 Índice

- [Estrutura de pastas](#-estrutura-de-pastas)
- [Como rodar o backend](#-como-rodar-o-backend)
- [Como integrar ao frontend](#-como-integrar-ao-frontend)
- [Endpoints da API](#-endpoints-da-api)
- [Arquitetura](#-arquitetura)

---

## 📁 Estrutura de pastas

```
backend/
├── src/
│   ├── server.js                   # Entry point — Express app, middlewares, porta
│   ├── db/
│   │   └── database.js             # Conexão SQLite + migration + seed inicial
│   ├── routes/
│   │   └── tickets.js              # Define as rotas: GET, POST, PATCH
│   ├── controllers/
│   │   └── ticketsController.js    # Lógica de negócio + queries SQL
│   └── middlewares/
│       └── errorHandler.js         # Tratamento de erros + 404
├── data/                           # Criada automaticamente — contém tickets.db
├── Dockerfile
├── .gitignore                      # Ignora node_modules/ e data/
└── package.json
```

---

## 🚀 Como rodar o backend

### Pré-requisitos

- Node.js 18+ instalado

### 1. Instalar dependências

```bash
cd backend
npm install
```

### 2. Rodar em modo desenvolvimento (com hot-reload)

```bash
npm run dev
```

### 3. Rodar em modo produção

```bash
npm start
```

A API estará disponível em `http://localhost:3000`.

> O banco de dados SQLite é criado automaticamente em `data/tickets.db` na primeira execução, já populado com 6 chamados de exemplo.

---

## 🔗 Como integrar ao frontend

### 1. Crie o arquivo `.env` na pasta do **frontend**

```bash
# frontend/.env
VITE_API_URL=http://localhost:3000
```

> Se o arquivo `.env` não existir (ou `VITE_API_URL` estiver vazio), o frontend roda automaticamente em modo mock local — sem precisar do backend.

### 2. Substitua o `ticketService.ts`

Copie o arquivo `ticketService.ts` fornecido neste pacote para:

```
frontend/src/services/ticketService.ts
```

Ele detecta automaticamente a variável `VITE_API_URL`:
- **Com** a variável → usa a API real via `fetch()`
- **Sem** a variável → usa o mock em memória

### 3. Rode os dois juntos

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

---

## 📡 Endpoints da API

### `GET /tickets`
Retorna todos os chamados, ordenados por data de criação (mais recente primeiro).

**Response `200`:**
```json
[
  {
    "id": "001",
    "title": "Sistema de PDV travando",
    "client": "Mercearia São João",
    "description": "...",
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

**Response `201`:** o chamado criado completo.

**Response `400`** (campos inválidos):
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

**Response `200`:** o chamado atualizado completo.

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

## 🏗 Arquitetura

### Por que `better-sqlite3`?

- **Síncrono** — SQLite é um banco de arquivo local; operações síncronas são mais simples e igualmente performáticas para esse volume de dados.
- **Zero configuração** — sem servidor de banco separado.
- **Robusto** — usado em produção por apps como WhatsApp Desktop e Electron.

### Separação controller / route / db

```
server.js       → configuração Express, middlewares, inicialização
routes/         → define APENAS os endpoints e qual controller chama
controllers/    → lógica de negócio, validação, queries SQL
db/database.js  → conexão única (singleton), migration, seed
middlewares/    → errorHandler global, 404
```

Essa separação facilita:
- Adicionar novos recursos (ex: `/clients`) sem tocar no código existente
- Testar controllers de forma isolada
- Trocar o banco (ex: PostgreSQL) modificando só `db/database.js`

### CORS configurado para o frontend Vite

`server.js` permite requisições apenas de `http://localhost:5173` (dev server do Vite). Em produção, altere para a URL real do frontend.
