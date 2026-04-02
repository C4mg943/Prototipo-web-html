import { NextFunction, Request, Response } from 'express';
import { AuthenticatedUser } from '../models/user.model';
import { ApiError } from '../utils/api-error';
import { verifyAccessToken } from '../utils/auth';

declare module 'express-serve-static-core' {
  interface Request {
    authUser?: AuthenticatedUser;
  }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    next(new ApiError(401, 'No autorizado. Token no proporcionado.'));
    return;
  }

  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    next(new ApiError(401, 'No autorizado. Formato de token inválido.'));
    return;
  }

  try {
    const payload = verifyAccessToken(token);

    req.authUser = {
      id: payload.sub,
      roleId: payload.roleId,
      email: payload.email,
    };

    next();
  } catch {
    next(new ApiError(401, 'No autorizado. Token inválido o expirado.'));
  }
}
