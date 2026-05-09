"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const pool_1 = require("../db/pool");
const auth_middleware_1 = require("../middleware/auth.middleware");
const api_error_1 = require("../utils/api-error");
exports.adminRouter = (0, express_1.Router)();
// =========================================================
// METODOS AUXILIARES
// =========================================================
// Helper para ejecutar queries con manejo de errores
async function executeQuery(req, res, queryFn) {
    try {
        const data = await queryFn();
        res.json({ success: true, data });
    }
    catch (error) {
        const apiError = error instanceof api_error_1.ApiError
            ? error
            : new api_error_1.ApiError(500, 'Error al ejecutar la operación');
        res.status(apiError.statusCode).json({
            success: false,
            message: apiError.message,
        });
    }
}
// =========================================================
// ENDPOINTS DE FRANJAS HORARIAS (solo admin)
// =========================================================
// GET /api/admin/franjas - Listar todas las franjas horarias
exports.adminRouter.get('/franjas', auth_middleware_1.authMiddleware, auth_middleware_1.requireAdmin, async (_req, res) => {
    await executeQuery(_req, res, async () => {
        const result = await pool_1.pool.query(`
      SELECT id, hora_inicio, hora_fin, orden_clasificacion, esta_activo
      FROM franjas_horarias
      ORDER BY orden_clasificacion
    `);
        return result.rows;
    });
});
// POST /api/admin/franjas - Crear franca horaria
exports.adminRouter.post('/franjas', auth_middleware_1.authMiddleware, auth_middleware_1.requireAdmin, async (req, res) => {
    await executeQuery(req, res, async () => {
        const { hora_inicio, hora_fin, orden_clasificacion } = req.body;
        const result = await pool_1.pool.query(`
      INSERT INTO franjas_horarias (hora_inicio, hora_fin, orden_clasificacion)
      VALUES ($1, $2, $3)
      RETURNING id, hora_inicio, hora_fin, orden_clasificacion, esta_activo
    `, [hora_inicio, hora_fin, orden_clasificacion]);
        return result.rows[0];
    });
});
// PATCH /api/admin/franjas/:id - Actualizar franca horaria
exports.adminRouter.patch('/franjas/:id', auth_middleware_1.authMiddleware, auth_middleware_1.requireAdmin, async (req, res) => {
    await executeQuery(req, res, async () => {
        const { id } = req.params;
        const { hora_inicio, hora_fin, orden_clasificacion, esta_activo } = req.body;
        const updates = [];
        const values = [];
        let paramIndex = 1;
        if (hora_inicio) {
            updates.push(`hora_inicio = $${paramIndex++}`);
            values.push(hora_inicio);
        }
        if (hora_fin) {
            updates.push(`hora_fin = $${paramIndex++}`);
            values.push(hora_fin);
        }
        if (orden_clasificacion) {
            updates.push(`orden_clasificacion = $${paramIndex++}`);
            values.push(orden_clasificacion);
        }
        if (esta_activo !== undefined) {
            updates.push(`esta_activo = $${paramIndex++}`);
            values.push(esta_activo);
        }
        if (updates.length === 0) {
            throw new api_error_1.ApiError(400, 'No hay campos para actualizar');
        }
        values.push(id);
        const result = await pool_1.pool.query(`
      UPDATE franjas_horarias
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, hora_inicio, hora_fin, orden_clasificacion, esta_activo
    `, values);
        if (result.rows.length === 0) {
            throw new api_error_1.ApiError(404, 'Franja horaria no encontrada');
        }
        return result.rows[0];
    });
});
// DELETE /api/admin/franjas/:id - Eliminar franca horaria
exports.adminRouter.delete('/franjas/:id', auth_middleware_1.authMiddleware, auth_middleware_1.requireAdmin, async (req, res) => {
    await executeQuery(req, res, async () => {
        const { id } = req.params;
        const result = await pool_1.pool.query(`
      UPDATE franjas_horarias
      SET esta_activo = FALSE
      WHERE id = $1
      RETURNING id
    `, [id]);
        if (result.rows.length === 0) {
            throw new api_error_1.ApiError(404, 'Franja horaria no encontrada');
        }
        return { success: true, message: 'Franja horaria eliminada correctamente' };
    });
});
// =========================================================
// ENDPOINTS DE ESTADOS RESERVA (solo admin)
// =========================================================
// GET /api/admin/estados-reserva - Listar estados de reserva
exports.adminRouter.get('/estados-reserva', auth_middleware_1.authMiddleware, auth_middleware_1.requireAdmin, async (_req, res) => {
    await executeQuery(_req, res, async () => {
        const result = await pool_1.pool.query(`
      SELECT id, codigo, nombre, es_final, esta_activo
      FROM estados_reserva
      ORDER BY id
    `);
        return result.rows;
    });
});
// GET /api/admin/tipos-superficie - Listar tipos de superficie
exports.adminRouter.get('/tipos-superficie', auth_middleware_1.authMiddleware, auth_middleware_1.requireAdmin, async (_req, res) => {
    await executeQuery(_req, res, async () => {
        const result = await pool_1.pool.query(`
      SELECT id, codigo, nombre, esta_activo
      FROM tipos_superficie
      ORDER BY nombre
    `);
        return result.rows;
    });
});
// GET /api/admin/escenarios - Listar escenarios (para dropdown)
exports.adminRouter.get('/escenarios/all', auth_middleware_1.authMiddleware, auth_middleware_1.requireAdmin, async (_req, res) => {
    await executeQuery(_req, res, async () => {
        const result = await pool_1.pool.query(`
      SELECT id, codigo, nombre, esta_activo
      FROM escenarios
      WHERE esta_activo = TRUE
      ORDER BY nombre
    `);
        return result.rows;
    });
});
// =========================================================
// ENDPOINTS DE USUARIOS (solo admin)
// =========================================================
// GET /api/admin/usuarios - Listar todos los usuarios
exports.adminRouter.get('/usuarios', auth_middleware_1.authMiddleware, auth_middleware_1.requireAdmin, async (_req, res) => {
    await executeQuery(_req, res, async () => {
        const result = await pool_1.pool.query(`
      SELECT 
        id,
        id_rol,
        codigo_institucional,
        nombre_usuario,
        apellido_usuario,
        correo_electronico,
        telefono,
        esta_activo,
        ultimo_login_en,
        creado_en
      FROM usuarios
      ORDER BY creado_en DESC
    `);
        return result.rows;
    });
});
// POST /api/admin/usuarios - Crear nuevo usuario
exports.adminRouter.post('/usuarios', auth_middleware_1.authMiddleware, auth_middleware_1.requireAdmin, async (req, res) => {
    await executeQuery(req, res, async () => {
        const { codigo_institucional, nombre_usuario, apellido_usuario, correo_electronico, contrasena, id_rol, telefono } = req.body;
        if (!codigo_institucional || !nombre_usuario || !apellido_usuario || !correo_electronico || !contrasena || !id_rol) {
            throw new api_error_1.ApiError(400, 'Todos los campos obligatorios deben ser proporcionados');
        }
        // Validar que el correo sea institucional
        const institutionalDomain = '@unimagdalena.edu.co';
        if (!correo_electronico.trim().toLowerCase().endsWith(institutionalDomain)) {
            throw new api_error_1.ApiError(400, `El correo debe terminar en ${institutionalDomain}`);
        }
        // Hash de la contraseña
        const bcrypt = await import('bcryptjs');
        const hash = await bcrypt.hash(contrasena, 10);
        const result = await pool_1.pool.query(`
      INSERT INTO usuarios (id_rol, codigo_institucional, nombre_usuario, apellido_usuario, correo_electronico, hash_contrasena, telefono)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, id_rol, codigo_institucional, nombre_usuario, apellido_usuario, correo_electronico, telefono, esta_activo
    `, [id_rol, codigo_institucional, nombre_usuario, apellido_usuario, correo_electronico.toLowerCase(), hash, telefono || null]);
        return result.rows[0];
    });
});
// GET /api/admin/usuarios/:id - Obtener usuario por ID
exports.adminRouter.get('/usuarios/:id', auth_middleware_1.authMiddleware, auth_middleware_1.requireAdmin, async (req, res) => {
    await executeQuery(req, res, async () => {
        const { id } = req.params;
        const result = await pool_1.pool.query(`
      SELECT 
        id,
        id_rol,
        codigo_institucional,
        nombre_usuario,
        apellido_usuario,
        correo_electronico,
        telefono,
        esta_activo,
        ultimo_login_en,
        creado_en
      FROM usuarios
      WHERE id = $1
    `, [id]);
        if (result.rows.length === 0) {
            throw new api_error_1.ApiError(404, 'Usuario no encontrado');
        }
        return result.rows[0];
    });
});
// PATCH /api/admin/usuarios/:id - Actualizar usuario
exports.adminRouter.patch('/usuarios/:id', auth_middleware_1.authMiddleware, auth_middleware_1.requireAdmin, async (req, res) => {
    await executeQuery(req, res, async () => {
        const { id } = req.params;
        const { nombre_usuario, apellido_usuario, telefono, id_rol, esta_activo } = req.body;
        const updates = [];
        const values = [];
        let paramIndex = 1;
        if (nombre_usuario !== undefined) {
            updates.push(`nombre_usuario = $${paramIndex++}`);
            values.push(nombre_usuario);
        }
        if (apellido_usuario !== undefined) {
            updates.push(`apellido_usuario = $${paramIndex++}`);
            values.push(apellido_usuario);
        }
        if (telefono !== undefined) {
            updates.push(`telefono = $${paramIndex++}`);
            values.push(telefono);
        }
        if (id_rol !== undefined) {
            updates.push(`id_rol = $${paramIndex++}`);
            values.push(id_rol);
        }
        if (esta_activo !== undefined) {
            updates.push(`esta_activo = $${paramIndex++}`);
            values.push(esta_activo);
        }
        if (updates.length === 0) {
            throw new api_error_1.ApiError(400, 'No hay campos para actualizar');
        }
        updates.push(`actualizado_en = NOW()`);
        values.push(id);
        const result = await pool_1.pool.query(`
      UPDATE usuarios
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, id_rol, codigo_institucional, nombre_usuario, apellido_usuario, correo_electronico, telefono, esta_activo
    `, values);
        if (result.rows.length === 0) {
            throw new api_error_1.ApiError(404, 'Usuario no encontrado');
        }
        return result.rows[0];
    });
});
// DELETE /api/admin/usuarios/:id - Eliminar usuario (soft delete)
exports.adminRouter.delete('/usuarios/:id', auth_middleware_1.authMiddleware, auth_middleware_1.requireAdmin, async (req, res) => {
    await executeQuery(req, res, async () => {
        const { id } = req.params;
        const result = await pool_1.pool.query(`
      UPDATE usuarios
      SET esta_activo = FALSE, actualizado_en = NOW()
      WHERE id = $1
      RETURNING id
    `, [id]);
        if (result.rows.length === 0) {
            throw new api_error_1.ApiError(404, 'Usuario no encontrado');
        }
        return { success: true, message: 'Usuario eliminado correctamente' };
    });
});
// =========================================================
// ENDPOINTS DE INSTALACIONES (solo admin)
// =========================================================
// GET /api/admin/instalaciones - Listar todas las instalaciones
exports.adminRouter.get('/instalaciones', auth_middleware_1.authMiddleware, auth_middleware_1.requireAdmin, async (_req, res) => {
    await executeQuery(_req, res, async () => {
        const result = await pool_1.pool.query(`
      SELECT 
        i.id,
        i.codigo,
        i.nombre,
        i.capacidad,
        i.esta_activo,
        i.id_escenario,
        e.nombre as nombre_escenario,
        i.id_deporte,
        d.nombre as nombre_deporte
      FROM instalaciones i
      LEFT JOIN escenarios e ON i.id_escenario = e.id
      LEFT JOIN deportes d ON i.id_deporte = d.id
      ORDER BY i.nombre
    `);
        return result.rows;
    });
});
// POST /api/admin/instalaciones - Crear instalación
exports.adminRouter.post('/instalaciones', auth_middleware_1.authMiddleware, auth_middleware_1.requireAdmin, async (req, res) => {
    await executeQuery(req, res, async () => {
        const { codigo, nombre, id_escenario, id_deporte, capacidad } = req.body;
        const result = await pool_1.pool.query(`
      INSERT INTO instalaciones (codigo, nombre, id_escenario, id_deporte, capacidad)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, codigo, nombre, id_escenario, id_deporte, capacidad, esta_activo
    `, [codigo, nombre, id_escenario, id_deporte, capacidad]);
        return result.rows[0];
    });
});
// PATCH /api/admin/instalaciones/:id - Actualizar instalación
exports.adminRouter.patch('/instalaciones/:id', auth_middleware_1.authMiddleware, auth_middleware_1.requireAdmin, async (req, res) => {
    await executeQuery(req, res, async () => {
        const { id } = req.params;
        const { codigo, nombre, id_escenario, id_deporte, capacidad, esta_activo } = req.body;
        const updates = [];
        const values = [];
        let paramIndex = 1;
        if (codigo) {
            updates.push(`codigo = $${paramIndex++}`);
            values.push(codigo);
        }
        if (nombre) {
            updates.push(`nombre = $${paramIndex++}`);
            values.push(nombre);
        }
        if (id_escenario) {
            updates.push(`id_escenario = $${paramIndex++}`);
            values.push(id_escenario);
        }
        if (id_deporte) {
            updates.push(`id_deporte = $${paramIndex++}`);
            values.push(id_deporte);
        }
        if (capacidad !== undefined) {
            updates.push(`capacidad = $${paramIndex++}`);
            values.push(capacidad);
        }
        if (esta_activo !== undefined) {
            updates.push(`esta_activo = $${paramIndex++}`);
            values.push(esta_activo);
        }
        updates.push(`actualizado_en = NOW()`);
        values.push(id);
        const result = await pool_1.pool.query(`
      UPDATE instalaciones
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, codigo, nombre, id_escenario, id_deporte, capacidad, esta_activo
    `, values);
        if (result.rows.length === 0) {
            throw new api_error_1.ApiError(404, 'Instalación no encontrada');
        }
        return result.rows[0];
    });
});
// DELETE /api/admin/instalaciones/:id - Eliminar instalación (soft delete)
exports.adminRouter.delete('/instalaciones/:id', auth_middleware_1.authMiddleware, auth_middleware_1.requireAdmin, async (req, res) => {
    await executeQuery(req, res, async () => {
        const { id } = req.params;
        const result = await pool_1.pool.query(`
      UPDATE instalaciones
      SET esta_activo = FALSE, actualizado_en = NOW()
      WHERE id = $1
      RETURNING id
    `, [id]);
        if (result.rows.length === 0) {
            throw new api_error_1.ApiError(404, 'Instalación no encontrada');
        }
        return { success: true, message: 'Instalación eliminada correctamente' };
    });
});
// =========================================================
// ENDPOINTS DE ESCENARIOS (solo admin)
// =========================================================
// GET /api/admin/escenarios - Listar todos los escenarios
exports.adminRouter.get('/escenarios', auth_middleware_1.authMiddleware, auth_middleware_1.requireAdmin, async (_req, res) => {
    await executeQuery(_req, res, async () => {
        const result = await pool_1.pool.query(`
      SELECT 
        e.id,
        e.codigo,
        e.nombre,
        e.descripcion_ubicacion,
        e.esta_activo,
        e.id_tipo_superficie,
        ts.nombre as nombre_superficie
      FROM escenarios e
      LEFT JOIN tipos_superficie ts ON e.id_tipo_superficie = ts.id
      ORDER BY e.nombre
    `);
        return result.rows;
    });
});
// POST /api/admin/escenarios - Crear escenario
exports.adminRouter.post('/escenarios', auth_middleware_1.authMiddleware, auth_middleware_1.requireAdmin, async (req, res) => {
    await executeQuery(req, res, async () => {
        const { codigo, nombre, id_tipo_superficie, descripcion_ubicacion } = req.body;
        const result = await pool_1.pool.query(`
      INSERT INTO escenarios (codigo, nombre, id_tipo_superficie, descripcion_ubicacion)
      VALUES ($1, $2, $3, $4)
      RETURNING id, codigo, nombre, id_tipo_superficie, descripcion_ubicacion, esta_activo
    `, [codigo, nombre, id_tipo_superficie, descripcion_ubicacion]);
        return result.rows[0];
    });
});
// PATCH /api/admin/escenarios/:id - Actualizar escenario
exports.adminRouter.patch('/escenarios/:id', auth_middleware_1.authMiddleware, auth_middleware_1.requireAdmin, async (req, res) => {
    await executeQuery(req, res, async () => {
        const { id } = req.params;
        const { codigo, nombre, id_tipo_superficie, descripcion_ubicacion, esta_activo } = req.body;
        const updates = [];
        const values = [];
        let paramIndex = 1;
        if (codigo) {
            updates.push(`codigo = $${paramIndex++}`);
            values.push(codigo);
        }
        if (nombre) {
            updates.push(`nombre = $${paramIndex++}`);
            values.push(nombre);
        }
        if (id_tipo_superficie) {
            updates.push(`id_tipo_superficie = $${paramIndex++}`);
            values.push(id_tipo_superficie);
        }
        if (descripcion_ubicacion !== undefined) {
            updates.push(`descripcion_ubicacion = $${paramIndex++}`);
            values.push(descripcion_ubicacion);
        }
        if (esta_activo !== undefined) {
            updates.push(`esta_activo = $${paramIndex++}`);
            values.push(esta_activo);
        }
        updates.push(`actualizado_en = NOW()`);
        values.push(id);
        const result = await pool_1.pool.query(`
      UPDATE escenarios
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, codigo, nombre, id_tipo_superficie, descripcion_ubicacion, esta_activo
    `, values);
        if (result.rows.length === 0) {
            throw new api_error_1.ApiError(404, 'Escenario no encontrado');
        }
        return result.rows[0];
    });
});
// DELETE /api/admin/escenarios/:id - Eliminar escenario (soft delete)
exports.adminRouter.delete('/escenarios/:id', auth_middleware_1.authMiddleware, auth_middleware_1.requireAdmin, async (req, res) => {
    await executeQuery(req, res, async () => {
        const { id } = req.params;
        const result = await pool_1.pool.query(`
      UPDATE escenarios
      SET esta_activo = FALSE, actualizado_en = NOW()
      WHERE id = $1
      RETURNING id
    `, [id]);
        if (result.rows.length === 0) {
            throw new api_error_1.ApiError(404, 'Escenario no encontrado');
        }
        return { success: true, message: 'Escenario eliminado correctamente' };
    });
});
// =========================================================
// ENDPOINTS DE DEPORTES (solo admin)
// =========================================================
// GET /api/admin/deportes - Listar deportes
exports.adminRouter.get('/deportes', auth_middleware_1.authMiddleware, auth_middleware_1.requireAdmin, async (_req, res) => {
    await executeQuery(_req, res, async () => {
        const result = await pool_1.pool.query(`
      SELECT id, codigo, nombre, etiqueta_campo, esta_activo
      FROM deportes
      ORDER BY nombre
    `);
        return result.rows;
    });
});
// POST /api/admin/deportes - Crear deporte
exports.adminRouter.post('/deportes', auth_middleware_1.authMiddleware, auth_middleware_1.requireAdmin, async (req, res) => {
    await executeQuery(req, res, async () => {
        const { codigo, nombre, etiqueta_campo } = req.body;
        const result = await pool_1.pool.query(`
      INSERT INTO deportes (codigo, nombre, etiqueta_campo)
      VALUES ($1, $2, $3)
      RETURNING id, codigo, nombre, etiqueta_campo, esta_activo
    `, [codigo, nombre, etiqueta_campo]);
        return result.rows[0];
    });
});
// GET /api/admin/equipamiento - Listar equipamiento
exports.adminRouter.get('/equipamiento', auth_middleware_1.authMiddleware, auth_middleware_1.requireAdmin, async (_req, res) => {
    await executeQuery(_req, res, async () => {
        const result = await pool_1.pool.query(`
      SELECT id, codigo, nombre, cantidad_total, cantidad_disponible, esta_activo
      FROM elementos_equipo
      ORDER BY nombre
    `);
        return result.rows;
    });
});
// POST /api/admin/equipamiento - Crear equipamiento
exports.adminRouter.post('/equipamiento', auth_middleware_1.authMiddleware, auth_middleware_1.requireAdmin, async (req, res) => {
    await executeQuery(req, res, async () => {
        const { codigo, nombre, cantidad_total, cantidad_disponible, } = req.body;
        if (!codigo || !nombre) {
            throw new api_error_1.ApiError(400, 'Código y nombre son obligatorios');
        }
        const total = Number(cantidad_total ?? 0);
        const disponible = Number(cantidad_disponible ?? total);
        const result = await pool_1.pool.query(`
      INSERT INTO elementos_equipo (codigo, nombre, cantidad_total, cantidad_disponible)
      VALUES ($1, $2, $3, $4)
      RETURNING id, codigo, nombre, cantidad_total, cantidad_disponible, esta_activo
    `, [codigo, nombre, total, disponible]);
        return result.rows[0];
    });
});
// PATCH /api/admin/equipamiento/:id - Actualizar equipamiento
exports.adminRouter.patch('/equipamiento/:id', auth_middleware_1.authMiddleware, auth_middleware_1.requireAdmin, async (req, res) => {
    await executeQuery(req, res, async () => {
        const { id } = req.params;
        const { codigo, nombre, cantidad_total, cantidad_disponible, esta_activo, } = req.body;
        const updates = [];
        const values = [];
        let paramIndex = 1;
        if (codigo) {
            updates.push(`codigo = $${paramIndex++}`);
            values.push(codigo);
        }
        if (nombre) {
            updates.push(`nombre = $${paramIndex++}`);
            values.push(nombre);
        }
        if (cantidad_total !== undefined) {
            updates.push(`cantidad_total = $${paramIndex++}`);
            values.push(Number(cantidad_total));
        }
        if (cantidad_disponible !== undefined) {
            updates.push(`cantidad_disponible = $${paramIndex++}`);
            values.push(Number(cantidad_disponible));
        }
        if (esta_activo !== undefined) {
            updates.push(`esta_activo = $${paramIndex++}`);
            values.push(Boolean(esta_activo));
        }
        if (updates.length === 0) {
            throw new api_error_1.ApiError(400, 'No hay campos para actualizar');
        }
        updates.push('actualizado_en = NOW()');
        values.push(id);
        const result = await pool_1.pool.query(`
      UPDATE elementos_equipo
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, codigo, nombre, cantidad_total, cantidad_disponible, esta_activo
    `, values);
        if (result.rows.length === 0) {
            throw new api_error_1.ApiError(404, 'Equipamiento no encontrado');
        }
        return result.rows[0];
    });
});
// DELETE /api/admin/equipamiento/:id - Eliminar equipamiento (soft delete)
exports.adminRouter.delete('/equipamiento/:id', auth_middleware_1.authMiddleware, auth_middleware_1.requireAdmin, async (req, res) => {
    await executeQuery(req, res, async () => {
        const { id } = req.params;
        const result = await pool_1.pool.query(`
      UPDATE elementos_equipo
      SET esta_activo = FALSE, actualizado_en = NOW()
      WHERE id = $1
      RETURNING id
    `, [id]);
        if (result.rows.length === 0) {
            throw new api_error_1.ApiError(404, 'Equipamiento no encontrado');
        }
        return { success: true, message: 'Equipamiento eliminado correctamente' };
    });
});
// GET /api/admin/bloqueos - Listar bloqueos
exports.adminRouter.get('/bloqueos', auth_middleware_1.authMiddleware, auth_middleware_1.requireAdmin, async (_req, res) => {
    await executeQuery(_req, res, async () => {
        const result = await pool_1.pool.query(`
      SELECT b.id, b.id_instalacion, b.razon, b.inicia_en, b.termina_en, b.esta_activo, i.nombre as nombre_instalacion
      FROM bloqueos_instalaciones b
      LEFT JOIN instalaciones i ON b.id_instalacion = i.id
      ORDER BY b.inicia_en DESC
    `);
        return result.rows;
    });
});
// POST /api/admin/bloqueos - Crear bloqueo
exports.adminRouter.post('/bloqueos', auth_middleware_1.authMiddleware, auth_middleware_1.requireAdmin, async (req, res) => {
    await executeQuery(req, res, async () => {
        const { id_instalacion, razon, inicia_en, termina_en } = req.body;
        if (!id_instalacion || !razon || !inicia_en || !termina_en) {
            throw new api_error_1.ApiError(400, 'Todos los campos son obligatorios');
        }
        const result = await pool_1.pool.query(`
      INSERT INTO bloqueos_instalaciones (id_instalacion, razon, inicia_en, termina_en, creado_por, esta_activo)
      VALUES ($1, $2, $3, $4, $5, TRUE)
      RETURNING id, id_instalacion, razon, inicia_en, termina_en, esta_activo
    `, [id_instalacion, razon, inicia_en, termina_en, req.authUser?.id ?? null]);
        return result.rows[0];
    });
});
// PATCH /api/admin/bloqueos/:id - Actualizar bloqueo
exports.adminRouter.patch('/bloqueos/:id', auth_middleware_1.authMiddleware, auth_middleware_1.requireAdmin, async (req, res) => {
    await executeQuery(req, res, async () => {
        const { id } = req.params;
        const { id_instalacion, razon, inicia_en, termina_en, esta_activo } = req.body;
        const updates = [];
        const values = [];
        let paramIndex = 1;
        if (id_instalacion) {
            updates.push(`id_instalacion = $${paramIndex++}`);
            values.push(id_instalacion);
        }
        if (razon) {
            updates.push(`razon = $${paramIndex++}`);
            values.push(razon);
        }
        if (inicia_en) {
            updates.push(`inicia_en = $${paramIndex++}`);
            values.push(inicia_en);
        }
        if (termina_en) {
            updates.push(`termina_en = $${paramIndex++}`);
            values.push(termina_en);
        }
        if (esta_activo !== undefined) {
            updates.push(`esta_activo = $${paramIndex++}`);
            values.push(Boolean(esta_activo));
        }
        if (updates.length === 0) {
            throw new api_error_1.ApiError(400, 'No hay campos para actualizar');
        }
        updates.push('actualizado_en = NOW()');
        values.push(id);
        const result = await pool_1.pool.query(`
      UPDATE bloqueos_instalaciones
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, id_instalacion, razon, inicia_en, termina_en, esta_activo
    `, values);
        if (result.rows.length === 0) {
            throw new api_error_1.ApiError(404, 'Bloqueo no encontrado');
        }
        return result.rows[0];
    });
});
// DELETE /api/admin/bloqueos/:id - Eliminar bloqueo (soft delete)
exports.adminRouter.delete('/bloqueos/:id', auth_middleware_1.authMiddleware, auth_middleware_1.requireAdmin, async (req, res) => {
    await executeQuery(req, res, async () => {
        const { id } = req.params;
        const result = await pool_1.pool.query(`
      UPDATE bloqueos_instalaciones
      SET esta_activo = FALSE, actualizado_en = NOW()
      WHERE id = $1
      RETURNING id
    `, [id]);
        if (result.rows.length === 0) {
            throw new api_error_1.ApiError(404, 'Bloqueo no encontrado');
        }
        return { success: true, message: 'Bloqueo eliminado correctamente' };
    });
});
// =========================================================
// ENDPOINTS DE RESERVAS DEL DIA (vigilanTe y admin)
// =========================================================
// GET /api/admin/reservas/dia - Reservas del día actual
exports.adminRouter.get('/reservas/dia', auth_middleware_1.authMiddleware, auth_middleware_1.requireVigilante, async (_req, res) => {
    await executeQuery(_req, res, async () => {
        const result = await pool_1.pool.query(`
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
        AND r.id_estado IN (1, 2)  -- PENDIENTE o CONFIRMADA
      ORDER BY r.comienza_en
    `);
        return result.rows;
    });
});
// =========================================================
// ENDPOINTS DE RESERVAS (solo admin)
// =========================================================
// GET /api/admin/reservas - Listar todas las reservas
exports.adminRouter.get('/reservas', auth_middleware_1.authMiddleware, auth_middleware_1.requireAdmin, async (_req, res) => {
    await executeQuery(_req, res, async () => {
        const result = await pool_1.pool.query(`
      SELECT 
        r.id,
        r.fecha_reserva,
        r.comienza_en,
        r.termina_en,
        r.duracion_horas,
        r.id_estado,
        r.notas,
        r.equipo_solicitado,
        r.razon_cancelacion,
        r.creado_en,
        i.id as id_instalacion,
        i.nombre as nombre_instalacion,
        i.codigo as codigo_instalacion,
        u.id as id_usuario,
        u.codigo_institucional,
        u.nombre_usuario,
        u.apellido_usuario,
        d.nombre as nombre_deporte,
        e.codigo as estado_codigo,
        e.nombre as estado_nombre,
        fh.hora_inicio as hora_inicio,
        fh.hora_fin as hora_fin
      FROM reservas r
      LEFT JOIN instalaciones i ON r.id_instalacion = i.id
      LEFT JOIN usuarios u ON r.id_usuario = u.id
      LEFT JOIN deportes d ON i.id_deporte = d.id
      LEFT JOIN estados_reserva e ON r.id_estado = e.id
      LEFT JOIN franjas_horarias fh ON r.id_franja_inicio = fh.id
      ORDER BY r.fecha_reserva DESC, r.comienza_en DESC
    `);
        return result.rows;
    });
});
// GET /api/admin/reservas/:id - Obtener reserva por ID
exports.adminRouter.get('/reservas/:id', auth_middleware_1.authMiddleware, auth_middleware_1.requireAdmin, async (req, res) => {
    await executeQuery(req, res, async () => {
        const { id } = req.params;
        const result = await pool_1.pool.query(`
      SELECT 
        r.*,
        i.nombre as nombre_instalacion,
        u.nombre_usuario,
        u.apellido_usuario,
        e.nombre as estado_nombre
      FROM reservas r
      LEFT JOIN instalaciones i ON r.id_instalacion = i.id
      LEFT JOIN usuarios u ON r.id_usuario = u.id
      LEFT JOIN estados_reserva e ON r.id_estado = e.id
      WHERE r.id = $1
    `, [id]);
        if (result.rows.length === 0) {
            throw new api_error_1.ApiError(404, 'Reserva no encontrada');
        }
        return result.rows[0];
    });
});
// PATCH /api/admin/reservas/:id - Actualizar estado de reserva
exports.adminRouter.patch('/reservas/:id', auth_middleware_1.authMiddleware, auth_middleware_1.requireAdmin, async (req, res) => {
    await executeQuery(req, res, async () => {
        const { id } = req.params;
        const { id_estado, razon_cancelacion } = req.body;
        const updates = [];
        const values = [];
        let paramIndex = 1;
        if (id_estado !== undefined) {
            updates.push(`id_estado = $${paramIndex++}`);
            values.push(id_estado);
        }
        if (razon_cancelacion !== undefined) {
            updates.push(`razon_cancelacion = $${paramIndex++}`);
            values.push(razon_cancelacion);
        }
        if (updates.length === 0) {
            throw new api_error_1.ApiError(400, 'No hay campos para actualizar');
        }
        updates.push(`actualizado_en = NOW()`);
        values.push(id);
        const result = await pool_1.pool.query(`
      UPDATE reservas
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, id_estado, fecha_reserva, comienza_en, termina_en
    `, values);
        if (result.rows.length === 0) {
            throw new api_error_1.ApiError(404, 'Reserva no encontrada');
        }
        return result.rows[0];
    });
});
// =========================================================
// ESTADISTICAS DASHBOARD (solo admin)
// =========================================================
// GET /api/admin/estadisticas - Estadísticas para el dashboard
exports.adminRouter.get('/estadisticas', auth_middleware_1.authMiddleware, auth_middleware_1.requireAdmin, async (_req, res) => {
    await executeQuery(_req, res, async () => {
        // Usuarios activos
        const usuariosResult = await pool_1.pool.query(`
      SELECT COUNT(*) as total FROM usuarios WHERE esta_activo = TRUE
    `);
        // Reservas pendientes
        const reservasPendientesResult = await pool_1.pool.query(`
      SELECT COUNT(*) as total FROM reservas WHERE id_estado = 1
    `);
        // Instalaciones disponibles
        const instalacionesResult = await pool_1.pool.query(`
      SELECT COUNT(*) as total FROM instalaciones WHERE esta_activo = TRUE
    `);
        // Reservas de hoy
        const reservasHoyResult = await pool_1.pool.query(`
      SELECT COUNT(*) as total FROM reservas WHERE fecha_reserva = CURRENT_DATE AND id_estado IN (1, 2)
    `);
        return {
            usuariosActivos: parseInt(usuariosResult.rows[0]?.total ?? '0'),
            reservasPendientes: parseInt(reservasPendientesResult.rows[0]?.total ?? '0'),
            instalacionesDisponibles: parseInt(instalacionesResult.rows[0]?.total ?? '0'),
            reservasHoy: parseInt(reservasHoyResult.rows[0]?.total ?? '0'),
        };
    });
});
// =========================================================
// NOTAS: 
// Hay un error en las queries - la tabla se llama "escenarios" no "escenario"
// Esto es un ejemplo de estructura, los endpoints reales necesitan ajuste según la DB
// =========================================================
//# sourceMappingURL=admin.routes.js.map