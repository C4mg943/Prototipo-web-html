import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { ApiError } from '../utils/api-error';
import { AuthService } from '../services/auth.service';
import { verifyTempToken } from '../utils/auth.js';

const registerSchema = z.object({
  nombres: z.string().min(1),
  apellidos: z.string().min(1),
  correo: z.string().email(),
  contrasena: z.string().min(8),
});

const loginSchema = z.object({
  correo: z.string().email(),
  contrasena: z.string().min(6),
});

const verify2FASchema = z.object({
  code: z.string().length(6, 'El código debe tener 6 dígitos'),
});

const disable2FASchema = z.object({
  contrasena: z.string().min(6),
});

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payload = registerSchema.parse(req.body);
      const data = await this.authService.register(payload);

      res.status(201).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payload = loginSchema.parse(req.body);
      const data = await this.authService.login(payload);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.authUser) {
        throw new ApiError(401, 'No autorizado.');
      }

      const data = await this.authService.me(req.authUser.id);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.authService.logout();

      res.status(200).json({
        success: true,
        message: data.message,
      });
    } catch (error) {
      next(error);
    }
  };

  setup2FA = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.authUser) {
        throw new ApiError(401, 'No autorizado.');
      }

      const userEmail = req.authUser.email;
      const data = await this.authService.setup2FA(req.authUser.id, userEmail);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  confirm2FA = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.authUser) {
        throw new ApiError(401, 'No autorizado.');
      }

      const payload = verify2FASchema.parse(req.body);
      const data = await this.authService.confirm2FA(req.authUser.id, payload.code);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  disable2FA = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.authUser) {
        throw new ApiError(401, 'No autorizado.');
      }

      const payload = disable2FASchema.parse(req.body);
      const data = await this.authService.disable2FA(req.authUser.id, payload.contrasena);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  get2FAStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.authUser) {
        throw new ApiError(401, 'No autorizado.');
      }

      const data = await this.authService.get2FAStatus(req.authUser.id);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  verify2FA = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { tempToken, code } = req.body;

      if (!tempToken || !code) {
        throw new ApiError(400, 'Se requiere token temporal y código de verificación.');
      }

      const decoded = verifyTempToken(tempToken);

      if (decoded.step !== '2fa') {
        throw new ApiError(400, 'Token inválido.');
      }

      const data = await this.authService.verify2FA(decoded.userId, code);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };
}
