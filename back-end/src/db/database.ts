import { Pool } from 'pg';

// Conexão com PostgreSQL via variável de ambiente DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// ── Migration ──────────────────────────────────────────────────────────────
export async function initDb(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tickets (
      id          TEXT        PRIMARY KEY,
      title       TEXT        NOT NULL,
      client      TEXT        NOT NULL,
      description TEXT        NOT NULL,
      status      TEXT        NOT NULL DEFAULT 'open'
                              CHECK(status   IN ('open', 'in_progress', 'resolved')),
      priority    TEXT        NOT NULL DEFAULT 'medium'
                              CHECK(priority IN ('low', 'medium', 'high')),
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Seed — só insere se a tabela estiver vazia
  const { rows } = await pool.query('SELECT COUNT(*) AS total FROM tickets');
  const total = parseInt(rows[0].total, 10);

  if (total === 0) {
    const seeds = [
      { id: '001', title: 'Sistema de PDV travando na abertura', client: 'Mercearia São João',   description: 'O sistema trava toda vez que tentamos abrir caixa pela manhã.',    status: 'open',        priority: 'high',   created_at: '2025-03-04T08:30:00Z' },
      { id: '002', title: 'Relatório mensal não gera PDF',       client: 'Farmácia Central',      description: 'Ao exportar em PDF, a tela fica carregando indefinidamente.',     status: 'in_progress', priority: 'medium', created_at: '2025-03-03T14:15:00Z' },
      { id: '003', title: 'Atualização de preços no catálogo',   client: 'Padaria Flor de Lis',   description: 'Precisamos atualizar a tabela de preços após reajuste.',            status: 'resolved',    priority: 'low',    created_at: '2025-03-01T09:00:00Z' },
      { id: '004', title: 'Impressora fiscal sem comunicação',   client: 'Açougue do Seu Zé',     description: 'A impressora ECF parou de comunicar. Emissão de cupons bloqueada.', status: 'open',        priority: 'high',   created_at: '2025-03-04T11:45:00Z' },
      { id: '005', title: 'Integração com marketplace pausou',   client: 'Loja do Bairro Online', description: 'Sincronização de estoque com marketplace parou há 2 dias.',         status: 'in_progress', priority: 'medium', created_at: '2025-03-02T16:20:00Z' },
      { id: '006', title: 'Backup automático falhando',          client: 'Restaurante Bom Sabor', description: 'O backup noturno não está sendo realizado. Último há 5 dias.',      status: 'open',        priority: 'high',   created_at: '2025-03-04T07:00:00Z' },
    ];

    for (const s of seeds) {
      await pool.query(
        `INSERT INTO tickets (id, title, client, description, status, priority, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [s.id, s.title, s.client, s.description, s.status, s.priority, s.created_at],
      );
    }

    console.log('✅ Banco populado com dados iniciais.');
  }

  console.log('🐘 PostgreSQL pronto.');
}

// ── Query helpers ──────────────────────────────────────────────────────────
export async function dbAll<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  const { rows } = await pool.query(sql, params);
  return rows as T[];
}

export async function dbGet<T>(sql: string, params: unknown[] = []): Promise<T | null> {
  const rows = await dbAll<T>(sql, params);
  return rows[0] ?? null;
}

export async function dbRun(sql: string, params: unknown[] = []): Promise<void> {
  await pool.query(sql, params);
}