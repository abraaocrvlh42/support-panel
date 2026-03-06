import { Request, Response } from 'express';
import { dbAll, dbGet, dbRun } from '../db/database';
import { Ticket, CreateTicketBody, UpdateStatusBody, TicketStatus, TicketPriority } from '../types';

const VALID_PRIORITIES: TicketPriority[] = ['low', 'medium', 'high'];
const VALID_STATUSES:   TicketStatus[]   = ['open', 'in_progress', 'resolved'];

const SELECT_TICKET = `
  SELECT id, title, client, description, status, priority, created_at AS "createdAt"
  FROM tickets
`;

function generateId(): string {
  return String(Date.now()).slice(-6);
}

// ── GET /tickets ──────────────────────────────────────────────────────────────
export async function getAll(_req: Request, res: Response): Promise<void> {
  try {
    const tickets = await dbAll<Ticket>(`${SELECT_TICKET} ORDER BY created_at DESC`);
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar chamados.', detail: (err as Error).message });
  }
}

// ── POST /tickets ─────────────────────────────────────────────────────────────
export async function create(req: Request<object, object, CreateTicketBody>, res: Response): Promise<void> {
  const { title, client, description, priority } = req.body;

  const errors: Partial<Record<keyof CreateTicketBody, string>> = {};
  if (!title?.trim())                       errors.title       = 'Título é obrigatório.';
  if (!client?.trim())                      errors.client      = 'Cliente é obrigatório.';
  if (!description?.trim())                 errors.description = 'Descrição é obrigatória.';
  if (!VALID_PRIORITIES.includes(priority)) errors.priority    = 'Prioridade inválida.';

  if (Object.keys(errors).length > 0) {
    res.status(400).json({ error: 'Dados inválidos.', fields: errors });
    return;
  }

  try {
    const id = generateId();

    await dbRun(
      `INSERT INTO tickets (id, title, client, description, priority)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, title.trim(), client.trim(), description.trim(), priority],
    );

    const created = await dbGet<Ticket>(`${SELECT_TICKET} WHERE id = $1`, [id]);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar chamado.', detail: (err as Error).message });
  }
}

// ── PATCH /tickets/:id/status ─────────────────────────────────────────────────
export async function updateStatus(
  req: Request<{ id: string }, object, UpdateStatusBody>,
  res: Response,
): Promise<void> {
  const { id }     = req.params;
  const { status } = req.body;

  if (!VALID_STATUSES.includes(status)) {
    res.status(400).json({ error: 'Status inválido.' });
    return;
  }

  try {
    const exists = await dbGet<Ticket>('SELECT id FROM tickets WHERE id = $1', [id]);
    if (!exists) {
      res.status(404).json({ error: `Chamado #${id} não encontrado.` });
      return;
    }

    await dbRun('UPDATE tickets SET status = $1 WHERE id = $2', [status, id]);

    const updated = await dbGet<Ticket>(`${SELECT_TICKET} WHERE id = $1`, [id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar status.', detail: (err as Error).message });
  }
}

// ── DELETE /tickets/:id ───────────────────────────────────────────────────────
export async function remove(
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  const { id } = req.params;

  try {
    const exists = await dbGet<Ticket>('SELECT id FROM tickets WHERE id = $1', [id]);
    if (!exists) {
      res.status(404).json({ error: `Chamado #${id} não encontrado.` });
      return;
    }

    await dbRun('DELETE FROM tickets WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar chamado.', detail: (err as Error).message });
  }
}
