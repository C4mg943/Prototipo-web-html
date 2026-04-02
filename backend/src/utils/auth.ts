import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { env } from '../config/env';
import { AuthUserDto, JwtAccessPayload } from '../models/user.model';

export function generateAccessToken(user: AuthUserDto): string {
  const payload: JwtAccessPayload = {
    sub: user.id,
    roleId: user.idRol,
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

  if (!isJwtAccessPayload(decoded)) {
    throw new Error('Token inválido.');
  }

  return decoded;
}

function isJwtAccessPayload(payload: unknown): payload is JwtAccessPayload {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const candidate = payload as Record<string, unknown>;

  return (
    typeof candidate.sub === 'number' &&
    typeof candidate.roleId === 'number' &&
    typeof candidate.email === 'string'
  );
}
