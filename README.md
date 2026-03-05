# 🎫 Painel de Chamados de Suporte

Interface interna para gestão de chamados de suporte para pequenos comércios, construída com **React + Vite + TypeScript**.

---

## 📋 Índice

- [Como criar o projeto do zero com Vite](#-como-criar-o-projeto-do-zero-com-vite)
- [Como rodar (modo mock/local)](#-como-rodar-modmocklocal)
- [Estrutura de pastas](#-estrutura-de-pastas)
- [Arquitetura e decisões técnicas](#-arquitetura-e-decisões-técnicas)
- [Funcionalidades implementadas](#-funcionalidades-implementadas)
- [Stack utilizada](#-stack-utilizada)

---

## 🚀 Como criar o projeto do zero com Vite

Se você quiser recriar esse projeto do zero utilizando Vite + React + TypeScript, siga os passos abaixo:

### 1. Criar o projeto com Vite

```bash
npm create vite@latest support-panel -- --template react-ts
```

> O comando `npm create vite@latest` usa o scaffolding oficial do Vite.
> A flag `--template react-ts` já configura React + TypeScript automaticamente.

### 2. Entrar na pasta e instalar as dependências

```bash
cd support-panel
npm install
```

### 3. Rodar o servidor de desenvolvimento

```bash
npm run dev
```

O projeto estará disponível em `http://localhost:5173`.

### 4. Outros comandos úteis

| Comando           | O que faz                              |
|-------------------|----------------------------------------|
| `npm run dev`     | Inicia servidor de desenvolvimento     |
| `npm run build`   | Gera build de produção em `/dist`      |
| `npm run preview` | Visualiza o build de produção localmente |

---

## ▶️ Como rodar (modo mock/local)

Este projeto funciona **100% sem backend**. Os dados são simulados em memória com delays artificiais para imitar latência de API real.

```bash
# 1. Clone ou copie os arquivos do projeto
# 2. Instale as dependências
npm install

# 3. Rode em modo desenvolvimento
npm run dev
```

Acesse `http://localhost:5173` no navegador.

> **Nota:** Os dados são resetados ao recarregar a página — isso é esperado no modo mock.

---

## 📁 Estrutura de pastas

```
support-panel/
├── index.html                      # Entry point HTML
├── vite.config.ts                  # Configuração do Vite (alias @/)
├── tsconfig.json                   # Configuração TypeScript raiz
├── tsconfig.app.json               # Config TS para o código da aplicação
├── tsconfig.node.json              # Config TS para arquivos de build (vite.config)
├── package.json
└── src/
    ├── main.tsx                    # Ponto de entrada React (createRoot)
    ├── App.tsx                     # Componente raiz — orquestra toda a aplicação
    ├── App.module.css              # Estilos do layout principal
    ├── vite-env.d.ts               # Tipagem de variáveis de ambiente Vite
    │
    ├── styles/
    │   └── global.css              # Reset, design tokens (CSS variables), base styles
    │
    ├── types/
    │   └── index.ts                # Tipos TypeScript: Ticket, TicketStatus, FilterState…
    │
    ├── data/
    │   ├── mockTickets.ts          # Dados iniciais (seed) do mock
    │   └── constants.ts            # Labels e opções de filtro reutilizáveis
    │
    ├── services/
    │   └── ticketService.ts        # Camada de dados (mock in-memory).
    │                               # Troque por fetch('/api/...') para conectar ao backend.
    │
    ├── hooks/
    │   ├── useTickets.ts           # Hook principal: fetch, create, updateStatus, filtros
    │   └── useToast.ts             # Hook de notificações toast
    │
    ├── utils/
    │   └── date.ts                 # Helpers de formatação de data/hora
    │
    └── components/
        ├── layout/
        │   ├── AppHeader.tsx       # Cabeçalho com logo e contadores de status
        │   ├── AppHeader.module.css
        │   └── index.ts            # Barrel export
        │
        ├── ui/                     # Componentes de UI genéricos/reutilizáveis
        │   ├── StatusBadge.tsx     # Badge colorido para status do chamado
        │   ├── PriorityBadge.tsx   # Badge colorido para prioridade
        │   ├── Badge.module.css    # Estilos compartilhados dos badges
        │   ├── Toast.tsx           # Container de notificações toast
        │   ├── Toast.module.css
        │   └── index.ts            # Barrel export
        │
        └── tickets/                # Componentes específicos do domínio de chamados
            ├── TicketFilters.tsx   # Barra de busca + filtros de status + botão criar
            ├── TicketFilters.module.css
            ├── TicketList.tsx      # Lista de chamados + estados (loading, vazio, erro)
            ├── TicketList.module.css
            ├── TicketRow.tsx       # Linha individual de chamado (com select de status)
            ├── TicketRow.module.css
            ├── TicketDetail.tsx    # Painel de detalhes expandido ao selecionar linha
            ├── TicketDetail.module.css
            ├── CreateTicketModal.tsx   # Modal de criação com validação de formulário
            ├── CreateTicketModal.module.css
            ├── ErrorBanner.tsx     # Banner de erro com botão de retry
            ├── ErrorBanner.module.css
            └── index.ts            # Barrel export
```

---

## 🏗 Arquitetura e decisões técnicas

### Separação em camadas

O projeto segue uma separação clara de responsabilidades:

```
UI (components)
    ↕ props / callbacks
Lógica de estado (hooks)
    ↕ chamadas assíncronas
Camada de dados (services)
    ↕ (mock in-memory ou fetch real)
Fonte de dados (mock / API)
```

**Por quê essa separação importa:**
Para trocar o mock por uma API real, basta editar apenas `src/services/ticketService.ts` — nenhum componente precisa mudar.

### `ticketService.ts` — Camada de dados isolada

```ts
// Mock atual:
async getAll(): Promise<Ticket[]> {
  await delay();
  return [...store];
}

// Para usar API real, troque por:
async getAll(): Promise<Ticket[]> {
  const res = await fetch('/api/tickets');
  if (!res.ok) throw new Error('Falha ao carregar chamados.');
  return res.json();
}
```

### `useTickets.ts` — Hook de estado principal

Concentra toda a lógica de estado da aplicação:
- Busca inicial dos dados (`useEffect`)
- Criação otimista de chamados (adiciona localmente sem re-fetch)
- Atualização de status (atualiza item específico no array)
- Filtragem derivada (computed, sem estado extra)
- Contadores por status (computed)

### CSS Modules

Cada componente tem seu próprio `.module.css`. Isso garante:
- Escopo local (sem conflitos de classe)
- Co-localização (CSS junto do componente)
- Zero dependências de runtime

Os **design tokens** (cores, tipografia, espaçamentos) ficam em `global.css` via **CSS custom properties**, acessíveis em todos os modules.

### TypeScript estrito

`tsconfig.app.json` habilita `strict: true`, `noUnusedLocals`, `noUnusedParameters`. Todos os componentes e funções são tipados, incluindo props, retornos de hooks e payloads de serviço.

### Alias `@/`

`vite.config.ts` mapeia `@/` para `src/`. Isso permite imports limpos:
```ts
import { useTickets } from '@/hooks/useTickets';
// ao invés de:
import { useTickets } from '../../../hooks/useTickets';
```

---

## ✅ Funcionalidades implementadas

| Feature | Detalhes |
|---|---|
| **Listagem** | id, título, cliente, status, prioridade, data de criação |
| **Filtro por status** | Tabs: Todos / Aberto / Em andamento / Resolvido |
| **Busca por texto** | Filtra por título ou nome do cliente em tempo real |
| **Criar chamado** | Modal com validação: título, cliente, descrição (obrigatórios), prioridade |
| **Atualizar status** | Select inline em cada linha, persiste no store em memória |
| **Painel de detalhes** | Expande ao clicar em uma linha, mostra descrição completa |
| **Estado de loading** | Spinner animado durante fetch |
| **Estado vazio** | Mensagem contextual (sem dados vs. sem resultados de busca) |
| **Estado de erro** | Banner vermelho com mensagem + botão "Tentar novamente" |
| **Responsividade** | Desktop: tabela com colunas. Mobile: cards empilhados |
| **Toasts** | Feedback de ações (criar chamado, alterar status) |
| **Acessibilidade** | `aria-label`, `role`, `aria-pressed`, `aria-live`, navegação por teclado, `focus-visible` |

---

## 🛠 Stack utilizada

| Tecnologia | Versão | Por quê |
|---|---|---|
| **React** | 18 | Requisito do desafio. Hooks modernos sem class components. |
| **Vite** | 6 | Build ultra-rápido, HMR nativo, suporte TypeScript out-of-the-box |
| **TypeScript** | 5.6 | Tipagem estrita, IntelliSense, segurança em refatorações |
| **CSS Modules** | nativo Vite | Escopo local, zero runtime overhead, sem dependências extras |
| **IBM Plex Mono + Sans** | Google Fonts | Estética industrial/técnica adequada a painel interno de suporte |

**Sem dependências de UI externas** (sem Chakra, MUI, Radix, etc.) — escolha intencional para demonstrar domínio de CSS e composição de componentes.
