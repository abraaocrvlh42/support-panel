# DECISOES.md

## Decisões técnicas

### 1. TypeScript em todo o projeto

Tanto o frontend quanto o backend usam TypeScript com `strict: true`. Os tipos do domínio (`Ticket`, `TicketStatus`, `TicketPriority`) espelham a mesma estrutura nos dois lados, garantindo consistência no contrato de dados entre frontend e API.

Benefícios práticos nesse projeto:
- O controller usa `Request<Params, ResBody, ReqBody>` para tipar body e params das rotas
- Os helpers `dbAll<T>` e `dbGet<T>` são genéricos — a query SQL já retorna o tipo correto
- Erros de typo em nomes de campo são pegos em tempo de compilação, não em runtime

---

### 2. Estrutura de pastas por domínio + tipo

```
components/
  layout/   → estruturais (AppHeader)
  ui/       → genéricos reutilizáveis (badges, toasts)
  tickets/  → domínio de chamados
```

Essa separação escala bem: adicionar um novo domínio (ex: clientes) é criar `components/clients/` sem tocar no que já existe. Os componentes `ui/` são compartilhados entre domínios.

---

### 3. CSS Modules em vez de Tailwind

Escolhi CSS Modules com CSS custom properties centralizadas no `global.css` por:

- **Escopo local** — sem conflito de classes entre componentes
- **Co-localização** — o CSS fica junto do componente que o usa
- **Zero dependência de runtime** — funciona nativamente no Vite
- **Design tokens centralizados** — mudar uma cor em `global.css` propaga para toda a aplicação

Trade-off: mais verboso que Tailwind para prototipagem rápida. Em time grande com design system consolidado, Tailwind + Radix UI seria mais produtivo.

---

### 4. `ticketService.ts` como única camada de dados

Toda comunicação com dados passa por essa camada. Os componentes React nunca fazem `fetch()` diretamente — consomem `ticketService.getAll()`, `create()`, `updateStatus()` e `delete()`.

Isso garante que trocar o mock por API real afeta apenas esse arquivo. Nenhum componente, hook ou teste precisa mudar.

---

### 5. Hook `useTickets` como estado centralizado da feature

Em vez de Context API ou Zustand, o estado vive em um único hook instanciado no `App.tsx` e passado como props. Para a escala atual (uma página, uma feature), essa abordagem é mais simples e o fluxo de dados é fácil de rastrear.

Se o projeto crescer com múltiplas páginas e estado compartilhado entre rotas, Zustand seria a próxima escolha.

---

### 6. Migração de SQLite para PostgreSQL

A escolha inicial foi `better-sqlite3`, que falhou por exigir compilação nativa no Windows (Python + Visual Studio Build Tools). Migramos para `sql.js` (SQLite em WebAssembly), que funcionou localmente mas não persistia dados no Render — o sistema de arquivos do Render é efêmero e reseta a cada deploy.

A solução definitiva foi migrar para **PostgreSQL** via `pg`, usando o serviço gerenciado gratuito do Render. Isso resolveu tanto o problema de compilação quanto o de persistência.

Lições aprendidas:
- SQLite é ótimo para desenvolvimento local, mas não para ambientes de deploy efêmeros
- PostgreSQL é a escolha correta desde o início para qualquer app que precise de persistência real

---

### 7. `tsx` para desenvolvimento do backend

O `tsx` executa TypeScript diretamente via `tsx watch` com hot-reload, sem necessidade de `ts-node` + `nodemon` separados. Para produção: `tsc` compila e `node dist/server.js` roda sem overhead de transpilação.

---

### 8. Alias `@/` para imports do frontend

```ts
import { useTickets } from '@/hooks/useTickets';
// ao invés de:
import { useTickets } from '../../../hooks/useTickets';
```

Configurado via `vite.config.ts` + `tsconfig.app.json`. Torna imports legíveis e refatorações de pasta indolores.

---

### 9. `API_URL` hardcoded no frontend

A variável de ambiente `VITE_API_URL` não estava sendo lida corretamente no ambiente local Windows com Vite. Após investigação (verificação do `.env`, limpeza de cache, reinicializações), optei por hardcodar a URL diretamente no `ticketService.ts` como solução pragmática.

Em produção no Vercel, a variável de ambiente funciona corretamente e é injetada no build — o problema era específico do ambiente Windows local.

---

### 10. CORS dinâmico via variável de ambiente

O `server.ts` lê `FRONTEND_URL` do ambiente para configurar o CORS:

```ts
origin: process.env.FRONTEND_URL ?? 'http://localhost:5173'
```

Isso permite usar a mesma codebase em desenvolvimento (localhost) e produção (Vercel), sem alterar código — só variável de ambiente.

---

## Trade-offs

| Decisão | Trade-off aceito |
|---|---|
| CSS Modules | Mais verboso que Tailwind para prototipagem |
| `useState` local + props | Sem Context/Zustand — limitado se o app crescer muito |
| PostgreSQL no Render | Banco gratuito tem limites de conexão e pode suspender após inatividade |
| `API_URL` hardcoded | Solução pragmática após dificuldade com `.env` no ambiente Windows |
| Sem paginação | Desnecessária para o volume atual; obrigatória em produção com muitos dados |
| Sem testes | Priorizei arquitetura testável sobre os testes em si |

---

## O que não implementei e por quê

- **Testes unitários** — no escopo do desafio, priorizei arquitetura testável (hooks puros, service isolado, controllers separados). Candidatos a teste: `ticketService`, `useTickets`, validação do `CreateTicketModal`, controllers do backend.
- **Paginação** — desnecessária para o volume atual. Em produção: `GET /tickets?page=1&limit=20` com `LIMIT` e `OFFSET` no PostgreSQL.
- **Filtro por prioridade** — não estava nos requisitos obrigatórios.
- **Ordenação clicável por coluna** — melhoria de UX para próxima iteração.
- **Autenticação** — fora do escopo do desafio.

---

## O que faria com mais tempo

1. Testes com Vitest + Testing Library para hooks e componentes críticos
2. Testes de integração nos endpoints com Supertest
3. Paginação server-side com `LIMIT` e `OFFSET`
4. Filtro por prioridade e ordenação clicável por coluna
5. Histórico de mudanças de status por chamado
6. Atribuição de chamado a um agente
7. Notificações em tempo real via WebSocket ou SSE
8. Investigar e corrigir a leitura do `.env` no ambiente Windows com Vite
9. Adicionar índices no PostgreSQL para queries de busca por texto

---

## Como usei IA

**Prompts principais:**
1. Análise do desafio completo antes de escrever código — revisão das decisões técnicas
2. Geração do design system: "estética industrial com IBM Plex Mono, dark theme, badges semânticos por cor"
3. Geração iterativa de cada componente com seus CSS Modules
4. Geração do backend com Express + TypeScript
5. Debugging de erros de tipagem TypeScript (`BindParams` vs `SqlValue[]`, `@types/node` faltando)
6. Migração de SQLite para PostgreSQL — reescrita do `database.ts` e controllers
7. Configuração de deploy no Vercel e Render
8. Debugging de erros de CORS entre frontend e backend em produção

**O que aceitei:**
- Estrutura base dos componentes e CSS Modules
- Lógica de filtro derivada no `useTickets`
- Animações CSS (slideUp, pulse no badge "Aberto")
- Separação em camadas do backend (routes / controllers / db)
- Helpers genéricos `dbAll<T>` e `dbGet<T>`
- Queries PostgreSQL com placeholders `$1, $2…`

**O que descartei ou modifiquei:**
- Tailwind → mantive CSS Modules para demonstrar controle de CSS
- Context API → simplifiquei para `useState` + props
- `better-sqlite3` → falhou no Windows, trocado por `sql.js` e depois por PostgreSQL
- `sql.js` → não persistia no Render, substituído por PostgreSQL
- Variável de ambiente `.env` no frontend → substituída por constante hardcoded após problema no Windows
- Toast com lógica inline → extraí para hook `useToast` dedicado

**Conclusão:** A IA acelerou significativamente o boilerplate e o debugging. As decisões arquiteturais e as iterações necessárias para fazer o projeto funcionar em produção foram conduzidas criticamente — entender o que aceitar, o que refatorar e o que descartar foi determinante para a qualidade final.
