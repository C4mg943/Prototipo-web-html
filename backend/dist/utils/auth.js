"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAccessToken = generateAccessToken;
exports.verifyAccessToken = verifyAccessToken;
exports.createTempToken = createTempToken;
exports.verifyTempToken = verifyTempToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
function generateAccessToken(user) {
    const payload = {
        sub: user.id,
        roleId: Number(user.idRol),
        email: user.correo,
    };
    const expiresInValue = env_1.env.jwtExpiresIn;
    const numericExpiresIn = Number(expiresInValue);
    const signOptions = {
        expiresIn: Number.isNaN(numericExpiresIn)
            ? expiresInValue
            : numericExpiresIn,
    };
    return jsonwebtoken_1.default.sign(payload, env_1.env.jwtSecret, signOptions);
}
function verifyAccessToken(token) {
    const decoded = jsonwebtoken_1.default.verify(token, env_1.env.jwtSecret);
    const normalized = normalizeJwtAccessPayload(decoded);
    if (!normalized) {
        throw new Error('Token inválido.');
    }
    return normalized;
}
function normalizeJwtAccessPayload(payload) {
    if (!payload || typeof payload !== 'object') {
        return null;
    }
    const candidate = payload;
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
function parseNumericClaim(value) {
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
function createTempToken(payload) {
    // Token temporal de 5 minutos para el flujo de 2FA
    return jsonwebtoken_1.default.sign(payload, env_1.env.jwtSecret, { expiresIn: '5m' });
}
function verifyTempToken(token) {
    const decoded = jsonwebtoken_1.default.verify(token, env_1.env.jwtSecret);
    return decoded;
}
//# sourceMappingURL=auth.js.map