const db = require('../db/database');

// Gera um ID único baseado em timestamp
function generateId() {
  return String(Date.now()).slice(-6);
}

// ── GET /tickets ─────────────────────────────────────────────────────────────
function getAll(req, res) {
  try {
    const tickets = db.prepare(`
      SELECT
        id,
        title,
        client,
        description,
        status,
        priority,
        created_at AS createdAt
      FROM tickets
      ORDER BY created_at DESC
    `).all();

    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar chamados.', detail: err.message });
  }
}

// ── POST /tickets ─────────────────────────────────────────────────────────────
function create(req, res) {
  const { title, client, description, priority } = req.body;

  // Validação
  const errors = {};
  if (!title?.trim())       errors.title       = 'Título é obrigatório.';
  if (!client?.trim())      errors.client      = 'Cliente é obrigatório.';
  if (!description?.trim()) errors.description = 'Descrição é obrigatória.';

  const VALID_PRIORITIES = ['low', 'medium', 'high'];
  if (!priority || !VALID_PRIORITIES.includes(priority)) {
    errors.priority = 'Prioridade inválida. Use: low, medium ou high.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: 'Dados inválidos.', fields: errors });
  }

  try {
    const id = generateId();

    db.prepare(`
      INSERT INTO tickets (id, title, client, description, priority)
      VALUES (@id, @title, @client, @description, @priority)
    `).run({ id, title: title.trim(), client: client.trim(), description: description.trim(), priority });

    const created = db.prepare(`
      SELECT id, title, client, description, status, priority, created_at AS createdAt
      FROM tickets WHERE id = ?
    `).get(id);

    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar chamado.', detail: err.message });
  }
}

// ── PATCH /tickets/:id/status ─────────────────────────────────────────────────
function updateStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  const VALID_STATUSES = ['open', 'in_progress', 'resolved'];
  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: 'Status inválido.',
      detail: 'Use: open, in_progress ou resolved.',
    });
  }

  try {
    const ticket = db.prepare('SELECT id FROM tickets WHERE id = ?').get(id);
    if (!ticket) {
      return res.status(404).json({ error: `Chamado #${id} não encontrado.` });
    }

    db.prepare('UPDATE tickets SET status = ? WHERE id = ?').run(status, id);

    const updated = db.prepare(`
      SELECT id, title, client, description, status, priority, created_at AS createdAt
      FROM tickets WHERE id = ?
    `).get(id);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar status.', detail: err.message });
  }
}

module.exports = { getAll, create, updateStatus };
