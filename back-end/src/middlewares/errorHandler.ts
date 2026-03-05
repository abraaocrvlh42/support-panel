import { Request, Response, NextFunction } from 'express';

interface HttpError extends Error {
  status?: number;
}

export function errorHandler(
  err: HttpError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
  res.status(err.status ?? 500).json({ error: err.message ?? 'Erro interno do servidor.' });
}

export function notFound(req: Request, res: Response): void {
  res.status(404).json({ error: `Rota ${req.method} ${req.path} não encontrada.` });
}
