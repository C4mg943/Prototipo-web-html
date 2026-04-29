import { Router, type Request, type Response } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { uploadSingleImage } from '../middleware/upload.middleware';
import { UserRepository } from '../repositories/user.repository';
import { UserService } from '../services/user.service';
import { pool } from '../db/pool';
import { ApiError } from '../utils/api-error';

const userRouter = Router();

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

userRouter.patch('/me/photo', authMiddleware, uploadSingleImage, userController.updateMyPhoto);

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

// GET /api/users/me - Obtener perfil del usuario logueado
userRouter.get('/me', authMiddleware, async (req: Request, res: Response) => {
  await executeQuery(req, res, async () => {
    const userId = req.authUser?.id;
    const result = await pool.query(`
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
      throw new ApiError(404, 'Usuario no encontrado');
    }
    return result.rows[0];
  });
});

// PATCH /api/users/me - Actualizar perfil del usuario
userRouter.patch('/me', authMiddleware, async (req: Request, res: Response) => {
  await executeQuery(req, res, async () => {
    const userId = req.authUser?.id;
    const { nombre_usuario, apellido_usuario, telefono } = req.body;

    const updates: string[] = [];
    const values: unknown[] = [];
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
      throw new ApiError(400, 'No hay campos para actualizar');
    }

    updates.push(`actualizado_en = NOW()`);
    values.push(userId);

    const result = await pool.query(`
      UPDATE usuarios
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, id_rol, codigo_institucional, nombre_usuario, apellido_usuario, correo_electronico, telefono, foto_perfil_url
    `, values);

    if (result.rows.length === 0) {
      throw new ApiError(404, 'Usuario no encontrado');
    }
    return result.rows[0];
  });
});

export { userRouter };
