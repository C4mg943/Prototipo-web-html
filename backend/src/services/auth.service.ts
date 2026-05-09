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

    // Si el usuario NO existe, devolvemos un error especial para que el frontend redirija al registro
    if (!user) {
      throw new ApiError(404, 'USUARIO_NO_REGISTRADO');
    }

    // Si existe, verificamos la contraseña
    if (!user.esta_activo) {
      throw new ApiError(401, 'Esta cuenta ha sido desactivada. Contacte al administrador.');
    }

    const isPasswordValid = await bcrypt.compare(input.contrasena, user.hash_contrasena);

    if (!isPasswordValid) {
      throw new ApiError(401, 'Contraseña incorrecta.');
    }

    await this.userRepository.updateLastLogin(user.id);
    return this.buildAuthResponse(user);
  }

  async me(userId: number): Promise<AuthSuccessResponse['usuario']> {
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new ApiError(404, 'Usuario no encontrado.');
    }
    
    return this.toUserDto(user);
  }

  async logout(): Promise<{ message: string }> {
    return { message: 'Sesión cerrada correctamente.' };
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
