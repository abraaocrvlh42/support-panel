import { Ticket } from '@/types';
import { StatusBadge, PriorityBadge } from '@/components/ui';
import { formatDate, formatTime } from '@/utils/date';
import styles from './TicketDetail.module.css';

interface TicketDetailProps {
  ticket: Ticket;
  onClose: () => void;
}

export function TicketDetail({ ticket, onClose }: TicketDetailProps) {
  return (
    <section className={styles.panel} aria-label={`Detalhes do chamado ${ticket.id}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>{ticket.title}</h2>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar detalhes">×</button>
      </div>

      <div className={styles.meta}>
        <MetaItem label="ID"         value={`#${ticket.id}`}                        mono />
        <MetaItem label="Cliente"    value={ticket.client}                           mono />
        <MetaItem label="Criado em"  value={`${formatDate(ticket.createdAt)} ${formatTime(ticket.createdAt)}`} mono />
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Status</span>
          <StatusBadge status={ticket.status} />
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Prioridade</span>
          <PriorityBadge priority={ticket.priority} />
        </div>
      </div>

      <div className={styles.descLabel}>Descrição</div>
      <p className={styles.description}>{ticket.description}</p>
    </section>
  );
}

function MetaItem({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className={styles.metaItem}>
      <span className={styles.metaLabel}>{label}</span>
      <span className={mono ? styles.metaValueMono : styles.metaValue}>{value}</span>
    </div>
  );
}
