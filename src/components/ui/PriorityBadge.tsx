import { TicketPriority } from '@/types';
import { PRIORITY_LABELS } from '@/data/constants';
import styles from './Badge.module.css';

interface PriorityBadgeProps {
  priority: TicketPriority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[`priority_${priority}`]}`}>
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
