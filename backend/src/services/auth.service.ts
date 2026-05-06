import { OAuth2Client } from 'google-auth-library';
import bcrypt from 'bcryptjs';
import { ApiError } from '../utils/api-error';
import { generateAccessToken } from '../utils/auth';
import { LoginInput, RegisterInput, UserRecord } from '../models/user.model';
import { UserRepository } from '../repositories/user.repository';

interface AuthSuccessResponse {
  token: string;
  usuario: {
    id: number;
    idRol: number;
    codigoInstitucional: string;
    nombres: string;
    apellidos: string;
    correo: string;
    fotoPerfilUrl: string | null;
  };
}

const institutionalDomain = '@unimagdalena.edu.co';
const studentRoleId = 1;

// Obtenemos el CLIENT_ID de las variables de entorno, o usamos uno dummy temporalmente
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'dummy_client_id');

export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async register(input: RegisterInput): Promise<AuthSuccessResponse> {
    this.validateRegisterInput(input);

    const normalizedEmail = input.correo.trim().toLowerCase();
    const existingUser = await this.userRepository.findByEmail(normalizedEmail);

    if (existingUser) {
      throw new ApiError(409, 'El correo institucional ya está registrado.');
    }

    const passwordHash = await bcrypt.hash(input.contrasena, 10);
    const institutionalCode = this.buildInstitutionalCode(input.nombres, input.apellidos);

    const newUser = await this.userRepository.createUser({
      input: {
        ...input,
        correo: normalizedEmail,
      },
      passwordHash,
      roleId: studentRoleId,
      institutionalCode,
    });

    return this.buildAuthResponse(newUser);
  }

  async login(input: LoginInput): Promise<AuthSuccessResponse> {
    this.validateLoginInput(input);

    const normalizedEmail = input.correo.trim().toLowerCase();
    const user = await this.userRepository.findByEmail(normalizedEmail);

    if (!user || !user.esta_activo) {
      throw new ApiError(401, 'Credenciales inválidas.');
    }

    const isPasswordValid = await bcrypt.compare(input.contrasena, user.hash_contrasena);

    if (!isPasswordValid) {
      throw new ApiError(401, 'Credenciales inválidas.');
    }

    await this.userRepository.updateLastLogin(user.id);
    return this.buildAuthResponse(user);
  }

  async googleLogin(idToken: string): Promise<AuthSuccessResponse> {
    try {
      // 1. Verificar el token con Google
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      
      if (!payload || !payload.email) {
        throw new ApiError(401, 'Token de Google inválido o no contiene email.');
      }

      const email = payload.email.trim().toLowerCase();

      // 2. Verificar que sea correo institucional
      if (!email.endsWith(institutionalDomain)) {
        throw new ApiError(403, `Solo se permiten correos institucionales (${institutionalDomain}).`);
      }

      // 3. Buscar si el usuario ya existe
      let user = await this.userRepository.findByEmail(email);

      // 4. Si no existe, lo registramos automáticamente (Auto-Registro / SSO)
      if (!user) {
        const nombres = payload.given_name || 'Estudiante';
        const apellidos = payload.family_name || 'Unimagdalena';
        const fotoPerfilUrl = payload.picture || null;
        
        // Creamos una contraseña aleatoria imposible de adivinar (ya que entrarán con Google)
        const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
        const passwordHash = await bcrypt.hash(randomPassword, 10);
        const institutionalCode = this.buildInstitutionalCode(nombres, apellidos);

        user = await this.userRepository.createUser({
          input: {
            idRol: studentRoleId,
            codigoInstitucional: institutionalCode,
            nombres,
            apellidos,
            correo: email,
            contrasena: randomPassword, // no se usa
          },
          passwordHash,
        });

        // Actualizamos la foto si Google nos dio una
        if (fotoPerfilUrl) {
          // Asumimos que tienes una función para actualizar, si no la tienes omitimos la foto por ahora en BD
          // await this.userRepository.updatePhoto(user.id, fotoPerfilUrl);
        }
      } else if (!user.esta_activo) {
        throw new ApiError(403, 'Esta cuenta ha sido desactivada. Contacte al administrador.');
      }

      // 5. Retornar el token y sesión normales del sistema
      return this.buildAuthResponse(user);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(401, 'Error al autenticar con Google. ' + (error as Error).message);
    }
  }

  private validateRegisterInput(input: RegisterInput): void {
    if (!input.nombres.trim() || !input.apellidos.trim()) {
      throw new ApiError(400, 'Nombres y apellidos son obligatorios.');
    }

    if (!this.isInstitutionalEmail(input.correo)) {
      throw new ApiError(400, `El correo debe terminar en ${institutionalDomain}.`);
    }

    if (input.contrasena.length < 8) {
      throw new ApiError(400, 'La contraseña debe tener al menos 8 caracteres.');
    }
  }

  private validateLoginInput(input: LoginInput): void {
    if (!this.isInstitutionalEmail(input.correo)) {
      throw new ApiError(400, `El correo debe terminar en ${institutionalDomain}.`);
    }

    if (input.contrasena.length < 6) {
      throw new ApiError(400, 'La contraseña debe tener al menos 6 caracteres.');
    }
  }

  private isInstitutionalEmail(email: string): boolean {
    return email.trim().toLowerCase().endsWith(institutionalDomain);
  }

  private buildInstitutionalCode(nombres: string, apellidos: string): string {
    const base = `${nombres.trim().charAt(0)}${apellidos.trim().charAt(0)}`.toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    return `${base}${timestamp}`;
  }

  private buildAuthResponse(user: UserRecord): AuthSuccessResponse {
    const userDto = this.toUserDto(user);

    return {
      token: generateAccessToken(userDto),
      usuario: userDto,
    };
  }

  private toUserDto(user: UserRecord): AuthSuccessResponse['usuario'] {
    return {
      id: Number(user.id),
      idRol: Number(user.id_rol),
      codigoInstitucional: user.codigo_institucional,
      nombres: user.nombre_usuario,
      apellidos: user.apellido_usuario,
      correo: user.correo_electronico,
      fotoPerfilUrl: user.foto_perfil_url,
    };
  }
}
