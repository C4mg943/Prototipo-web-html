import { ApiError } from '../utils/api-error';
import { pool } from '../db/pool';
import { RegisterInput, UserRecord } from '../models/user.model';

interface UserCreationPayload {
  input: RegisterInput;
  passwordHash: string;
  roleId: number;
  institutionalCode: string;
}

export class UserRepository {
  async findByEmail(email: string): Promise<UserRecord | null> {
    const result = await pool.query<UserRecord>(
      `
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
      `,
      [email],
    );

    return result.rows[0] ?? null;
  }

  async createUser(payload: UserCreationPayload): Promise<UserRecord> {
    const { input, passwordHash, roleId, institutionalCode } = payload;

    const result = await pool.query<UserRecord>(
      `
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
      `,
      [
        roleId,
        institutionalCode,
        input.nombres.trim(),
        input.apellidos.trim(),
        input.correo.trim().toLowerCase(),
        passwordHash,
      ],
    );

    const createdUser = result.rows[0];

    if (!createdUser) {
      throw new ApiError(500, 'No se pudo crear el usuario.');
    }

    return createdUser;
  }

  async updateLastLogin(userId: number): Promise<void> {
    await pool.query(
      `
      UPDATE usuarios
      SET ultimo_login_en = NOW(), actualizado_en = NOW()
      WHERE id = $1
      `,
      [userId],
    );
  }

  async findById(userId: number): Promise<UserRecord | null> {
    const result = await pool.query<UserRecord>(
      `
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
      `,
      [userId],
    );

    return result.rows[0] ?? null;
  }

  async updatePhoto(userId: number, photoUrl: string): Promise<void> {
    await pool.query(
      `
      UPDATE usuarios
      SET foto_perfil_url = $2, actualizado_en = NOW()
      WHERE id = $1
      `,
      [userId, photoUrl],
    );
  }
}
