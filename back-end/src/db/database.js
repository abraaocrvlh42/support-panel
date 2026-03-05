const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/tickets.db');

// Abre (ou cria) o banco SQLite
const db = new Database(DB_PATH);

// Ativa WAL mode para melhor performance de leitura/escrita
db.pragma('journal_mode = WAL');

// ── Migrations ──────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS tickets (
    id          TEXT    PRIMARY KEY,
    title       TEXT    NOT NULL,
    client      TEXT    NOT NULL,
    description TEXT    NOT NULL,
    status      TEXT    NOT NULL DEFAULT 'open'
                        CHECK(status IN ('open', 'in_progress', 'resolved')),
    priority    TEXT    NOT NULL DEFAULT 'medium'
                        CHECK(priority IN ('low', 'medium', 'high')),
    created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
  );
`);

// ── Seed (só insere se a tabela estiver vazia) ───────────────────────────────
const count = db.prepare('SELECT COUNT(*) as total FROM tickets').get();

if (count.total === 0) {
  const insert = db.prepare(`
    INSERT INTO tickets (id, title, client, description, status, priority, created_at)
    VALUES (@id, @title, @client, @description, @status, @priority, @created_at)
  `);

  const seed = db.transaction((tickets) => {
    for (const ticket of tickets) insert.run(ticket);
  });

  seed([
    {
      id: '001',
      title: 'Sistema de PDV travando na abertura',
      client: 'Mercearia São João',
      description: 'O sistema trava toda vez que tentamos abrir caixa pela manhã. Precisamos de suporte urgente.',
      status: 'open',
      priority: 'high',
      created_at: '2025-03-04T08:30:00Z',
    },
    {
      id: '002',
      title: 'Relatório mensal não gera PDF',
      client: 'Farmácia Central',
      description: 'Ao exportar em PDF, a tela fica carregando indefinidamente e nada é gerado.',
      status: 'in_progress',
      priority: 'medium',
      created_at: '2025-03-03T14:15:00Z',
    },
    {
      id: '003',
      title: 'Atualização de preços no catálogo',
      client: 'Padaria Flor de Lis',
      description: 'Precisamos atualizar a tabela de preços após reajuste do fornecedor.',
      status: 'resolved',
      priority: 'low',
      created_at: '2025-03-01T09:00:00Z',
    },
    {
      id: '004',
      title: 'Impressora fiscal sem comunicação',
      client: 'Açougue do Seu Zé',
      description: 'A impressora ECF parou de comunicar com o sistema. Emissão de cupons bloqueada.',
      status: 'open',
      priority: 'high',
      created_at: '2025-03-04T11:45:00Z',
    },
    {
      id: '005',
      title: 'Integração com marketplace pausou',
      client: 'Loja do Bairro Online',
      description: 'Sincronização de estoque com marketplace parou há 2 dias.',
      status: 'in_progress',
      priority: 'medium',
      created_at: '2025-03-02T16:20:00Z',
    },
    {
      id: '006',
      title: 'Backup automático falhando',
      client: 'Restaurante Bom Sabor',
      description: 'O backup noturno não está sendo realizado. Último backup foi há 5 dias.',
      status: 'open',
      priority: 'high',
      created_at: '2025-03-04T07:00:00Z',
    },
  ]);

  console.log('✅ Banco de dados populado com dados iniciais.');
}

module.exports = db;
