"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const user_repository_1 = require("../repositories/user.repository");
const user_service_1 = require("../services/user.service");
const pool_1 = require("../db/pool");
const api_error_1 = require("../utils/api-error");
const userRouter = (0, express_1.Router)();
exports.userRouter = userRouter;
const userRepository = new user_repository_1.UserRepository();
const userService = new user_service_1.UserService(userRepository);
const userController = new user_controller_1.UserController(userService);
userRouter.patch('/me/photo', auth_middleware_1.authMiddleware, upload_middleware_1.uploadSingleImage, userController.updateMyPhoto);
// Helper
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
// GET /api/users/me - Obtener perfil del usuario logueado
userRouter.get('/me', auth_middleware_1.authMiddleware, async (req, res) => {
    await executeQuery(req, res, async () => {
        const userId = req.authUser?.id;
        const result = await pool_1.pool.query(`
      SELECT 
        id,
        id_rol,
        codigo_institucional,
        nombre_usuario,
        apellido_usuario,
        correo_electronico,
        telefono,
        foto_perfil_url,
        esta_activo
      FROM usuarios
      WHERE id = $1
    `, [userId]);
        if (result.rows.length === 0) {
            throw new api_error_1.ApiError(404, 'Usuario no encontrado');
        }
        return result.rows[0];
    });
});
// PATCH /api/users/me - Actualizar perfil del usuario
userRouter.patch('/me', auth_middleware_1.authMiddleware, async (req, res) => {
    await executeQuery(req, res, async () => {
        const userId = req.authUser?.id;
        const { nombre_usuario, apellido_usuario, telefono } = req.body;
        const updates = [];
        const values = [];
        let paramIndex = 1;
        if (nombre_usuario) {
            updates.push(`nombre_usuario = $${paramIndex++}`);
            values.push(nombre_usuario);
        }
        if (apellido_usuario) {
            updates.push(`apellido_usuario = $${paramIndex++}`);
            values.push(apellido_usuario);
        }
        if (telefono !== undefined) {
            updates.push(`telefono = $${paramIndex++}`);
            values.push(telefono || null);
        }
        if (updates.length === 0) {
            throw new api_error_1.ApiError(400, 'No hay campos para actualizar');
        }
        updates.push(`actualizado_en = NOW()`);
        values.push(userId);
        const result = await pool_1.pool.query(`
      UPDATE usuarios
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, id_rol, codigo_institucional, nombre_usuario, apellido_usuario, correo_electronico, telefono, foto_perfil_url
    `, values);
        if (result.rows.length === 0) {
            throw new api_error_1.ApiError(404, 'Usuario no encontrado');
        }
        return result.rows[0];
    });
});
//# sourceMappingURL=user.routes.js.map