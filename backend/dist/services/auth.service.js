"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const api_error_1 = require("../utils/api-error");
const auth_1 = require("../utils/auth");
const two_factor_service_1 = require("./two-factor.service");
const institutionalDomain = '@unimagdalena.edu.co';
const studentRoleId = 1;
class AuthService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async register(input) {
        this.validateRegisterInput(input);
        const normalizedEmail = input.correo.trim().toLowerCase();
        const existingUser = await this.userRepository.findByEmail(normalizedEmail);
        if (existingUser) {
            throw new api_error_1.ApiError(409, 'El correo institucional ya está registrado.');
        }
        const passwordHash = await bcryptjs_1.default.hash(input.contrasena, 10);
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
    async login(input) {
        this.validateLoginInput(input);
        const normalizedEmail = input.correo.trim().toLowerCase();
        const user = await this.userRepository.findByEmail(normalizedEmail);
        // Si el usuario NO existe, devolvemos un error especial para que el frontend redirija al registro
        if (!user) {
            throw new api_error_1.ApiError(404, 'USUARIO_NO_REGISTRADO');
        }
        // Si existe, verificamos la contraseña
        if (!user.esta_activo) {
            throw new api_error_1.ApiError(401, 'Esta cuenta ha sido desactivada. Contacte al administrador.');
        }
        const isPasswordValid = await bcryptjs_1.default.compare(input.contrasena, user.hash_contrasena);
        if (!isPasswordValid) {
            throw new api_error_1.ApiError(401, 'Contraseña incorrecta.');
        }
        // Actualizar último login
        await this.userRepository.updateLastLogin(user.id);
        // Verificar si tiene 2FA habilitado - necesitamos buscar el usuario completo con ese campo
        const userWith2FA = await this.userRepository.findById(user.id);
        const has2FAEnabled = userWith2FA?.two_factor_enabled || false;
        // Si tiene 2FA habilitado, retornar requiere verificación adicional
        if (has2FAEnabled) {
            const tempToken = (0, auth_1.createTempToken)({ userId: user.id, step: '2fa' });
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
    async verify2FA(userId, code) {
        const verification = await two_factor_service_1.twoFactorService.verifyCode(userId, code);
        if (!verification.success) {
            throw new api_error_1.ApiError(401, verification.message);
        }
        // Obtener usuario y generar token real
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new api_error_1.ApiError(404, 'Usuario no encontrado.');
        }
        return this.buildAuthResponse(user);
    }
    async setup2FA(userId, email) {
        const result = await two_factor_service_1.twoFactorService.setup2FA(userId, email);
        return {
            qrCode: result.qrCode,
            tempToken: result.tempToken
        };
    }
    async confirm2FA(userId, code) {
        const result = await two_factor_service_1.twoFactorService.verifyAndEnable2FA(userId, code);
        if (!result.success) {
            throw new api_error_1.ApiError(400, result.message);
        }
        return { message: result.message };
    }
    async disable2FA(userId, password) {
        const result = await two_factor_service_1.twoFactorService.disable2FA(userId, password);
        if (!result.success) {
            throw new api_error_1.ApiError(401, result.message);
        }
        return { message: result.message };
    }
    async get2FAStatus(userId) {
        return two_factor_service_1.twoFactorService.get2FAStatus(userId);
    }
    async me(userId) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new api_error_1.ApiError(404, 'Usuario no encontrado.');
        }
        return this.toUserDto(user);
    }
    async logout() {
        return { message: 'Sesión cerrada correctamente.' };
    }
    validateRegisterInput(input) {
        if (!input.nombres.trim() || !input.apellidos.trim()) {
            throw new api_error_1.ApiError(400, 'Nombres y apellidos son obligatorios.');
        }
        if (!this.isInstitutionalEmail(input.correo)) {
            throw new api_error_1.ApiError(400, `El correo debe terminar en ${institutionalDomain}.`);
        }
        if (input.contrasena.length < 8) {
            throw new api_error_1.ApiError(400, 'La contraseña debe tener al menos 8 caracteres.');
        }
    }
    validateLoginInput(input) {
        if (!this.isInstitutionalEmail(input.correo)) {
            throw new api_error_1.ApiError(400, `El correo debe terminar en ${institutionalDomain}.`);
        }
        if (input.contrasena.length < 6) {
            throw new api_error_1.ApiError(400, 'La contraseña debe tener al menos 6 caracteres.');
        }
    }
    isInstitutionalEmail(email) {
        return email.trim().toLowerCase().endsWith(institutionalDomain);
    }
    buildInstitutionalCode(nombres, apellidos) {
        const base = `${nombres.trim().charAt(0)}${apellidos.trim().charAt(0)}`.toUpperCase();
        const timestamp = Date.now().toString().slice(-6);
        return `${base}${timestamp}`;
    }
    buildAuthResponse(user) {
        const userDto = this.toUserDto(user);
        return {
            token: (0, auth_1.generateAccessToken)(userDto),
            usuario: userDto,
        };
    }
    toUserDto(user) {
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
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map