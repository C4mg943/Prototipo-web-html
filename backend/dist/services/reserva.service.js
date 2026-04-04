"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservaService = void 0;
const api_error_1 = require("../utils/api-error");
const pendingStatusCode = 'PENDIENTE';
const canceledStatusCode = 'CANCELADA';
class ReservaService {
    constructor(reservaRepository) {
        this.reservaRepository = reservaRepository;
    }
    async createReserva(userId, input) {
        const pendingStatus = await this.findActiveStatusByCode(pendingStatusCode);
        const instalacion = await this.reservaRepository.findInstalacionById(input.idInstalacion);
        if (!instalacion || !instalacion.esta_activo) {
            throw new api_error_1.ApiError(404, 'Instalación no encontrada o inactiva.');
        }
        const startSlot = await this.reservaRepository.findFranjaById(input.idFranjaInicio);
        const endSlot = await this.reservaRepository.findFranjaById(input.idFranjaFin);
        this.validateSlots(startSlot, endSlot);
        // Type guard: validateSlots throws if either is null
        if (!startSlot || !endSlot) {
            throw new api_error_1.ApiError(500, 'Error interno: franja horaria no se pudo cargar correctamente.');
        }
        const slotDurationHours = endSlot.orden_clasificacion - startSlot.orden_clasificacion;
        if (slotDurationHours < 1 || slotDurationHours > 3) {
            throw new api_error_1.ApiError(400, 'La duración permitida para la reserva es entre 1 y 3 horas.');
        }
        const fechaReserva = this.normalizeDate(input.fechaReserva);
        const comienzaEn = this.buildUtcDate(fechaReserva, startSlot.hora_inicio);
        const terminaEn = this.buildUtcDate(fechaReserva, endSlot.hora_fin);
        const notas = this.normalizeOptionalText(input.notas);
        try {
            return await this.reservaRepository.createReserva({
                idUsuario: userId,
                idInstalacion: input.idInstalacion,
                idEstado: pendingStatus.id,
                fechaReserva,
                idFranjaInicio: input.idFranjaInicio,
                idFranjaFin: input.idFranjaFin,
                comienzaEn,
                terminaEn,
                duracionHoras: slotDurationHours,
                equipoSolicitado: input.equipoSolicitado ?? false,
                notas,
            });
        }
        catch (error) {
            throw this.mapDatabaseError(error);
        }
    }
    async listMyReservas(userId) {
        return this.reservaRepository.listReservasByUser(userId);
    }
    async getMyReservaById(userId, reservaId) {
        const reserva = await this.reservaRepository.findReservaById(reservaId);
        if (!reserva) {
            throw new api_error_1.ApiError(404, 'Reserva no encontrada.');
        }
        this.ensureOwnership(userId, reserva.idUsuario);
        return reserva;
    }
    async cancelMyReserva(userId, reservaId, input) {
        const reserva = await this.reservaRepository.findReservaById(reservaId);
        if (!reserva) {
            throw new api_error_1.ApiError(404, 'Reserva no encontrada.');
        }
        this.ensureOwnership(userId, reserva.idUsuario);
        if (reserva.estado.codigo === canceledStatusCode) {
            throw new api_error_1.ApiError(409, 'La reserva ya está cancelada.');
        }
        if (reserva.estado.codigo === 'COMPLETADA' || reserva.estado.codigo === 'NO_PRESENTO') {
            throw new api_error_1.ApiError(409, 'No se puede cancelar una reserva finalizada.');
        }
        const canceledStatus = await this.findActiveStatusByCode(canceledStatusCode);
        const reason = this.normalizeRequiredText(input.razonCancelacion, 'La razón de cancelación es obligatoria.');
        return this.reservaRepository.cancelReserva(reservaId, canceledStatus.id, reason, userId);
    }
    async updateMyReserva(userId, reservaId, input) {
        const reserva = await this.reservaRepository.findReservaById(reservaId);
        if (!reserva) {
            throw new api_error_1.ApiError(404, 'Reserva no encontrada.');
        }
        this.ensureOwnership(userId, reserva.idUsuario);
        if (reserva.estado.codigo === canceledStatusCode) {
            throw new api_error_1.ApiError(409, 'No se puede editar una reserva cancelada.');
        }
        if (reserva.estado.codigo === 'COMPLETADA' || reserva.estado.codigo === 'NO_PRESENTO') {
            throw new api_error_1.ApiError(409, 'No se puede editar una reserva finalizada.');
        }
        const startSlot = await this.reservaRepository.findFranjaById(input.idFranjaInicio);
        const endSlot = await this.reservaRepository.findFranjaById(input.idFranjaFin);
        this.validateSlots(startSlot, endSlot);
        if (!startSlot || !endSlot) {
            throw new api_error_1.ApiError(500, 'Error interno: franja horaria no se pudo cargar correctamente.');
        }
        const slotDurationHours = endSlot.orden_clasificacion - startSlot.orden_clasificacion;
        if (slotDurationHours < 1 || slotDurationHours > 3) {
            throw new api_error_1.ApiError(400, 'La duración permitida para la reserva es entre 1 y 3 horas.');
        }
        const fechaReserva = this.normalizeDate(input.fechaReserva);
        const comienzaEn = this.buildUtcDate(fechaReserva, startSlot.hora_inicio);
        const terminaEn = this.buildUtcDate(fechaReserva, endSlot.hora_fin);
        const notas = this.normalizeOptionalText(input.notas);
        try {
            return await this.reservaRepository.updateReserva({
                idReserva: reservaId,
                idFranjaInicio: input.idFranjaInicio,
                idFranjaFin: input.idFranjaFin,
                fechaReserva,
                comienzaEn,
                terminaEn,
                duracionHoras: slotDurationHours,
                equipoSolicitado: input.equipoSolicitado ?? false,
                notas,
                actorUserId: userId,
            });
        }
        catch (error) {
            throw this.mapDatabaseError(error);
        }
    }
    validateSlots(startSlot, endSlot) {
        if (!startSlot || !endSlot || !startSlot.esta_activo || !endSlot.esta_activo) {
            throw new api_error_1.ApiError(404, 'Franja horaria no encontrada o inactiva.');
        }
        if (startSlot.id >= endSlot.id) {
            throw new api_error_1.ApiError(400, 'La franja de inicio debe ser menor que la franja de fin.');
        }
        if (startSlot.orden_clasificacion >= endSlot.orden_clasificacion) {
            throw new api_error_1.ApiError(400, 'El orden de las franjas horarias es inválido.');
        }
    }
    ensureOwnership(requestUserId, ownerUserId) {
        if (requestUserId !== ownerUserId) {
            throw new api_error_1.ApiError(403, 'No tienes permisos sobre esta reserva.');
        }
    }
    async findActiveStatusByCode(code) {
        const status = await this.reservaRepository.findEstadoByCodigo(code);
        if (!status || !status.esta_activo) {
            throw new api_error_1.ApiError(500, `No se encontró el estado de reserva ${code}.`);
        }
        return status;
    }
    normalizeDate(dateValue) {
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        if (!datePattern.test(dateValue)) {
            throw new api_error_1.ApiError(400, 'fechaReserva debe tener formato YYYY-MM-DD.');
        }
        return dateValue;
    }
    buildUtcDate(date, time) {
        const normalizedTime = time.slice(0, 8);
        return new Date(`${date}T${normalizedTime}Z`);
    }
    normalizeOptionalText(value) {
        if (!value) {
            return null;
        }
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
    }
    normalizeRequiredText(value, message) {
        const trimmed = value.trim();
        if (!trimmed) {
            throw new api_error_1.ApiError(400, message);
        }
        return trimmed;
    }
    mapDatabaseError(error) {
        if (this.isPgError(error) && error.code === '23P01') {
            return new api_error_1.ApiError(409, 'La instalación ya tiene una reserva activa en ese horario.');
        }
        return error instanceof Error ? error : new api_error_1.ApiError(500, 'No se pudo procesar la reserva.');
    }
    isPgError(error) {
        if (!error || typeof error !== 'object') {
            return false;
        }
        const candidate = error;
        return typeof candidate.code === 'string';
    }
}
exports.ReservaService = ReservaService;
//# sourceMappingURL=reserva.service.js.map