import { Ticket, TicketStatus, CreateTicketPayload } from '@/types';
import { mockTickets } from '@/data/mockTickets';

const API_URL = import.meta.env.VITE_API_URL as string | undefined;
const USE_API = Boolean(API_URL);

// ── Mock store ────────────────────────────────────────────────────────────────
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
  async delete(id: string): Promise<void> {
    await delay(300);
    store = store.filter((t) => t.id !== id);
  },
};

// ── API adapter ───────────────────────────────────────────────────────────────
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Erro ${res.status}: ${res.statusText}`);
  }
  if (res.status === 204) return undefined as T;
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
  async delete(id: string): Promise<void> {
    return apiFetch(`/tickets/${id}`, { method: 'DELETE' });
  },
};

export const ticketService = USE_API ? apiAdapter : mockAdapter;
export const dataMode: 'api' | 'mock' = USE_API ? 'api' : 'mock';
