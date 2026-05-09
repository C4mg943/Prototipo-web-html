import bcrypt from 'bcryptjs';
import { ApiError } from '../utils/api-error';
import { generateAccessToken, createTempToken } from '../utils/auth';
import { emailService } from './email.service';
import { TwoFactorService } from './two-factor.service';
import { UserRepository } from '../repositories/user.repository';
import { RegisterInput, LoginInput, UserRecord } from '../models/user.model';

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
  requires2FA?: boolean;
  tempToken?: string;
}

const institutionalDomain = '@unimagdalena.edu.co';
const studentRoleId = 1;
const twoFactorService = new TwoFactorService();

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

    // Actualizar último login
    await this.userRepository.updateLastLogin(user.id);

    // Verificar si tiene 2FA habilitado - necesitamos buscar el usuario completo con ese campo
    const userWith2FA = await this.userRepository.findById(user.id);
    const has2FAEnabled = (userWith2FA as any)?.two_factor_enabled || false;

    // Si tiene 2FA habilitado, retornar requiere verificación adicional
    if (has2FAEnabled) {
      const tempToken = createTempToken({ userId: user.id, step: '2fa' });
      return {
        token: '', // No retornamos token real todavía
        usuario: this.toUserDto(user),
        requires2FA: true,
        tempToken
      };
    }

    // Si no tiene 2FA, retornar token normal
    return this.buildAuthResponse(user);
  }

  async verify2FA(userId: number, code: string): Promise<AuthSuccessResponse> {
    const verification = await twoFactorService.verifyCode(userId, code);
    
    if (!verification.success) {
      throw new ApiError(401, verification.message);
    }

    // Obtener usuario y generar token real
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new ApiError(404, 'Usuario no encontrado.');
    }

    return this.buildAuthResponse(user);
  }

  async setup2FA(userId: number, email: string): Promise<{ qrCode: string; secret: string; tempToken: string }> {
    const result = await twoFactorService.setup2FA(userId, email);
    return {
      qrCode: result.qrCode,
      secret: result.secret,
      tempToken: result.tempToken
    };
  }

  async confirm2FA(userId: number, code: string): Promise<{ message: string }> {
    const result = await twoFactorService.verifyAndEnable2FA(userId, code);
    
    if (!result.success) {
      throw new ApiError(400, result.message);
    }

    return { message: result.message };
  }

  async disable2FA(userId: number): Promise<{ message: string }> {
    await twoFactorService.disable2FA(userId);
    return { message: '2FA deshabilitado exitosamente.' };
  }

  async get2FAStatus(userId: number): Promise<{ enabled: boolean }> {
    return twoFactorService.get2FAStatus(userId);
  }

  async recoverWith2FA(correo: string, code: string, newPassword: string): Promise<AuthSuccessResponse> {
    const normalizedEmail = correo.trim().toLowerCase();
    const user = await this.userRepository.findByEmail(normalizedEmail);

    if (!user) {
      throw new ApiError(404, 'Usuario no encontrado.');
    }

    if (!user.esta_activo) {
      throw new ApiError(401, 'Esta cuenta ha sido desactivada.');
    }

    // Verificar que tiene 2FA habilitado
    const status = await twoFactorService.get2FAStatus(user.id);
    if (!status.enabled) {
      throw new ApiError(400, 'Esta cuenta no tiene 2FA habilitado. No se puede recuperar por este método.');
    }

    // Verificar el código 2FA
    const verification = await twoFactorService.verifyCode(user.id, code);
    if (!verification.success) {
      throw new ApiError(401, 'Código de verificación inválido.');
    }

    // Validar nueva contraseña
    if (newPassword.length < 8) {
      throw new ApiError(400, 'La nueva contraseña debe tener al menos 8 caracteres.');
    }

    // Actualizar contraseña
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.userRepository.updatePassword(user.id, passwordHash);

    // Retornar sesión activa
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
