"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAccessToken = generateAccessToken;
exports.verifyAccessToken = verifyAccessToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
function generateAccessToken(user) {
    const payload = {
        sub: user.id,
        roleId: user.idRol,
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
    if (!isJwtAccessPayload(decoded)) {
        throw new Error('Token inválido.');
    }
    return decoded;
}
function isJwtAccessPayload(payload) {
    if (!payload || typeof payload !== 'object') {
        return false;
    }
    const candidate = payload;
    return (typeof candidate.sub === 'number' &&
        typeof candidate.roleId === 'number' &&
        typeof candidate.email === 'string');
}
//# sourceMappingURL=auth.js.map