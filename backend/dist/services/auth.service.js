"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const api_error_1 = require("../utils/api-error");
const auth_1 = require("../utils/auth");
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
        if (!user || !user.esta_activo) {
            throw new api_error_1.ApiError(401, 'Credenciales inválidas.');
        }
        const isPasswordValid = await bcryptjs_1.default.compare(input.contrasena, user.hash_contrasena);
        if (!isPasswordValid) {
            throw new api_error_1.ApiError(401, 'Credenciales inválidas.');
        }
        await this.userRepository.updateLastLogin(user.id);
        return this.buildAuthResponse(user);
    }
    async me(userId) {
        const user = await this.userRepository.findById(userId);
        if (!user || !user.esta_activo) {
            throw new api_error_1.ApiError(404, 'Usuario no encontrado o inactivo.');
        }
        return this.toUserDto(user);
    }
    async logout() {
        return {
            message: 'Sesión cerrada exitosamente.',
        };
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
            idRol: user.id_rol,
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