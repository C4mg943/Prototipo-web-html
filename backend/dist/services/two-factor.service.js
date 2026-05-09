"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.twoFactorService = exports.TwoFactorService = void 0;
const speakeasy_1 = __importDefault(require("speakeasy"));
const qrcode_1 = __importDefault(require("qrcode"));
const pool_1 = require("../db/pool");
const api_error_1 = require("../utils/api-error");
class TwoFactorService {
    /**
     * Genera un código QR para configurar 2FA
     */
    async setup2FA(userId, email) {
        // Generar secreto TOTP
        const secret = speakeasy_1.default.generateSecret({
            name: `UniDeportes (${email})`,
            issuer: 'UniDeportes',
            length: 20
        });
        // Guardar el secreto temporalmente en la base de datos (no habilitado aún)
        await pool_1.pool.query(`UPDATE usuarios 
       SET two_factor_secret = $1, 
           actualizado_en = NOW() 
       WHERE id = $2`, [secret.base32, userId]);
        // Generar código QR
        const qrCode = await qrcode_1.default.toDataURL(secret.otpauth_url);
        // Generar un token temporal para verificar el código
        const tempToken = `2fa_setup_${userId}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        return {
            secret: secret.base32,
            qrCode,
            tempToken
        };
    }
    /**
     * Verifica el código TOTP y habilita 2FA
     */
    async verifyAndEnable2FA(userId, code) {
        // Obtener el secreto guardado
        const result = await pool_1.pool.query('SELECT two_factor_secret FROM usuarios WHERE id = $1', [userId]);
        if (result.rows.length === 0) {
            throw new api_error_1.ApiError(404, 'Usuario no encontrado.');
        }
        const secret = result.rows[0]?.two_factor_secret;
        if (!secret) {
            throw new api_error_1.ApiError(400, 'No hay configuración de 2FA iniciada. Primero llama al endpoint de setup.');
        }
        // Verificar el código TOTP
        const verified = speakeasy_1.default.totp.verify({
            secret,
            encoding: 'base32',
            token: code,
            window: 1 // Permite 1 código antes/después por posibles errores de sincronización
        });
        if (!verified) {
            return {
                success: false,
                message: 'Código inválido. Verifica que el código de Google Authenticator sea correcto.'
            };
        }
        // Habilitar 2FA
        await pool_1.pool.query(`UPDATE usuarios 
       SET two_factor_enabled = TRUE, 
           actualizado_en = NOW() 
       WHERE id = $1`, [userId]);
        return {
            success: true,
            message: '2FA habilitado exitosamente.'
        };
    }
    /**
     * Verifica el código TOTP en el login
     */
    async verifyCode(userId, code) {
        // Obtener el secreto guardado
        const result = await pool_1.pool.query('SELECT two_factor_secret FROM usuarios WHERE id = $1 AND two_factor_enabled = TRUE', [userId]);
        if (result.rows.length === 0) {
            throw new api_error_1.ApiError(400, '2FA no está habilitado para este usuario.');
        }
        const secret = result.rows[0]?.two_factor_secret;
        if (!secret) {
            throw new api_error_1.ApiError(400, 'Error de configuración de 2FA.');
        }
        // Verificar el código TOTP
        const verified = speakeasy_1.default.totp.verify({
            secret,
            encoding: 'base32',
            token: code,
            window: 1
        });
        if (!verified) {
            return {
                success: false,
                message: 'Código inválido.'
            };
        }
        return {
            success: true,
            message: 'Código verificado correctamente.'
        };
    }
    /**
     * Deshabilita 2FA (requiere contraseña del usuario)
     */
    async disable2FA(userId, password) {
        // Verificar la contraseña primero
        const result = await pool_1.pool.query('SELECT hash_contrasena FROM usuarios WHERE id = $1', [userId]);
        if (result.rows.length === 0) {
            throw new api_error_1.ApiError(404, 'Usuario no encontrado.');
        }
        const bcrypt = await import('bcryptjs');
        const isValid = await bcrypt.compare(password, result.rows[0].hash_contrasena);
        if (!isValid) {
            return {
                success: false,
                message: 'Contraseña incorrecta.'
            };
        }
        // Deshabilitar 2FA
        await pool_1.pool.query(`UPDATE usuarios 
       SET two_factor_enabled = FALSE, 
           two_factor_secret = NULL,
           actualizado_en = NOW() 
       WHERE id = $1`, [userId]);
        return {
            success: true,
            message: '2FA deshabilitado exitosamente.'
        };
    }
    /**
     * Obtiene el estado de 2FA del usuario
     */
    async get2FAStatus(userId) {
        const result = await pool_1.pool.query('SELECT two_factor_enabled FROM usuarios WHERE id = $1', [userId]);
        if (result.rows.length === 0) {
            throw new api_error_1.ApiError(404, 'Usuario no encontrado.');
        }
        return {
            enabled: result.rows[0].two_factor_enabled || false
        };
    }
}
exports.TwoFactorService = TwoFactorService;
exports.twoFactorService = new TwoFactorService();
//# sourceMappingURL=two-factor.service.js.map