import { TicketStatus } from '@/types';
import styles from './AppHeader.module.css';

interface AppHeaderProps {
  counts: Partial<Record<TicketStatus, number>>;
}

export function AppHeader({ counts }: AppHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <span className={styles.logoDot} aria-hidden="true" />
        SUPORTE
      </div>
      <span className={styles.subtitle}>/ chamados</span>

      <div className={styles.spacer} />

      <nav className={styles.stats} aria-label="Resumo de chamados">
        <Stat value={counts.open        ?? 0} label="abertos"       color="var(--red)"    />
        <Stat value={counts.in_progress ?? 0} label="em andamento"  color="var(--yellow)" />
        <Stat value={counts.resolved    ?? 0} label="resolvidos"    color="var(--green)"  />
      </nav>
    </header>
  );
}

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statNum} style={{ color }}>{value}</span>
      <span>{label}</span>
    </div>
  );
}
