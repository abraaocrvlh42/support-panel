// Middleware de tratamento de erros global
// Captura qualquer erro não tratado e retorna JSON padronizado
function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Erro interno do servidor.',
  });
}

// Middleware para rotas não encontradas
function notFound(req, res) {
  res.status(404).json({ error: `Rota ${req.method} ${req.path} não encontrada.` });
}

module.exports = { errorHandler, notFound };
