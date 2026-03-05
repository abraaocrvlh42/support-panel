import { TicketStatus } from '@/types';
import { STATUS_LABELS } from '@/data/constants';
import styles from './Badge.module.css';

interface StatusBadgeProps {
  status: TicketStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[`status_${status}`]}`}>
      <span className={styles.dot} />
      {STATUS_LABELS[status]}
    </span>
  );
}
