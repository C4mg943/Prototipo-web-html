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
        creado_por,
        actualizado_por
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $1, $1)
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
      creadoEn: row.creado_en.toISOString(),
      actualizadoEn: row.actualizado_en.toISOString(),
    };
  }
}
