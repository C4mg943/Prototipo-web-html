import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { env } from '../config/env';
import { AuthUserDto, JwtAccessPayload } from '../models/user.model';

export function generateAccessToken(user: AuthUserDto): string {
  const payload: JwtAccessPayload = {
    sub: user.id,
    roleId: Number(user.idRol),
    email: user.correo,
  };

  const expiresInValue = env.jwtExpiresIn;
  const numericExpiresIn = Number(expiresInValue);

  const signOptions: SignOptions = {
    expiresIn: Number.isNaN(numericExpiresIn)
      ? (expiresInValue as StringValue)
      : numericExpiresIn,
  };

  return jwt.sign(payload, env.jwtSecret, signOptions);
}

export function verifyAccessToken(token: string): JwtAccessPayload {
  const decoded = jwt.verify(token, env.jwtSecret);

  const normalized = normalizeJwtAccessPayload(decoded);

  if (!normalized) {
    throw new Error('Token inválido.');
  }

  return normalized;
}

function normalizeJwtAccessPayload(payload: unknown): JwtAccessPayload | null {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const candidate = payload as Record<string, unknown>;
  const sub = parseNumericClaim(candidate.sub);
  const roleId = parseNumericClaim(candidate.roleId);
  const email = candidate.email;

  if (sub === null || roleId === null || typeof email !== 'string') {
    return null;
  }

  return {
    sub,
    roleId,
    email,
  };
}

function parseNumericClaim(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}
