import { useState, useEffect, useCallback } from 'react';
import { Ticket, TicketStatus, CreateTicketPayload, FilterState } from '@/types';
import { ticketService } from '@/services/ticketService';

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading]  = useState(true);
  const [error, setError]      = useState<string | null>(null);
  const [filters, setFilters]  = useState<FilterState>({ status: 'all', search: '' });

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ticketService.getAll();
      setTickets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar chamados.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  // ── Create ─────────────────────────────────────────────────────────────────
  const createTicket = useCallback(async (payload: CreateTicketPayload): Promise<Ticket> => {
    const created = await ticketService.create(payload);
    setTickets((prev) => [created, ...prev]);
    return created;
  }, []);

  // ── Update status ──────────────────────────────────────────────────────────
  const updateStatus = useCallback(async (id: string, status: TicketStatus): Promise<void> => {
    const updated = await ticketService.updateStatus(id, status);
    setTickets((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }, []);

  // ── Derived: filtered list ─────────────────────────────────────────────────
  const filteredTickets = tickets.filter((t) => {
    const matchStatus = filters.status === 'all' || t.status === filters.status;
    const q = filters.search.toLowerCase().trim();
    const matchSearch =
      !q ||
      t.title.toLowerCase().includes(q) ||
      t.client.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  // ── Derived: counts ────────────────────────────────────────────────────────
  const counts = tickets.reduce(
    (acc, t) => { acc[t.status] = (acc[t.status] ?? 0) + 1; return acc; },
    {} as Partial<Record<TicketStatus, number>>,
  );

  return {
    tickets: filteredTickets,
    totalTickets: tickets.length,
    counts,
    loading,
    error,
    filters,
    setFilters,
    createTicket,
    updateStatus,
    refetch: fetchTickets,
  };
}
