export type TicketStatus = 'open' | 'in_progress' | 'resolved';
export type TicketPriority = 'low' | 'medium' | 'high';

export interface Ticket {
  id: string;
  title: string;
  client: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
}

export interface CreateTicketPayload {
  title: string;
  client: string;
  description: string;
  priority: TicketPriority;
}

export interface FilterState {
  status: TicketStatus | 'all';
  search: string;
}

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}
