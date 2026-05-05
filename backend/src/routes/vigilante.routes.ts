import { Router, type Request, type Response } from 'express';
import { pool } from '../db/pool';
import { authMiddleware, requireVigilante } from '../middleware/auth.middleware';
import { ApiError } from '../utils/api-error';

export const vigilanteRouter = Router();

function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper
async function executeQuery<T>(
  req: Request,
  res: Response,
  queryFn: () => Promise<T>,
) {
  try {
    const data = await queryFn();
    res.json({ success: true, data });
  } catch (error) {
    const apiError = error instanceof ApiError
      ? error
      : new ApiError(500, 'Error al ejecutar la operación');
    res.status(apiError.statusCode).json({
      success: false,
      message: apiError.message,
    });
  }
}

// GET /api/vigilante/reservas-hoy - Reservas del día
vigilanteRouter.get('/reservas-hoy', authMiddleware, requireVigilante, async (_req: Request, res: Response) => {
  await executeQuery(_req, res, async () => {
    const result = await pool.query(`
      SELECT 
        r.id,
        r.fecha_reserva,
        r.comienza_en,
        r.termina_en,
        r.estado,
        r.notas,
        i.nombre as nombre_instalacion,
        i.codigo as codigo_instalacion,
        u.nombre_usuario,
        u.apellido_usuario,
        d.nombre as nombre_deporte
      FROM reservas r
      LEFT JOIN instalaciones i ON r.id_instalacion = i.id
      LEFT JOIN usuarios u ON r.id_usuario = u.id
      LEFT JOIN deportes d ON i.id_deporte = d.id
      WHERE r.fecha_reserva = CURRENT_DATE
        AND r.id_estado IN (1, 2)
      ORDER BY r.comienza_en
    `);
    return result.rows;
  });
});

// POST /api/vigilante/reporte - Reportar disponibilidad
vigilanteRouter.post('/reporte', authMiddleware, requireVigilante, async (req: Request, res: Response) => {
  await executeQuery(req, res, async () => {
    const { id_instalacion, fecha, estado, razon } = req.body;
    const vigilanteId = req.authUser?.id;

    // Crear bloqueo o reserva especial según el estado
    if (estado === 'MANTENIMIENTO' || estado === 'NO_DISPONIBLE') {
      const result = await pool.query(`
        INSERT INTO bloqueos_instalaciones (
          id_instalacion,
          razon,
          inicia_en,
          termina_en,
          creado_por,
          esta_activo
        )
        VALUES ($1, $2, $3, $4, $5, TRUE)
        RETURNING id, id_instalacion, razon
      `, [
        id_instalacion,
        razon || `Reportado como ${estado}`,
        `${fecha}T07:00:00`,
        `${fecha}T20:00:00`,
        vigilanteId,
      ]);
      return result.rows[0];
    }

    // Si está disponible, solo confirmar recepción
    return { success: true, message: 'Disponibilidad reportada correctamente' };
  });
});

// POST /api/vigilante/reservas/:id/iniciar - Iniciar una reserva (verificar código)
vigilanteRouter.post('/reservas/:id/iniciar', authMiddleware, requireVigilante, async (req: Request, res: Response) => {
  await executeQuery(req, res, async () => {
    const { id } = req.params;
    const { codigo } = req.body;

    if (!codigo) {
      throw new ApiError(400, 'El código de verificación es obligatorio');
    }

    // Buscar la reserva
    const reservaResult = await pool.query(`
      SELECT r.id, r.codigo_verificacion, r.id_estado, r.fecha_reserva, r.comienza_en,
             i.nombre as nombre_instalacion,
             u.nombre_usuario, u.apellido_usuario
      FROM reservas r
      LEFT JOIN instalaciones i ON r.id_instalacion = i.id
      LEFT JOIN usuarios u ON r.id_usuario = u.id
      WHERE r.id = $1
    `, [id]);

    if (reservaResult.rows.length === 0) {
      throw new ApiError(404, 'Reserva no encontrada');
    }

    const reserva = reservaResult.rows[0];

    // Verificar que la reserva sea de HOY
    const today = toLocalDateString(new Date());
    const reservaDate = toLocalDateString(new Date(reserva.fecha_reserva));
    if (reservaDate !== today) {
      throw new ApiError(400, 'Solo se pueden iniciar reservas del día de hoy.');
    }

    // Verificar que la reserva esté en estado pendiente o confirmada
    const estadoId = Number(reserva.id_estado);
    if (estadoId !== 1 && estadoId !== 2) {
      throw new ApiError(400, 'La reserva no puede ser iniciada. Estado actual no permite inicio.');
    }

    // Verificar código - comparación exacta sin trim
    console.log('Código recibido:', codigo, 'tipo:', typeof codigo);
    console.log('Código en BD:', reserva.codigo_verificacion, 'tipo:', typeof reserva.codigo_verificacion);
    
    if (String(codigo) !== String(reserva.codigo_verificacion)) {
      throw new ApiError(400, 'Código de verificación incorrecto');
    }

    // Buscar estado INICIADA (usar ID 6 directamente si no existe)
    let estadoIniciadaId = 6;
    const estadoResult = await pool.query(`
      SELECT id FROM estados_reserva WHERE codigo = 'INICIADA' LIMIT 1
    `);

    if (estadoResult.rows.length > 0) {
      estadoIniciadaId = estadoResult.rows[0].id;
    }

    // Actualizar estado a INICIADA
    await pool.query(`
      UPDATE reservas
      SET id_estado = $1, actualizado_en = NOW()
      WHERE id = $2
    `, [estadoIniciadaId, id]);

    return {
      success: true,
      message: 'Reserva iniciada correctamente',
      reserva: {
        id: reserva.id,
        nombre_instalacion: reserva.nombre_instalacion,
        nombre_usuario: reserva.nombre_usuario,
        apellido_usuario: reserva.apellido_usuario
      }
    };
  });
});

// GET /api/vigilante/reservas - Reservas próximas (hoy + próximos 7 días)
vigilanteRouter.get('/reservas', authMiddleware, requireVigilante, async (_req: Request, res: Response) => {
  await executeQuery(_req, res, async () => {
    const result = await pool.query(`
      SELECT
        r.id,
        r.fecha_reserva,
        r.comienza_en,
        r.termina_en,
        r.id_estado,
        r.notas,
        r.codigo_verificacion,
        i.nombre as nombre_instalacion,
        i.codigo as codigo_instalacion,
        u.nombre_usuario,
        u.apellido_usuario,
        u.codigo_institucional,
        d.nombre as nombre_deporte,
        e.codigo as estado_codigo,
        e.nombre as estado_nombre
      FROM reservas r
      LEFT JOIN instalaciones i ON r.id_instalacion = i.id
      LEFT JOIN usuarios u ON r.id_usuario = u.id
      LEFT JOIN deportes d ON i.id_deporte = d.id
      LEFT JOIN estados_reserva e ON r.id_estado = e.id
      WHERE r.fecha_reserva >= CURRENT_DATE
        AND r.fecha_reserva <= CURRENT_DATE + INTERVAL '7 days'
      ORDER BY r.fecha_reserva, r.comienza_en
    `);
    return result.rows;
  });
});

// GET /api/vigilante/todas-reservas - TODAS las reservas (pasadas y futuras)
vigilanteRouter.get('/todas-reservas', authMiddleware, requireVigilante, async (_req: Request, res: Response) => {
  await executeQuery(_req, res, async () => {
    const result = await pool.query(`
      SELECT
        r.id,
        r.fecha_reserva,
        r.comienza_en,
        r.termina_en,
        r.id_estado,
        r.notas,
        r.codigo_verificacion,
        i.nombre as nombre_instalacion,
        i.codigo as codigo_instalacion,
        u.nombre_usuario,
        u.apellido_usuario,
        u.codigo_institucional,
        d.nombre as nombre_deporte,
        e.codigo as estado_codigo,
        e.nombre as estado_nombre
      FROM reservas r
      LEFT JOIN instalaciones i ON r.id_instalacion = i.id
      LEFT JOIN usuarios u ON r.id_usuario = u.id
      LEFT JOIN deportes d ON i.id_deporte = d.id
      LEFT JOIN estados_reserva e ON r.id_estado = e.id
      ORDER BY r.fecha_reserva DESC, r.comienza_en DESC
      LIMIT 100
    `);
    return result.rows;
  });
});

// GET /api/vigilante/instalaciones - Lista de instalaciones disponibles
vigilanteRouter.get('/instalaciones', authMiddleware, requireVigilante, async (_req: Request, res: Response) => {
  await executeQuery(_req, res, async () => {
    const result = await pool.query(`
      SELECT 
        i.id,
        i.codigo,
        i.nombre,
        i.capacidad,
        i.esta_activo,
        d.nombre as nombre_deporte,
        e.nombre as nombre_escenario
      FROM instalaciones i
      LEFT JOIN deportes d ON i.id_deporte = d.id
      LEFT JOIN escenarios e ON i.id_escenario = e.id
      WHERE i.esta_activo = TRUE
      ORDER BY d.nombre, i.nombre
    `);
    return result.rows;
  });
});
