import { Router } from 'express';
import { ReservaController } from '../controllers/reserva.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { ReservaRepository } from '../repositories/reserva.repository';
import { ReservaService } from '../services/reserva.service';

const reservaRouter = Router();

const reservaRepository = new ReservaRepository();
const reservaService = new ReservaService(reservaRepository);
const reservaController = new ReservaController(reservaService);

reservaRouter.use(authMiddleware);

reservaRouter.get('/', reservaController.listMine);
reservaRouter.get('/:id', reservaController.getMineById);
reservaRouter.post('/', reservaController.create);
reservaRouter.patch('/:id', reservaController.updateMine);
reservaRouter.post('/:id/cancel', reservaController.cancelMine);

export { reservaRouter };
