import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/api-error';

export function errorMiddleware(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errors: error.errors,
    });
    return;
  }

  if (error instanceof ZodError) {
    const errors = error.issues.map((issue) => issue.message);
    res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos.',
      errors,
    });
    return;
  }

  const message = error instanceof Error ? error.message : 'Error interno del servidor.';
  res.status(500).json({
    success: false,
    message,
  });
}
