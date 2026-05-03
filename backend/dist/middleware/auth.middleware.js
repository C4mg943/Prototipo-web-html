"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = requireAdmin;
exports.requireVigilante = requireVigilante;
exports.authMiddleware = authMiddleware;
const api_error_1 = require("../utils/api-error");
const auth_1 = require("../utils/auth");
// Middleware para requerir rol de administrador
function requireAdmin(req, _res, next) {
    if (!req.authUser) {
        next(new api_error_1.ApiError(401, 'No autorizado. Token no proporcionado.'));
        return;
    }
    // roleId 3 = ADMINISTRADOR
    if (req.authUser.roleId !== 3) {
        next(new api_error_1.ApiError(403, 'Acceso denegado. Se requiere rol de administrador.'));
        return;
    }
    next();
}
// Middleware para requerir rol de vigilante
function requireVigilante(req, _res, next) {
    if (!req.authUser) {
        next(new api_error_1.ApiError(401, 'No autorizado. Token no proporcionado.'));
        return;
    }
    // roleId 2 = VIGILANTE
    if (req.authUser.roleId !== 2 && req.authUser.roleId !== 3) {
        next(new api_error_1.ApiError(403, 'Acceso denegado. Se requiere rol de vigilante o administrador.'));
        return;
    }
    next();
}
function authMiddleware(req, _res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        next(new api_error_1.ApiError(401, 'No autorizado. Token no proporcionado.'));
        return;
    }
    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
        next(new api_error_1.ApiError(401, 'No autorizado. Formato de token inválido.'));
        return;
    }
    try {
        const payload = (0, auth_1.verifyAccessToken)(token);
        req.authUser = {
            id: payload.sub,
            roleId: payload.roleId,
            email: payload.email,
        };
        next();
    }
    catch {
        next(new api_error_1.ApiError(401, 'No autorizado. Token inválido o expirado.'));
    }
}
//# sourceMappingURL=auth.middleware.js.map