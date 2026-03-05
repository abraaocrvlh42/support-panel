import express from 'express';
import cors    from 'cors';

import ticketsRouter           from './routes/tickets';
import { errorHandler, notFound } from './middlewares/errorHandler';

const app  = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

// ── Middlewares globais ───────────────────────────────────────────────────────
app.use(cors({
  origin:  process.env.FRONTEND_URL ?? 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH'],
}));

app.use(express.json());

// Log de requisições
app.use((req, _res, next) => {
  console.log(`→ ${req.method} ${req.path}`);
  next();
});

// ── Rotas ─────────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/tickets', ticketsRouter);

// ── Error handlers ────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 API rodando em http://localhost:${PORT}`);
  console.log('   GET    /tickets');
  console.log('   POST   /tickets');
  console.log('   PATCH  /tickets/:id/status');
  console.log('   GET    /health\n');
});
