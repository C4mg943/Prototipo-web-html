"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservaController = void 0;
const zod_1 = require("zod");
const api_error_1 = require("../utils/api-error");
const reservaIdSchema = zod_1.z.object({
    id: zod_1.z.coerce.number().int().positive(),
});
const createReservaSchema = zod_1.z.object({
    idInstalacion: zod_1.z.coerce.number().int().positive(),
    fechaReserva: zod_1.z.string().min(1),
    idFranjaInicio: zod_1.z.coerce.number().int().positive(),
    idFranjaFin: zod_1.z.coerce.number().int().positive(),
    equipoSolicitado: zod_1.z.boolean().optional(),
    notas: zod_1.z.string().max(500).optional(),
});
const cancelReservaSchema = zod_1.z.object({
    razonCancelacion: zod_1.z.string().min(1).max(255),
});
class ReservaController {
    constructor(reservaService) {
        this.reservaService = reservaService;
        this.create = async (req, res, next) => {
            try {
                if (!req.authUser) {
                    throw new api_error_1.ApiError(401, 'No autorizado.');
                }
                const payload = createReservaSchema.parse(req.body);
                const data = await this.reservaService.createReserva(req.authUser.id, payload);
                res.status(201).json({
                    success: true,
                    data,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.listMine = async (req, res, next) => {
            try {
                if (!req.authUser) {
                    throw new api_error_1.ApiError(401, 'No autorizado.');
                }
                const data = await this.reservaService.listMyReservas(req.authUser.id);
                res.status(200).json({
                    success: true,
                    data,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.getMineById = async (req, res, next) => {
            try {
                if (!req.authUser) {
                    throw new api_error_1.ApiError(401, 'No autorizado.');
                }
                const { id } = reservaIdSchema.parse(req.params);
                const data = await this.reservaService.getMyReservaById(req.authUser.id, id);
                res.status(200).json({
                    success: true,
                    data,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.cancelMine = async (req, res, next) => {
            try {
                if (!req.authUser) {
                    throw new api_error_1.ApiError(401, 'No autorizado.');
                }
                const { id } = reservaIdSchema.parse(req.params);
                const payload = cancelReservaSchema.parse(req.body);
                const data = await this.reservaService.cancelMyReserva(req.authUser.id, id, payload);
                res.status(200).json({
                    success: true,
                    data,
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.ReservaController = ReservaController;
//# sourceMappingURL=reserva.controller.js.map