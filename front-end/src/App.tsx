import { useState } from 'react';
import { Ticket } from '@/types';
import { useTickets } from '@/hooks/useTickets';
import { useToast } from '@/hooks/useToast';
import { AppHeader } from '@/components/layout';
import {
  TicketFilters,
  TicketList,
  TicketDetail,
  CreateTicketModal,
  ErrorBanner,
} from '@/components/tickets';
import { ToastContainer } from '@/components/ui';
import { STATUS_LABELS } from '@/data/constants';
import styles from './App.module.css';

export default function App() {
  const {
    tickets,
    counts,
    loading,
    error,
    filters,
    setFilters,
    createTicket,
    updateStatus,
    refetch,
  } = useTickets();

  const { toasts, addToast }         = useToast();
  const [showCreate, setShowCreate]  = useState(false);
  const [selected, setSelected]      = useState<Ticket | null>(null);

  const hasActiveFilters = filters.status !== 'all' || filters.search.trim() !== '';

  async function handleCreateTicket(payload: Parameters<typeof createTicket>[0]) {
    await createTicket(payload);
    addToast('Chamado criado com sucesso!');
  }

  async function handleStatusChange(id: string, status: Parameters<typeof updateStatus>[1]) {
    await updateStatus(id, status);
    // keep detail panel in sync
    if (selected?.id === id) {
      setSelected((prev) => prev ? { ...prev, status } : prev);
    }
    addToast(`Status atualizado → ${STATUS_LABELS[status]}`);
  }

  function handleSelectTicket(ticket: Ticket) {
    setSelected((prev) => (prev?.id === ticket.id ? null : ticket));
  }

  return (
    <div className={styles.app}>
      <AppHeader counts={counts} />

      <main className={styles.main}>
        <TicketFilters
          filters={filters}
          onFiltersChange={setFilters}
          onNewTicket={() => setShowCreate(true)}
        />

        {error && <ErrorBanner message={error} onRetry={refetch} />}

        <TicketList
          tickets={tickets}
          loading={loading}
          hasActiveFilters={hasActiveFilters}
          selectedId={selected?.id ?? null}
          onSelect={handleSelectTicket}
          onStatusChange={handleStatusChange}
        />

        {selected && (
          <TicketDetail
            ticket={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </main>

      {showCreate && (
        <CreateTicketModal
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreateTicket}
        />
      )}

      <ToastContainer toasts={toasts} />
    </div>
  );
}
