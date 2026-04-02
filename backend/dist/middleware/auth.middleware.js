"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const api_error_1 = require("../utils/api-error");
const auth_1 = require("../utils/auth");
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