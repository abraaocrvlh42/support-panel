import path from 'path';
import fs   from 'fs';
import initSqlJs, { Database, SqlValue } from 'sql.js';

const DB_PATH = path.join(__dirname, '../../data/tickets.db');

// Singleton — uma única conexão para toda a vida do processo
let _db: Database | null = null;

// Estende o tipo Database com o método save que vamos injetar
interface AppDatabase extends Database {
  save: () => void;
}

export async function getDb(): Promise<AppDatabase> {
  if (_db) return _db as AppDatabase;

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    _db = new SQL.Database(buffer);
  } else {
    _db = new SQL.Database();
  }

  // Injeta método save para persistir no disco após escritas
  (_db as AppDatabase).save = function () {
    const data   = this.export();
    const buffer = Buffer.from(data);
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, buffer);
  };

  // ── Migration ──────────────────────────────────────────────────────────────
  _db.run(`
    CREATE TABLE IF NOT EXISTS tickets (
      id          TEXT PRIMARY KEY,
      title       TEXT NOT NULL,
      client      TEXT NOT NULL,
      description TEXT NOT NULL,
      status      TEXT NOT NULL DEFAULT 'open'
                  CHECK(status   IN ('open', 'in_progress', 'resolved')),
      priority    TEXT NOT NULL DEFAULT 'medium'
                  CHECK(priority IN ('low', 'medium', 'high')),
      created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
    );
  `);

  // ── Seed ───────────────────────────────────────────────────────────────────
  const result = _db.exec('SELECT COUNT(*) AS total FROM tickets');
  const total  = result[0]?.values[0][0] as number ?? 0;

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
      _db.run(
        'INSERT INTO tickets (id, title, client, description, status, priority, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [s.id, s.title, s.client, s.description, s.status, s.priority, s.created_at],
      );
    }

    (_db as AppDatabase).save();
    console.log('✅ Banco populado com dados iniciais.');
  }

  console.log(`💾 SQLite pronto → ${DB_PATH}`);
  return _db as AppDatabase;
}

// ── Typed query helpers ────────────────────────────────────────────────────────

/** Executa SELECT e retorna array de objetos tipados. */
export function dbAll<T>(db: Database, sql: string, params: SqlValue[] = []): T[] {
  const result = db.exec(sql, params);
  if (!result.length) return [];
  const { columns, values } = result[0];
  return values.map((row) =>
    Object.fromEntries(columns.map((col, i) => [col, row[i]])) as T,
  );
}

/** Executa SELECT e retorna apenas o primeiro resultado. */
export function dbGet<T>(db: Database, sql: string, params: SqlValue[] = []): T | null {
  return dbAll<T>(db, sql, params)[0] ?? null;
}

/** Executa INSERT / UPDATE / DELETE e persiste no disco. */
export function dbRun(db: AppDatabase, sql: string, params: SqlValue[] = []): void {
  db.run(sql, params);
  db.save();
}
