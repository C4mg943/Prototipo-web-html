"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reservaRouter = void 0;
const express_1 = require("express");
const reserva_controller_1 = require("../controllers/reserva.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const reserva_repository_1 = require("../repositories/reserva.repository");
const user_repository_1 = require("../repositories/user.repository");
const reserva_service_1 = require("../services/reserva.service");
const reservaRouter = (0, express_1.Router)();
exports.reservaRouter = reservaRouter;
const reservaRepository = new reserva_repository_1.ReservaRepository();
const userRepository = new user_repository_1.UserRepository();
const reservaService = new reserva_service_1.ReservaService(reservaRepository, userRepository);
const reservaController = new reserva_controller_1.ReservaController(reservaService);
reservaRouter.use(auth_middleware_1.authMiddleware);
reservaRouter.get('/', reservaController.listMine);
reservaRouter.get('/:id', reservaController.getMineById);
reservaRouter.post('/', reservaController.create);
reservaRouter.patch('/:id', reservaController.updateMine);
reservaRouter.post('/:id/cancel', reservaController.cancelMine);
// Endpoint público para cancelar reservas vencidas (puede llamarse desde un cron job)
reservaRouter.post('/auto-cancel', reservaController.autoCancelExpired);
//# sourceMappingURL=reserva.routes.js.map