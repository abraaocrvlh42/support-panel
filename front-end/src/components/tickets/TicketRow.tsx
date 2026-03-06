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
  onDelete: (id: string) => Promise<void>;
}

export function TicketRow({ ticket, isSelected, onSelect, onStatusChange, onDelete }: TicketRowProps) {
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    e.stopPropagation();
    setUpdating(true);
    try {
      await onStatusChange(ticket.id, e.target.value as TicketStatus);
    } finally {
      setUpdating(false);
    }
  }

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(`Deletar o chamado "${ticket.title}"?`)) return;
    setDeleting(true);
    try {
      await onDelete(ticket.id);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      className={`${styles.row} ${isSelected ? styles.rowSelected : ''} ${deleting ? styles.rowDeleting : ''}`}
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
      <div className={styles.cell}><StatusBadge status={ticket.status} /></div>
      <div className={styles.cell}><PriorityBadge priority={ticket.priority} /></div>
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
      <div className={styles.cell} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.deleteBtn}
          onClick={handleDelete}
          disabled={deleting}
          aria-label={`Deletar chamado ${ticket.id}`}
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}