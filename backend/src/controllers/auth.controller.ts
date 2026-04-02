import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { ApiError } from '../utils/api-error';
import { AuthService } from '../services/auth.service';

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
}
