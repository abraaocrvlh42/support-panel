import { useState } from 'react';
import { Ticket, TicketStatus } from '@/types';
import { STATUS_LABELS } from '@/data/constants';
import { StatusBadge, PriorityBadge } from '@/components/ui';
import { formatDate, formatTime } from '@/utils/date';
import styles from './TicketRow.module.css';

interface TicketRowProps {
  ticket: Ticket;
  isSelected: boolean;
  onSelect: (ticket: Ticket) => void;
  onStatusChange: (id: string, status: TicketStatus) => Promise<void>;
}

export function TicketRow({ ticket, isSelected, onSelect, onStatusChange }: TicketRowProps) {
  const [updating, setUpdating] = useState(false);

  async function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    e.stopPropagation();
    setUpdating(true);
    try {
      await onStatusChange(ticket.id, e.target.value as TicketStatus);
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div
      className={`${styles.row} ${isSelected ? styles.rowSelected : ''}`}
      onClick={() => onSelect(ticket)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(ticket)}
      aria-label={`Chamado ${ticket.id}: ${ticket.title}. Status: ${STATUS_LABELS[ticket.status]}`}
      aria-pressed={isSelected}
    >
      <div className={`${styles.cell} ${styles.cellId}`}>#{ticket.id}</div>

      <div className={`${styles.cell} ${styles.cellTitle}`}>
        <span className={styles.titleText}>{ticket.title}</span>
      </div>

      <div className={`${styles.cell} ${styles.cellClient}`}>{ticket.client}</div>

      <div className={styles.cell}>
        <StatusBadge status={ticket.status} />
      </div>

      <div className={styles.cell}>
        <PriorityBadge priority={ticket.priority} />
      </div>

      <div className={styles.cell} onClick={(e) => e.stopPropagation()}>
        <select
          className={styles.statusSelect}
          value={ticket.status}
          onChange={handleStatusChange}
          disabled={updating}
          aria-label={`Alterar status do chamado ${ticket.id}`}
        >
          <option value="open">Aberto</option>
          <option value="in_progress">Em andamento</option>
          <option value="resolved">Resolvido</option>
        </select>
      </div>

      <div className={`${styles.cell} ${styles.cellDate}`}>
        {formatDate(ticket.createdAt)}
        <span className={styles.time}>{formatTime(ticket.createdAt)}</span>
      </div>
    </div>
  );
}
