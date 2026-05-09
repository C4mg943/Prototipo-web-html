import { pool } from '../db/pool';
import {
  EstadoReservaRecord,
  FranjaHorariaRecord,
  InstalacionRecord,
  ReservaDto,
  ReservaRecord,
} from '../models/reserva.model';
import { ApiError } from '../utils/api-error';

interface ReservaDetailRow extends ReservaRecord {
  instalacion_codigo: string;
  instalacion_nombre: string;
  estado_codigo: string;
  estado_nombre: string;
  codigo_verificacion: string | null;
}

interface CreateReservaParams {
  idUsuario: number;
  idInstalacion: number;
  idEstado: number;
  fechaReserva: string;
  idFranjaInicio: number;
  idFranjaFin: number;
  comienzaEn: Date;
  terminaEn: Date;
  duracionHoras: number;
  equipoSolicitado: boolean;
  notas: string | null;
}

interface UpdateReservaParams {
  idReserva: number;
  idFranjaInicio: number;
  idFranjaFin: number;
  fechaReserva: string;
  comienzaEn: Date;
  terminaEn: Date;
  duracionHoras: number;
  equipoSolicitado: boolean;
  notas: string | null;
  actorUserId: number;
}

interface ReservationConflictParams {
  fechaReserva: string;
  idInstalacion: number;
  comienzaEn: Date;
  terminaEn: Date;
  excludeReservaId?: number;
}

interface UserReservationDateParams {
  fechaReserva: string;
  idUsuario: number;
  excludeReservaId?: number;
}

export class ReservaRepository {
  async findInstalacionById(idInstalacion: number): Promise<InstalacionRecord | null> {
    const result = await pool.query<InstalacionRecord>(
      `
      SELECT id, codigo, nombre, esta_activo
      FROM instalaciones
      WHERE id = $1
      LIMIT 1
      `,
      [idInstalacion],
    );

    return result.rows[0] ?? null;
  }

  async findFranjaById(idFranja: number): Promise<FranjaHorariaRecord | null> {
    const result = await pool.query<FranjaHorariaRecord>(
      `
      SELECT id, hora_inicio, hora_fin, orden_clasificacion, esta_activo
      FROM franjas_horarias
      WHERE id = $1
      LIMIT 1
      `,
      [idFranja],
    );

    return result.rows[0] ?? null;
  }

  async findEstadoByCodigo(codigo: string): Promise<EstadoReservaRecord | null> {
    const result = await pool.query<EstadoReservaRecord>(
      `
      SELECT id, codigo, nombre, es_final, esta_activo
      FROM estados_reserva
      WHERE codigo = $1
      LIMIT 1
      `,
      [codigo],
    );

    return result.rows[0] ?? null;
  }

  async createReserva(params: CreateReservaParams): Promise<ReservaDto> {
    const codigoVerificacion = this.generateVerificationCode();
    const result = await pool.query<{ id: number }>(
      `
      INSERT INTO reservas (
        id_usuario,
        id_instalacion,
        id_estado,
        fecha_reserva,
        id_franja_inicio,
        id_franja_fin,
        comienza_en,
        termina_en,
        duracion_horas,
        equipo_solicitado,
        notas,
        codigo_verificacion,
        creado_por,
        actualizado_por
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $1, $1)
      RETURNING id
      `,
      [
        params.idUsuario,
        params.idInstalacion,
        params.idEstado,
        params.fechaReserva,
        params.idFranjaInicio,
        params.idFranjaFin,
        params.comienzaEn,
        params.terminaEn,
        params.duracionHoras,
        params.equipoSolicitado,
        params.notas,
        codigoVerificacion,
      ],
    );

    const createdId = result.rows[0]?.id;

    if (!createdId) {
      throw new ApiError(500, 'No se pudo crear la reserva.');
    }

    const created = await this.findReservaById(createdId);

    if (!created) {
      throw new ApiError(500, 'No se pudo recuperar la reserva creada.');
    }

    return created;
  }

  async hasReservationConflict(params: ReservationConflictParams): Promise<boolean> {
    const { fechaReserva, idInstalacion, comienzaEn, terminaEn, excludeReservaId } = params;
    const result = await pool.query(
      `
      SELECT 1
      FROM reservas r
      LEFT JOIN estados_reserva e ON e.id = r.id_estado
      WHERE r.fecha_reserva = $1
        AND r.id_instalacion = $2
        AND r.comienza_en < $3
        AND r.termina_en > $4
        AND (e.codigo IS NULL OR e.codigo NOT IN ('CANCELADA', 'NO_PRESENTO'))
        AND ($5::BIGINT IS NULL OR r.id <> $5)
      LIMIT 1
      `,
      [fechaReserva, idInstalacion, terminaEn, comienzaEn, excludeReservaId ?? null],
    );

    return result.rows.length > 0;
  }

  async hasUserReservationOnDate(params: UserReservationDateParams): Promise<boolean> {
    const { fechaReserva, idUsuario, excludeReservaId } = params;
    const result = await pool.query(
      `
      SELECT 1
      FROM reservas r
      LEFT JOIN estados_reserva e ON e.id = r.id_estado
      WHERE r.fecha_reserva = $1
        AND r.id_usuario = $2
        AND (e.codigo IS NULL OR e.codigo NOT IN ('CANCELADA', 'NO_PRESENTO'))
        AND ($3::BIGINT IS NULL OR r.id <> $3)
      LIMIT 1
      `,
      [fechaReserva, idUsuario, excludeReservaId ?? null],
    );

    return result.rows.length > 0;
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async listReservasByUser(idUsuario: number): Promise<ReservaDto[]> {
    const result = await pool.query<ReservaDetailRow>(
      `
      SELECT
        r.id,
        r.id_usuario,
        r.id_instalacion,
        r.id_estado,
        r.fecha_reserva,
        r.id_franja_inicio,
        r.id_franja_fin,
        r.comienza_en,
        r.termina_en,
        r.duracion_horas,
        r.equipo_solicitado,
        r.notas,
        r.razon_cancelacion,
        r.codigo_verificacion,
        r.creado_en,
        r.actualizado_en,
        i.codigo AS instalacion_codigo,
        i.nombre AS instalacion_nombre,
        e.codigo AS estado_codigo,
        e.nombre AS estado_nombre
      FROM reservas r
      INNER JOIN instalaciones i ON i.id = r.id_instalacion
      INNER JOIN estados_reserva e ON e.id = r.id_estado
      WHERE r.id_usuario = $1
      ORDER BY r.comienza_en DESC
      `,
      [idUsuario],
    );

    return result.rows.map((row) => this.toReservaDto(row));
  }

  async findReservaById(idReserva: number): Promise<ReservaDto | null> {
    const result = await pool.query<ReservaDetailRow>(
      `
      SELECT
        r.id,
        r.id_usuario,
        r.id_instalacion,
        r.id_estado,
        r.fecha_reserva,
        r.id_franja_inicio,
        r.id_franja_fin,
        r.comienza_en,
        r.termina_en,
        r.duracion_horas,
        r.equipo_solicitado,
        r.notas,
        r.razon_cancelacion,
        r.codigo_verificacion,
        r.creado_en,
        r.actualizado_en,
        i.codigo AS instalacion_codigo,
        i.nombre AS instalacion_nombre,
        e.codigo AS estado_codigo,
        e.nombre AS estado_nombre
      FROM reservas r
      INNER JOIN instalaciones i ON i.id = r.id_instalacion
      INNER JOIN estados_reserva e ON e.id = r.id_estado
      WHERE r.id = $1
      LIMIT 1
      `,
      [idReserva],
    );

    const row = result.rows[0];
    return row ? this.toReservaDto(row) : null;
  }

  async cancelReserva(
    idReserva: number,
    estadoCanceladaId: number,
    razonCancelacion: string,
    actorUserId: number,
  ): Promise<ReservaDto> {
    await pool.query(
      `
      UPDATE reservas
      SET
        id_estado = $2,
        razon_cancelacion = $3,
        actualizado_por = $4,
        actualizado_en = NOW()
      WHERE id = $1
      `,
      [idReserva, estadoCanceladaId, razonCancelacion, actorUserId],
    );

    const reserva = await this.findReservaById(idReserva);

    if (!reserva) {
      throw new ApiError(500, 'No se pudo recuperar la reserva cancelada.');
    }

    return reserva;
  }

  async autoCancelExpiredReservations(): Promise<{ cancelledCount: number; reservations: number[] }> {
    // Buscar el ID del estado "NO_PRESENTO" (no presentó)
    const estadoNoPresento = await this.findEstadoByCodigo('NO_PRESENTO');
    const estadoConfirmado = await this.findEstadoByCodigo('CONFIRMADA');
    const estadoIniciada = await this.findEstadoByCodigo('INICIADA');
    const estadoPendiente = await this.findEstadoByCodigo('PENDIENTE');

    if (!estadoNoPresento) {
      throw new ApiError(500, 'No se encontró el estado NO_PRESENTO.');
    }

    // Obtener reservas que deben cancelarse (ya pasaron su hora de fin y no están finalizadas)
    const validStates = [];
    if (estadoConfirmado) validStates.push(estadoConfirmado.id);
    if (estadoIniciada) validStates.push(estadoIniciada.id);
    if (estadoPendiente) validStates.push(estadoPendiente.id);

    if (validStates.length === 0) {
      return { cancelledCount: 0, reservations: [] };
    }

    // Buscar reservas que ya pasaron su hora de termine_en
    const result = await pool.query<{ id: number }>(
      `
      UPDATE reservas
      SET 
        id_estado = $2,
        razon_cancelacion = 'Cancelación automática: El usuario no se presentó a la reserva.',
        actualizado_en = NOW()
      WHERE 
        termina_en < NOW()
        AND id_estado = ANY($3)
      RETURNING id
      `,
      [estadoNoPresento.id, validStates],
    );

    return {
      cancelledCount: result.rowCount,
      reservations: result.rows.map(r => r.id),
    };
  }

  async updateReserva(params: UpdateReservaParams): Promise<ReservaDto> {
    await pool.query(
      `
      UPDATE reservas
      SET
        fecha_reserva = $2,
        id_franja_inicio = $3,
        id_franja_fin = $4,
        comienza_en = $5,
        termina_en = $6,
        duracion_horas = $7,
        equipo_solicitado = $8,
        notas = $9,
        actualizado_por = $10,
        actualizado_en = NOW()
      WHERE id = $1
      `,
      [
        params.idReserva,
        params.fechaReserva,
        params.idFranjaInicio,
        params.idFranjaFin,
        params.comienzaEn,
        params.terminaEn,
        params.duracionHoras,
        params.equipoSolicitado,
        params.notas,
        params.actorUserId,
      ],
    );

    const reserva = await this.findReservaById(params.idReserva);

    if (!reserva) {
      throw new ApiError(500, 'No se pudo recuperar la reserva actualizada.');
    }

    return reserva;
  }

  private toReservaDto(row: ReservaDetailRow): ReservaDto {
    return {
      id: Number(row.id),
      idUsuario: Number(row.id_usuario),
      idInstalacion: Number(row.id_instalacion),
      instalacion: {
        codigo: row.instalacion_codigo,
        nombre: row.instalacion_nombre,
      },
      estado: {
        id: Number(row.id_estado),
        codigo: row.estado_codigo,
        nombre: row.estado_nombre,
      },
      fechaReserva: row.fecha_reserva,
      franja: {
        idInicio: Number(row.id_franja_inicio),
        idFin: Number(row.id_franja_fin),
      },
      comienzaEn: row.comienza_en.toISOString(),
      terminaEn: row.termina_en.toISOString(),
      duracionHoras: Number(row.duracion_horas),
      equipoSolicitado: row.equipo_solicitado,
      notas: row.notas,
      razonCancelacion: row.razon_cancelacion,
      codigoVerificacion: row.codigo_verificacion,
      creadoEn: row.creado_en.toISOString(),
      actualizadoEn: row.actualizado_en.toISOString(),
    };
  }
}
