const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const ticketsRouter = require('./routes/tickets');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

// Garante que a pasta /data existe para o SQLite
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middlewares globais ───────────────────────────────────────────────────────
app.use(cors({
  origin: 'http://localhost:5173', // URL do Vite dev server
  methods: ['GET', 'POST', 'PATCH'],
}));

app.use(express.json());

// Log de requisições em desenvolvimento
app.use((req, _res, next) => {
  console.log(`→ ${req.method} ${req.path}`);
  next();
});

// ── Rotas ─────────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.use('/tickets', ticketsRouter);

// ── Handlers de erro ──────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 API rodando em http://localhost:${PORT}`);
  console.log(`   GET    /tickets`);
  console.log(`   POST   /tickets`);
  console.log(`   PATCH  /tickets/:id/status`);
  console.log(`   GET    /health\n`);
});
