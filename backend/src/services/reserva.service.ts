import {
  CancelReservaInput,
  CreateReservaInput,
  EstadoReservaRecord,
  FranjaHorariaRecord,
  ReservaDto,
  UpdateReservaInput,
} from '../models/reserva.model';
import { ReservaRepository } from '../repositories/reserva.repository';
import { ApiError } from '../utils/api-error';

const pendingStatusCode = 'PENDIENTE';
const canceledStatusCode = 'CANCELADA';

export class ReservaService {
  constructor(private readonly reservaRepository: ReservaRepository) {}

  async createReserva(userId: number, input: CreateReservaInput): Promise<ReservaDto> {
    const pendingStatus = await this.findActiveStatusByCode(pendingStatusCode);
    const instalacion = await this.reservaRepository.findInstalacionById(input.idInstalacion);

    if (!instalacion || !instalacion.esta_activo) {
      throw new ApiError(404, 'Instalación no encontrada o inactiva.');
    }

    const startSlot = await this.reservaRepository.findFranjaById(input.idFranjaInicio);
    const endSlot = await this.reservaRepository.findFranjaById(input.idFranjaFin);

    this.validateSlots(startSlot, endSlot);

    // Type guard: validateSlots throws if either is null
    if (!startSlot || !endSlot) {
      throw new ApiError(500, 'Error interno: franja horaria no se pudo cargar correctamente.');
    }

    const slotDurationHours = endSlot.orden_clasificacion - startSlot.orden_clasificacion;

    if (slotDurationHours < 1 || slotDurationHours > 3) {
      throw new ApiError(400, 'La duración permitida para la reserva es entre 1 y 3 horas.');
    }

    const fechaReserva = this.normalizeDate(input.fechaReserva);
    const comienzaEn = this.buildUtcDate(fechaReserva, startSlot.hora_inicio);
    const terminaEn = this.buildUtcDate(fechaReserva, endSlot.hora_fin);
    const notas = this.normalizeOptionalText(input.notas);

    const hasUserReservation = await this.reservaRepository.hasUserReservationOnDate({
      fechaReserva,
      idUsuario: userId,
    });
    if (hasUserReservation) {
      throw new ApiError(409, 'Ya tienes una reserva registrada para esta fecha.');
    }

    const hasConflict = await this.reservaRepository.hasReservationConflict({
      fechaReserva,
      idInstalacion: input.idInstalacion,
      comienzaEn,
      terminaEn,
    });
    if (hasConflict) {
      throw new ApiError(409, 'La instalación ya está reservada en ese horario.');
    }

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
    } catch (error) {
      throw this.mapDatabaseError(error);
    }
  }

  async listMyReservas(userId: number): Promise<ReservaDto[]> {
    return this.reservaRepository.listReservasByUser(userId);
  }

  async getMyReservaById(userId: number, reservaId: number): Promise<ReservaDto> {
    const reserva = await this.reservaRepository.findReservaById(reservaId);

    if (!reserva) {
      throw new ApiError(404, 'Reserva no encontrada.');
    }

    this.ensureOwnership(userId, reserva.idUsuario);

    return reserva;
  }

  async cancelMyReserva(userId: number, reservaId: number, input: CancelReservaInput): Promise<ReservaDto> {
    const reserva = await this.reservaRepository.findReservaById(reservaId);

    if (!reserva) {
      throw new ApiError(404, 'Reserva no encontrada.');
    }

    this.ensureOwnership(userId, reserva.idUsuario);

    if (reserva.estado.codigo === canceledStatusCode) {
      throw new ApiError(409, 'La reserva ya está cancelada.');
    }

    if (reserva.estado.codigo === 'COMPLETADA' || reserva.estado.codigo === 'NO_PRESENTO') {
      throw new ApiError(409, 'No se puede cancelar una reserva finalizada.');
    }

    const canceledStatus = await this.findActiveStatusByCode(canceledStatusCode);
    const reason = this.normalizeRequiredText(input.razonCancelacion, 'La razón de cancelación es obligatoria.');

    return this.reservaRepository.cancelReserva(reservaId, canceledStatus.id, reason, userId);
  }

  async updateMyReserva(userId: number, reservaId: number, input: UpdateReservaInput): Promise<ReservaDto> {
    const reserva = await this.reservaRepository.findReservaById(reservaId);

    if (!reserva) {
      throw new ApiError(404, 'Reserva no encontrada.');
    }

    this.ensureOwnership(userId, reserva.idUsuario);

    if (reserva.estado.codigo === canceledStatusCode) {
      throw new ApiError(409, 'No se puede editar una reserva cancelada.');
    }

    if (reserva.estado.codigo === 'COMPLETADA' || reserva.estado.codigo === 'NO_PRESENTO') {
      throw new ApiError(409, 'No se puede editar una reserva finalizada.');
    }

    const startSlot = await this.reservaRepository.findFranjaById(input.idFranjaInicio);
    const endSlot = await this.reservaRepository.findFranjaById(input.idFranjaFin);

    this.validateSlots(startSlot, endSlot);

    if (!startSlot || !endSlot) {
      throw new ApiError(500, 'Error interno: franja horaria no se pudo cargar correctamente.');
    }

    const slotDurationHours = endSlot.orden_clasificacion - startSlot.orden_clasificacion;

    if (slotDurationHours < 1 || slotDurationHours > 3) {
      throw new ApiError(400, 'La duración permitida para la reserva es entre 1 y 3 horas.');
    }

    const fechaReserva = this.normalizeDate(input.fechaReserva);
    const comienzaEn = this.buildUtcDate(fechaReserva, startSlot.hora_inicio);
    const terminaEn = this.buildUtcDate(fechaReserva, endSlot.hora_fin);
    const notas = this.normalizeOptionalText(input.notas);

    const hasUserReservation = await this.reservaRepository.hasUserReservationOnDate({
      fechaReserva,
      idUsuario: userId,
      excludeReservaId: reservaId,
    });
    if (hasUserReservation) {
      throw new ApiError(409, 'Ya tienes una reserva registrada para esta fecha.');
    }

    const hasConflict = await this.reservaRepository.hasReservationConflict({
      fechaReserva,
      idInstalacion: reserva.idInstalacion,
      comienzaEn,
      terminaEn,
      excludeReservaId: reservaId,
    });
    if (hasConflict) {
      throw new ApiError(409, 'La instalación ya está reservada en ese horario.');
    }

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
    } catch (error) {
      throw this.mapDatabaseError(error);
    }
  }

  private validateSlots(startSlot: FranjaHorariaRecord | null, endSlot: FranjaHorariaRecord | null): void {
    if (!startSlot || !endSlot || !startSlot.esta_activo || !endSlot.esta_activo) {
      throw new ApiError(404, 'Franja horaria no encontrada o inactiva.');
    }

    if (startSlot.id >= endSlot.id) {
      throw new ApiError(400, 'La franja de inicio debe ser menor que la franja de fin.');
    }

    if (startSlot.orden_clasificacion >= endSlot.orden_clasificacion) {
      throw new ApiError(400, 'El orden de las franjas horarias es inválido.');
    }
  }

  private ensureOwnership(requestUserId: number, ownerUserId: number): void {
    if (requestUserId !== ownerUserId) {
      throw new ApiError(403, 'No tienes permisos sobre esta reserva.');
    }
  }

  private async findActiveStatusByCode(code: string): Promise<EstadoReservaRecord> {
    const status = await this.reservaRepository.findEstadoByCodigo(code);

    if (!status || !status.esta_activo) {
      throw new ApiError(500, `No se encontró el estado de reserva ${code}.`);
    }

    return status;
  }

  private normalizeDate(dateValue: string): string {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (!datePattern.test(dateValue)) {
      throw new ApiError(400, 'fechaReserva debe tener formato YYYY-MM-DD.');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reservaDate = new Date(dateValue + 'T00:00:00');

    if (reservaDate < today) {
      throw new ApiError(400, 'No se puede realizar una reserva en fecha pasada.');
    }

    return dateValue;
  }

  private buildUtcDate(date: string, time: string): Date {
    const normalizedTime = time.slice(0, 8);
    return new Date(`${date}T${normalizedTime}Z`);
  }

  private normalizeOptionalText(value: string | undefined): string | null {
    if (!value) {
      return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private normalizeRequiredText(value: string, message: string): string {
    const trimmed = value.trim();

    if (!trimmed) {
      throw new ApiError(400, message);
    }

    return trimmed;
  }

  private mapDatabaseError(error: unknown): Error {
    if (this.isPgError(error) && error.code === '23P01') {
      return new ApiError(409, 'La instalación ya tiene una reserva activa en ese horario.');
    }

    return error instanceof Error ? error : new ApiError(500, 'No se pudo procesar la reserva.');
  }

  private isPgError(error: unknown): error is { code: string } {
    if (!error || typeof error !== 'object') {
      return false;
    }

    const candidate = error as Record<string, unknown>;
    return typeof candidate.code === 'string';
  }
}
