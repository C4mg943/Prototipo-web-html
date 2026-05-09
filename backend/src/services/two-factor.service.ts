import QRCode from 'qrcode';
import { pool } from '../db/pool';
import { ApiError } from '../utils/api-error';

const speakeasy = require('speakeasy');

interface TwoFASetupResult {
  secret: string;
  qrCode: string;
  tempToken: string;
}

interface TwoFAVerifyResult {
  success: boolean;
  message: string;
}

function generateTOTP(secret: string): string {
  return speakeasy.totp({ key: secret, encoding: 'base32' });
}

function verifyTOTP(secret: string, token: string, window: number = 1): boolean {
  const now = Math.floor(Date.now() / 1000);
  for (let i = -window; i <= window; i++) {
    const t = now + (i * 30);
    const expected = speakeasy.totp({ key: secret, encoding: 'base32', time: t });
    if (expected === token) {
      return true;
    }
  }
  return false;
}

function generateOTPAuthURL(email: string, secret: string): string {
  return `otpauth://totp/UniDeportes:${email}?secret=${secret}&issuer=UniDeportes`;
}

export class TwoFactorService {
  
  async setup2FA(userId: number, email: string): Promise<TwoFASetupResult> {
    const key = speakeasy.generate_key({ length: 20 });
    const base32 = key.base32;

    await pool.query(
      `UPDATE usuarios 
       SET two_factor_secret = $1, 
           actualizado_en = NOW() 
       WHERE id = $2`,
      [base32, userId]
    );

    const otpauthURL = generateOTPAuthURL(email, base32);
    const qrCode = await QRCode.toDataURL(otpauthURL);

    const tempToken = `2fa_setup_${userId}_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    return {
      secret: base32,
      qrCode,
      tempToken
    };
  }

  async verifyAndEnable2FA(userId: number, code: string): Promise<TwoFAVerifyResult> {
    const result = await pool.query(
      'SELECT two_factor_secret FROM usuarios WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new ApiError(404, 'Usuario no encontrado.');
    }

    const secret = result.rows[0]?.two_factor_secret;
    if (!secret) {
      throw new ApiError(400, 'No hay configuración de 2FA iniciada.');
    }

    const verified = verifyTOTP(secret, code);

    if (!verified) {
      return {
        success: false,
        message: 'Código inválido.'
      };
    }

    await pool.query(
      `UPDATE usuarios 
       SET two_factor_enabled = TRUE, 
           actualizado_en = NOW() 
       WHERE id = $1`,
      [userId]
    );

    return {
      success: true,
      message: '2FA habilitado exitosamente.'
    };
  }

  async verifyCode(userId: number, code: string): Promise<TwoFAVerifyResult> {
    const result = await pool.query(
      'SELECT two_factor_secret FROM usuarios WHERE id = $1 AND two_factor_enabled = TRUE',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new ApiError(400, '2FA no está habilitado para este usuario.');
    }

    const secret = result.rows[0]?.two_factor_secret;
    if (!secret) {
      throw new ApiError(400, 'Error de configuración de 2FA.');
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

  async disable2FA(userId: number): Promise<void> {
    await pool.query(
      `UPDATE usuarios 
       SET two_factor_enabled = FALSE, 
           two_factor_secret = NULL, 
           actualizado_en = NOW() 
       WHERE id = $1`,
      [userId]
    );
  }

  async get2FAStatus(userId: number): Promise<{ enabled: boolean }> {
    const result = await pool.query(
      'SELECT two_factor_enabled FROM usuarios WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new ApiError(404, 'Usuario no encontrado.');
    }

    return {
      enabled: result.rows[0]?.two_factor_enabled || false
    };
  }
}