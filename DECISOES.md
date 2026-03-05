# DECISOES.md

## Decisões técnicas

### 1. TypeScript em todo o projeto

Tanto o frontend quanto o backend usam TypeScript com `strict: true`. Os tipos do domínio (`Ticket`, `TicketStatus`, `TicketPriority`) espelham a mesma estrutura nos dois lados, o que garante consistência no contrato de dados entre frontend e API.

Benefícios práticos nesse projeto:
- O controller do Express usa `Request<Params, ResBody, ReqBody>` para tipar body e params das rotas
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

Escolhi CSS Modules com CSS custom properties (variáveis) centralizadas no `global.css` por:

- **Escopo local** — sem conflito de classes entre componentes
- **Co-localização** — o CSS fica junto do componente que o usa
- **Zero dependência de runtime ou compilador** — funciona nativamente no Vite
- **Design tokens centralizados** — mudar uma cor em `global.css` propaga para toda a aplicação

Trade-off: mais verboso que Tailwind para prototipagem rápida. Em time grande com design system, Tailwind + Radix UI seria mais produtivo.

---

### 4. `ticketService.ts` como única camada de dados

Toda comunicação com dados passa por essa camada. Os componentes React nunca fazem `fetch()` diretamente — eles consomem `ticketService.getAll()`, `ticketService.create()` e `ticketService.updateStatus()`.

Isso garante que trocar o mock por API real (ou trocar a URL da API) afeta apenas esse arquivo. Nenhum componente, hook ou teste precisa mudar.

---

### 5. Hook `useTickets` como estado centralizado da feature

Em vez de Context API ou Zustand, o estado vive em um único hook instanciado no `App.tsx` e passado como props. Para a escala atual (uma página, uma feature), essa abordagem é mais simples e o fluxo de dados é fácil de rastrear.

Se o projeto crescer com múltiplas páginas e estado compartilhado entre rotas, Zustand seria a próxima escolha — API simples, sem boilerplate de Provider.

---

### 6. `sql.js` em vez de `better-sqlite3`

A escolha inicial foi `better-sqlite3` (SQLite síncrono, performático). Porém, essa biblioteca compila código C++ nativo durante o `npm install`, exigindo Python e ferramentas de build do Windows (Visual Studio Build Tools) — o que causou falha na instalação no ambiente Windows.

O `sql.js` resolve isso: é o SQLite compilado para WebAssembly, roda em JavaScript puro, sem nenhuma dependência nativa. Funciona em qualquer OS sem configuração adicional.

Trade-off: o `sql.js` é assíncrono na inicialização (carrega o Wasm) e levemente mais pesado em memória que `better-sqlite3`. Para o volume de dados desse painel, a diferença é imperceptível.

---

### 7. `tsx` para desenvolvimento do backend

O `tsx` executa TypeScript diretamente via `tsx watch` com hot-reload, sem necessidade de `ts-node` + `nodemon` separados. É uma dependência a menos e o setup é mais simples.

Para produção: `npm run build` compila via `tsc` e `npm start` roda `node dist/server.js` — sem overhead de transpilação em runtime.

---

### 8. Alias `@/` para imports do frontend

```ts
import { useTickets } from '@/hooks/useTickets';
// ao invés de:
import { useTickets } from '../../../hooks/useTickets';
```

Configurado via `vite.config.ts` + `tsconfig.app.json`. Torna imports legíveis e refatorações de pasta indolores.

---

### 9. Barrel exports (`index.ts`)

Cada pasta de componentes tem um `index.ts` que re-exporta tudo:

```ts
import { TicketList, TicketDetail, ErrorBanner } from '@/components/tickets';
```

Reduz a quantidade de linhas de import e deixa claro o que cada pasta expõe publicamente.

---

## Trade-offs

| Decisão | Trade-off aceito |
|---|---|
| CSS Modules | Mais verboso que Tailwind para prototipagem |
| `useState` local + props | Sem Context/Zustand — limitado se o app crescer muito |
| `sql.js` | Levemente mais pesado que `better-sqlite3`, mas sem dependência nativa |
| Sem paginação | Desnecessária para o volume atual; obrigatória em produção com muitos dados |
| Sem testes | Priorizei arquitetura testável (hooks puros, service isolado) sobre os testes em si |
| API_URL hardcoded | Solução pragmática após dificuldades com variável de ambiente no ambiente Windows |

---

## O que não implementei e por quê

- **Testes unitários** — no escopo de 1 dia, priorizei uma arquitetura testável. Os candidatos a teste seriam: `ticketService`, `useTickets`, validação do `CreateTicketModal` e os controllers do backend.
- **Paginação/virtualização** — desnecessária para o volume do mock. Em produção com centenas de chamados, `react-virtual` ou paginação server-side seriam obrigatórios.
- **Filtro por prioridade** — não estava nos requisitos obrigatórios.
- **Ordenação clicável por coluna** — melhoria de UX para uma próxima iteração.
- **Docker/Compose** — sem necessidade crítica para o escopo do desafio.
- **Autenticação** — fora do escopo.

---

## O que faria com mais tempo

1. Testes com Vitest + Testing Library para hooks e componentes críticos
2. Testes de integração nos endpoints Express com Supertest
3. Paginação server-side (`GET /tickets?page=1&limit=20`)
4. Filtro por prioridade e ordenação clicável por coluna
5. Histórico de mudanças de status por chamado
6. Atribuição de chamado a um agente
7. Notificações em tempo real via WebSocket ou SSE
8. Variáveis de ambiente funcionando corretamente via `.env` (investigar o problema de leitura no ambiente Windows com Vite)
9. Docker Compose para rodar frontend + backend com um único comando

---

## Como usei IA

**Prompts principais:**
1. Análise do desafio completo antes de escrever código — pedi revisão das decisões técnicas antes de implementar
2. Geração do design system: "estética industrial com IBM Plex Mono, dark theme, badges semânticos por cor"
3. Geração iterativa de cada componente com seus CSS Modules
4. Geração do backend com Express + TypeScript + sql.js
5. Debugging de erros de tipagem TypeScript (`BindParams` vs `SqlValue[]`)

**O que aceitei:**
- Estrutura base dos componentes e CSS Modules
- Lógica de filtro derivada no `useTickets`
- Animações CSS (slideUp, pulse no badge "Aberto")
- Separação em camadas do backend (routes / controllers / db)
- Helpers genéricos `dbAll<T>` e `dbGet<T>`

**O que descartei ou modifiquei:**
- Sugestão de Tailwind → mantive CSS Modules para demonstrar controle de CSS
- Sugestão de Context API → simplifiquei para `useState` + props
- `better-sqlite3` → troquei por `sql.js` após falha de instalação no Windows
- Variável de ambiente via `.env` → substituída por constante hardcoded após dificuldade de leitura no ambiente Windows
- Toast com lógica inline → extraí para hook `useToast` dedicado
- Layout de cards sugerido inicialmente → mantive tabela por ser mais eficiente para dados densos

**Conclusão:** A IA acelerou significativamente o boilerplate (~50-60% do CSS e estrutura inicial). As decisões arquiteturais foram tomadas e revisadas criticamente — o que aceitar, o que refatorar e o que descartar determinou a qualidade final do projeto.
