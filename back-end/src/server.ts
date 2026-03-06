import express from 'express';
import cors    from 'cors';
import { initDb } from './db/database';

import ticketsRouter              from './routes/tickets';
import { errorHandler, notFound } from './middlewares/errorHandler';

const app  = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(cors({
  origin:  process.env.FRONTEND_URL ?? 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
}));

app.use(express.json());

app.use((req, _res, next) => {
  console.log(`→ ${req.method} ${req.path}`);
  next();
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/tickets', ticketsRouter);

app.use(notFound);
app.use(errorHandler);

// Inicializa o banco antes de subir o servidor
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n🚀 API rodando em http://localhost:${PORT}`);
      console.log('   GET    /tickets');
      console.log('   POST   /tickets');
      console.log('   PATCH  /tickets/:id/status');
      console.log('   DELETE /tickets/:id');
      console.log('   GET    /health\n');
    });
  })
  .catch((err) => {
    console.error('❌ Falha ao inicializar o banco:', err);
    process.exit(1);
  });