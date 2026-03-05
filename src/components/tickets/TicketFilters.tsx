import { FilterState, TicketStatus } from '@/types';
import { STATUS_FILTER_OPTIONS } from '@/data/constants';
import styles from './TicketFilters.module.css';

interface TicketFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onNewTicket: () => void;
}

export function TicketFilters({ filters, onFiltersChange, onNewTicket }: TicketFiltersProps) {
  function handleStatusChange(status: TicketStatus | 'all') {
    onFiltersChange({ ...filters, status });
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    onFiltersChange({ ...filters, search: e.target.value });
  }

  return (
    <div className={styles.controls}>
      {/* Search */}
      <div className={styles.searchWrap}>
        <SearchIcon />
        <input
          className={styles.searchInput}
          type="search"
          placeholder="Buscar por título ou cliente…"
          value={filters.search}
          onChange={handleSearchChange}
          aria-label="Buscar chamados"
        />
      </div>

      {/* Status tabs */}
      <div className={styles.tabs} role="group" aria-label="Filtrar por status">
        {STATUS_FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`${styles.tab} ${filters.status === opt.value ? styles.tabActive : ''}`}
            onClick={() => handleStatusChange(opt.value)}
            aria-pressed={filters.status === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* New ticket */}
      <div className={styles.actions}>
        <button className={styles.btnPrimary} onClick={onNewTicket} aria-label="Criar novo chamado">
          <PlusIcon />
          Novo chamado
        </button>
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg className={styles.searchIcon} width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
