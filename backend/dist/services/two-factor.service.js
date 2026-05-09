"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwoFactorService = void 0;
const qrcode_1 = __importDefault(require("qrcode"));
const pool_1 = require("../db/pool");
const api_error_1 = require("../utils/api-error");
const speakeasy = require('speakeasy');
function generateTOTP(secret) {
    return speakeasy.totp({ key: secret, encoding: 'base32' });
}
function verifyTOTP(secret, token, window = 1) {
    const time = Math.floor(Date.now() / 1000 / 30);
    for (let i = -window; i <= window; i++) {
        const t = time + i;
        const expected = speakeasy.totp({ key: secret, encoding: 'base32', time: t });
        if (expected === token) {
            return true;
        }
    }
    return false;
}
function generateOTPAuthURL(email, secret) {
    return `otpauth://totp/UniDeportes:${email}?secret=${secret}&issuer=UniDeportes`;
}
class TwoFactorService {
    async setup2FA(userId, email) {
        const key = speakeasy.generate_key({ length: 20 });
        const base32 = key.base32;
        await pool_1.pool.query(`UPDATE usuarios 
       SET two_factor_secret = $1, 
           actualizado_en = NOW() 
       WHERE id = $2`, [base32, userId]);
        const otpauthURL = generateOTPAuthURL(email, base32);
        const qrCode = await qrcode_1.default.toDataURL(otpauthURL);
        const tempToken = `2fa_setup_${userId}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        return {
            secret: base32,
            qrCode,
            tempToken
        };
    }
    async verifyAndEnable2FA(userId, code) {
        const result = await pool_1.pool.query('SELECT two_factor_secret FROM usuarios WHERE id = $1', [userId]);
        if (result.rows.length === 0) {
            throw new api_error_1.ApiError(404, 'Usuario no encontrado.');
        }
        const secret = result.rows[0]?.two_factor_secret;
        if (!secret) {
            throw new api_error_1.ApiError(400, 'No hay configuración de 2FA iniciada.');
        }
        const verified = verifyTOTP(secret, code);
        if (!verified) {
            return {
                success: false,
                message: 'Código inválido.'
            };
        }
        await pool_1.pool.query(`UPDATE usuarios 
       SET two_factor_enabled = TRUE, 
           actualizado_en = NOW() 
       WHERE id = $1`, [userId]);
        return {
            success: true,
            message: '2FA habilitado exitosamente.'
        };
    }
    async verifyCode(userId, code) {
        const result = await pool_1.pool.query('SELECT two_factor_secret FROM usuarios WHERE id = $1 AND two_factor_enabled = TRUE', [userId]);
        if (result.rows.length === 0) {
            throw new api_error_1.ApiError(400, '2FA no está habilitado para este usuario.');
        }
        const secret = result.rows[0]?.two_factor_secret;
        if (!secret) {
            throw new api_error_1.ApiError(400, 'Error de configuración de 2FA.');
        }
        const verified = verifyTOTP(secret, code);
        if (!verified) {
            return {
                success: false,
                message: 'Código inválido.'
            };
        }
        return {
            success: true,
            message: 'Código verificado exitosamente.'
        };
    }
    async disable2FA(userId) {
        await pool_1.pool.query(`UPDATE usuarios 
       SET two_factor_enabled = FALSE, 
           two_factor_secret = NULL, 
           actualizado_en = NOW() 
       WHERE id = $1`, [userId]);
    }
    async get2FAStatus(userId) {
        const result = await pool_1.pool.query('SELECT two_factor_enabled FROM usuarios WHERE id = $1', [userId]);
        if (result.rows.length === 0) {
            throw new api_error_1.ApiError(404, 'Usuario no encontrado.');
        }
        return {
            enabled: result.rows[0]?.two_factor_enabled || false
        };
    }
}
exports.TwoFactorService = TwoFactorService;
//# sourceMappingURL=two-factor.service.js.map