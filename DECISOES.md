# DECISOES.md

## Decisões técnicas

### 1. Estrutura de pastas por domínio + tipo

```
components/
  layout/   → componentes estruturais (header, sidebar futura)
  ui/       → componentes genéricos reutilizáveis (badges, toasts)
  tickets/  → componentes de domínio (TicketList, TicketRow, etc.)
```

Essa estrutura escala bem: ao adicionar um novo domínio (ex: clientes), basta criar `components/clients/`. Os componentes `ui/` são reutilizáveis entre domínios.

### 2. CSS Modules em vez de Tailwind

Optei por CSS Modules com custom properties (CSS variables) em vez de Tailwind por:
- **Zero dependência de compilação** de purge/JIT
- **Design tokens centralizados** em `global.css` — qualquer mudança de cor ou espaçamento propagada globalmente
- **Co-localização** — o CSS fica junto do componente que o usa
- **Legibilidade** — nomes de classes expressivos (`.statusBadge`) vs. strings de utility classes

Trade-off: mais verboso que Tailwind para protótipos rápidos. Em time grande com design system consolidado, Tailwind + Radix seria mais produtivo.

### 3. `ticketService.ts` como única fonte de verdade de dados

Toda comunicação com dados passa pelo `ticketService`. Isso garante que:
- A troca mock → API real afeta **apenas esse arquivo**
- Os hooks e componentes não sabem (e não precisam saber) de onde os dados vêm
- É fácil adicionar cache, retry, ou interceptors nessa camada

### 4. Hook `useTickets` como único estado global da feature

Em vez de Context API ou Zustand, concentrei o estado em um único hook no componente raiz (`App.tsx`) e passei props para baixo. Para a escala atual (uma página, uma feature), essa abordagem é mais simples e rastreável. Não há prop drilling problemático.

Se o projeto crescer (múltiplas páginas, autenticação, etc.), Zustand seria a próxima escolha — API simples, sem boilerplate de Provider.

### 5. Alias `@/` para imports limpos

```ts
import { useTickets } from '@/hooks/useTickets';
```
Configurado via `vite.config.ts` + `tsconfig.app.json`. Evita `../../../` e torna refatorações de pasta indolores.

### 6. Barrel exports (`index.ts`)

Cada pasta de componentes tem um `index.ts` que re-exporta tudo. Isso permite:
```ts
import { TicketList, TicketDetail, ErrorBanner } from '@/components/tickets';
// ao invés de 3 imports separados de paths longos
```

---

## Trade-offs

| Decisão | Trade-off aceito |
|---|---|
| CSS Modules | Mais verboso que Tailwind para prototipagem |
| useState local + props | Sem Context/Zustand — limitado se app crescer muito |
| Mock in-memory | Dados resetam ao recarregar — aceitável para demonstração |
| Sem paginação | Para 6 itens no mock não faz sentido; necessária em produção |
| Sem testes | Priorizei UX e arquitetura no tempo disponível |

---

## O que não implementei e por quê

- **Backend Node.js + Express**: foco era o frontend. O `ticketService.ts` está preparado para receber implementação real sem mudar o contrato.
- **Testes unitários**: no escopo de 1 dia, priorizei uma arquitetura testável (hooks puros, serviço isolado) sobre os testes em si. Candidatos a teste: `ticketService`, `useTickets`, validação do `CreateTicketModal`.
- **Paginação/virtualização**: desnecessária para o volume do mock.
- **Filtro por prioridade**: não estava nos requisitos obrigatórios.
- **Docker**: sem backend, não há necessidade.

---

## O que faria com mais tempo

1. Backend Express + SQLite com `GET /tickets`, `POST /tickets`, `PATCH /tickets/:id/status`
2. Testes com Vitest + Testing Library para hooks e componentes críticos
3. Paginação ou virtualização de lista (react-virtual) para escala
4. Filtro por prioridade e ordenação clicável por coluna
5. Histórico de mudanças de status por chamado
6. Atribuição de chamado a um agente
7. Notificações em tempo real via WebSocket ou SSE

---

## Como usei IA

**Prompts principais utilizados:**
1. Análise do desafio completo antes de escrever código — pedi uma revisão das decisões técnicas
2. Geração do design system: "estética industrial com IBM Plex Mono, dark theme, badges semânticos por cor"
3. Geração iterativa de cada componente com seus CSS Modules correspondentes
4. Revisão de acessibilidade (aria-labels, roles, navegação por teclado)

**O que aceitei da IA:**
- Estrutura base de cada componente e seus CSS Modules
- Lógica de filtro derivada no hook `useTickets`
- Animações CSS (slideUp, pulse no badge de "Aberto")

**O que descartei ou modifiquei:**
- Sugestão de Tailwind → mantive CSS Modules para demonstrar controle de CSS
- Sugestão de Context API → simplifiquei para useState + props
- Toast gerado com lógica dentro do componente → extraí para `useToast` hook dedicado
- Layout de cards sugerido inicialmente → mantive tabela por ser mais eficiente para dados densos
- Imports com caminhos relativos longos → substituí por alias `@/`

**Conclusão:** A IA acelerou significativamente a produção de boilerplate (~50-60% do CSS e estrutura inicial). As decisões arquiteturais (separação de camadas, CSS Modules, estado local, alias `@/`, barrel exports) foram tomadas e revisadas por mim. A qualidade final dependeu de entender o que aceitar, o que refatorar e o que descartar.
