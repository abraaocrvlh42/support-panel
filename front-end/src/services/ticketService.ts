import { Ticket, TicketStatus, CreateTicketPayload } from '@/types';
import { mockTickets } from '@/data/mockTickets';

/**
 * In-memory data store — simulates a backend API.
 * To switch to a real API, replace the methods below with fetch() calls.
 *
 * Example real implementation:
 *   async getAll() { return fetch('/api/tickets').then(r => r.json()) }
 */
let store: Ticket[] = [...mockTickets];

const delay = (ms = 700): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

function generateId(): string {
  return String(Date.now()).slice(-5);
}

export const ticketService = {
  async getAll(): Promise<Ticket[]> {
    await delay();
    return [...store];
  },

  async create(payload: CreateTicketPayload): Promise<Ticket> {
    await delay(450);
    const newTicket: Ticket = {
      id: generateId(),
      ...payload,
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    store = [newTicket, ...store];
    return newTicket;
  },

  async updateStatus(id: string, status: TicketStatus): Promise<Ticket> {
    await delay(300);
    const index = store.findIndex((t) => t.id === id);
    if (index === -1) throw new Error(`Chamado #${id} não encontrado.`);
    store[index] = { ...store[index], status };
    return store[index];
  },
};
