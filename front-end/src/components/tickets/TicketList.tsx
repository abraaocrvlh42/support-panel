import { Ticket, TicketStatus } from '@/types';
import { TicketRow } from './TicketRow';
import styles from './TicketList.module.css';

interface TicketListProps {
  tickets: Ticket[];
  loading: boolean;
  hasActiveFilters: boolean;
  selectedId: string | null;
  onSelect: (ticket: Ticket) => void;
  onStatusChange: (id: string, status: TicketStatus) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function TicketList({ tickets, loading, hasActiveFilters, selectedId, onSelect, onStatusChange, onDelete }: TicketListProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.tableHeader} aria-hidden="true">
        <div className={styles.th}>ID</div>
        <div className={styles.th}>Título</div>
        <div className={styles.th}>Cliente</div>
        <div className={styles.th}>Status</div>
        <div className={styles.th}>Prioridade</div>
        <div className={styles.th}>Alterar status</div>
        <div className={styles.th}>Criado em</div>
        <div className={styles.th}></div>
      </div>

      {loading && <LoadingState />}

      {!loading && tickets.length === 0 && (
        <EmptyState hasFilters={hasActiveFilters} />
      )}

      {!loading && tickets.map((ticket) => (
        <TicketRow
          key={ticket.id}
          ticket={ticket}
          isSelected={selectedId === ticket.id}
          onSelect={onSelect}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

function LoadingState() {
  return (
    <div className={styles.stateContainer} role="status" aria-label="Carregando chamados">
      <div className={styles.spinner} aria-hidden="true" />
      <p className={styles.stateTitle}>Carregando chamados…</p>
    </div>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className={styles.stateContainer}>
      <div className={styles.stateIcon} aria-hidden="true">
        {hasFilters ? '🔍' : '📭'}
      </div>
      <p className={styles.stateTitle}>
        {hasFilters ? 'Nenhum resultado encontrado' : 'Nenhum chamado ainda'}
      </p>
      <p className={styles.stateDesc}>
        {hasFilters ? 'Tente ajustar os filtros ou a busca.' : 'Crie o primeiro chamado usando o botão acima.'}
      </p>
    </div>
  );
}
