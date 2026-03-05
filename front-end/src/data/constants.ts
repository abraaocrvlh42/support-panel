import { TicketStatus, TicketPriority } from '@/types';

export const STATUS_LABELS: Record<TicketStatus, string> = {
  open:        'Aberto',
  in_progress: 'Em andamento',
  resolved:    'Resolvido',
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low:    'Baixa',
  medium: 'Média',
  high:   'Alta',
};

export const STATUS_FILTER_OPTIONS: { value: TicketStatus | 'all'; label: string }[] = [
  { value: 'all',         label: 'Todos'         },
  { value: 'open',        label: 'Aberto'        },
  { value: 'in_progress', label: 'Em andamento'  },
  { value: 'resolved',    label: 'Resolvido'     },
];
