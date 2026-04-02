"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const api_error_1 = require("../utils/api-error");
const pool_1 = require("../db/pool");
class UserRepository {
    async findByEmail(email) {
        const result = await pool_1.pool.query(`
      SELECT
        id,
        id_rol,
        codigo_institucional,
        nombre_usuario,
        apellido_usuario,
        correo_electronico,
        hash_contrasena,
        telefono,
        foto_perfil_url,
        esta_activo
      FROM usuarios
      WHERE correo_electronico = $1
      LIMIT 1
      `, [email]);
        return result.rows[0] ?? null;
    }
    async createUser(payload) {
        const { input, passwordHash, roleId, institutionalCode } = payload;
        const result = await pool_1.pool.query(`
      INSERT INTO usuarios (
        id_rol,
        codigo_institucional,
        nombre_usuario,
        apellido_usuario,
        correo_electronico,
        hash_contrasena,
        esta_activo
      )
      VALUES ($1, $2, $3, $4, $5, $6, TRUE)
      RETURNING
        id,
        id_rol,
        codigo_institucional,
        nombre_usuario,
        apellido_usuario,
        correo_electronico,
        hash_contrasena,
        telefono,
        foto_perfil_url,
        esta_activo
      `, [
            roleId,
            institutionalCode,
            input.nombres.trim(),
            input.apellidos.trim(),
            input.correo.trim().toLowerCase(),
            passwordHash,
        ]);
        const createdUser = result.rows[0];
        if (!createdUser) {
            throw new api_error_1.ApiError(500, 'No se pudo crear el usuario.');
        }
        return createdUser;
    }
    async updateLastLogin(userId) {
        await pool_1.pool.query(`
      UPDATE usuarios
      SET ultimo_login_en = NOW(), actualizado_en = NOW()
      WHERE id = $1
      `, [userId]);
    }
    async findById(userId) {
        const result = await pool_1.pool.query(`
      SELECT
        id,
        id_rol,
        codigo_institucional,
        nombre_usuario,
        apellido_usuario,
        correo_electronico,
        hash_contrasena,
        telefono,
        foto_perfil_url,
        esta_activo
      FROM usuarios
      WHERE id = $1
      LIMIT 1
      `, [userId]);
        return result.rows[0] ?? null;
    }
    async updatePhoto(userId, photoUrl) {
        await pool_1.pool.query(`
      UPDATE usuarios
      SET foto_perfil_url = $2, actualizado_en = NOW()
      WHERE id = $1
      `, [userId, photoUrl]);
    }
}
exports.UserRepository = UserRepository;
//# sourceMappingURL=user.repository.js.map