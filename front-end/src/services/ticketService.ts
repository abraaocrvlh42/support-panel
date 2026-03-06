import { Ticket, TicketStatus, CreateTicketPayload } from '@/types';
import { mockTickets } from '@/data/mockTickets';

console.log('Modo:', import.meta.env.VITE_API_URL ?? 'mock');

// ─────────────────────────────────────────────────────────────────────────────
// Modo de dados: 'mock' (local) ou 'api' (backend Express)
//
// Para usar a API real, defina no arquivo .env do frontend:
//   VITE_API_URL=http://localhost:3000
//
// Sem a variável, o app roda em modo mock automaticamente.
// ─────────────────────────────────────────────────────────────────────────────

const API_URL = import.meta.env.VITE_API_URL as string | undefined;
const USE_API = Boolean(API_URL);

// ── Mock store (in-memory) ────────────────────────────────────────────────────
let store: Ticket[] = [...mockTickets];
const delay = (ms = 700): Promise<void> => new Promise((r) => setTimeout(r, ms));
function generateId(): string { return String(Date.now()).slice(-5); }

// ── Mock adapter ──────────────────────────────────────────────────────────────
const mockAdapter = {
  async getAll(): Promise<Ticket[]> {
    await delay();
    return [...store];
  },

  async create(payload: CreateTicketPayload): Promise<Ticket> {
    await delay(450);
    const ticket: Ticket = {
      id: generateId(),
      ...payload,
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    store = [ticket, ...store];
    return ticket;
  },

  async updateStatus(id: string, status: TicketStatus): Promise<Ticket> {
    await delay(300);
    const index = store.findIndex((t) => t.id === id);
    if (index === -1) throw new Error(`Chamado #${id} não encontrado.`);
    store[index] = { ...store[index], status };
    return store[index];
  },
};

// ── API adapter ───────────────────────────────────────────────────────────────
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    // Tenta extrair mensagem de erro do body JSON
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Erro ${res.status}: ${res.statusText}`);
  }

  return res.json();
}

const apiAdapter = {
  async getAll(): Promise<Ticket[]> {
    return apiFetch<Ticket[]>('/tickets');
  },

  async create(payload: CreateTicketPayload): Promise<Ticket> {
    return apiFetch<Ticket>('/tickets', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateStatus(id: string, status: TicketStatus): Promise<Ticket> {
    return apiFetch<Ticket>(`/tickets/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};

// ── Exporta o adapter correto automaticamente ─────────────────────────────────
export const ticketService = USE_API ? apiAdapter : mockAdapter;

// Útil para exibir o modo atual na UI (opcional)
export const dataMode: 'api' | 'mock' = USE_API ? 'api' : 'mock';
