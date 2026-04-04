import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { ReservaService } from '../services/reserva.service';
import { ApiError } from '../utils/api-error';

const reservaIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const createReservaSchema = z.object({
  idInstalacion: z.coerce.number().int().positive(),
  fechaReserva: z.string().min(1),
  idFranjaInicio: z.coerce.number().int().positive(),
  idFranjaFin: z.coerce.number().int().positive(),
  equipoSolicitado: z.boolean().optional(),
  notas: z.string().max(500).optional(),
});

const updateReservaSchema = z.object({
  fechaReserva: z.string().min(1),
  idFranjaInicio: z.coerce.number().int().positive(),
  idFranjaFin: z.coerce.number().int().positive(),
  equipoSolicitado: z.boolean().optional(),
  notas: z.string().max(500).optional(),
});

const cancelReservaSchema = z.object({
  razonCancelacion: z.string().min(1).max(255),
});

export class ReservaController {
  constructor(private readonly reservaService: ReservaService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.authUser) {
        throw new ApiError(401, 'No autorizado.');
      }

      const payload = createReservaSchema.parse(req.body);
      const data = await this.reservaService.createReserva(req.authUser.id, payload);

      res.status(201).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  listMine = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.authUser) {
        throw new ApiError(401, 'No autorizado.');
      }

      const data = await this.reservaService.listMyReservas(req.authUser.id);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  updateMine = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.authUser) {
        throw new ApiError(401, 'No autorizado.');
      }

      const { id } = reservaIdSchema.parse(req.params);
      const payload = updateReservaSchema.parse(req.body);
      const data = await this.reservaService.updateMyReserva(req.authUser.id, id, payload);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  getMineById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.authUser) {
        throw new ApiError(401, 'No autorizado.');
      }

      const { id } = reservaIdSchema.parse(req.params);
      const data = await this.reservaService.getMyReservaById(req.authUser.id, id);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  cancelMine = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.authUser) {
        throw new ApiError(401, 'No autorizado.');
      }

      const { id } = reservaIdSchema.parse(req.params);
      const payload = cancelReservaSchema.parse(req.body);
      const data = await this.reservaService.cancelMyReserva(req.authUser.id, id, payload);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };
}
