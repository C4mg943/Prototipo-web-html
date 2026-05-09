"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const zod_1 = require("zod");
const api_error_1 = require("../utils/api-error");
const auth_js_1 = require("../utils/auth.js");
const registerSchema = zod_1.z.object({
    nombres: zod_1.z.string().min(1),
    apellidos: zod_1.z.string().min(1),
    correo: zod_1.z.string().email(),
    contrasena: zod_1.z.string().min(8),
});
const loginSchema = zod_1.z.object({
    correo: zod_1.z.string().email(),
    contrasena: zod_1.z.string().min(6),
});
const verify2FASchema = zod_1.z.object({
    code: zod_1.z.string().length(6, 'El código debe tener 6 dígitos'),
});
const disable2FASchema = zod_1.z.object({
    contrasena: zod_1.z.string().min(6),
});
class AuthController {
    constructor(authService) {
        this.authService = authService;
        this.register = async (req, res, next) => {
            try {
                const payload = registerSchema.parse(req.body);
                const data = await this.authService.register(payload);
                res.status(201).json({
                    success: true,
                    data,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.login = async (req, res, next) => {
            try {
                const payload = loginSchema.parse(req.body);
                const data = await this.authService.login(payload);
                res.status(200).json({
                    success: true,
                    data,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.me = async (req, res, next) => {
            try {
                if (!req.authUser) {
                    throw new api_error_1.ApiError(401, 'No autorizado.');
                }
                const data = await this.authService.me(req.authUser.id);
                res.status(200).json({
                    success: true,
                    data,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.logout = async (_req, res, next) => {
            try {
                const data = await this.authService.logout();
                res.status(200).json({
                    success: true,
                    message: data.message,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.setup2FA = async (req, res, next) => {
            try {
                if (!req.authUser) {
                    throw new api_error_1.ApiError(401, 'No autorizado.');
                }
                const userEmail = req.authUser.email;
                const data = await this.authService.setup2FA(req.authUser.id, userEmail);
                res.status(200).json({
                    success: true,
                    data,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.confirm2FA = async (req, res, next) => {
            try {
                if (!req.authUser) {
                    throw new api_error_1.ApiError(401, 'No autorizado.');
                }
                const payload = verify2FASchema.parse(req.body);
                const data = await this.authService.confirm2FA(req.authUser.id, payload.code);
                res.status(200).json({
                    success: true,
                    data,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.disable2FA = async (req, res, next) => {
            try {
                if (!req.authUser) {
                    throw new api_error_1.ApiError(401, 'No autorizado.');
                }
                const payload = disable2FASchema.parse(req.body);
                const data = await this.authService.disable2FA(req.authUser.id, payload.contrasena);
                res.status(200).json({
                    success: true,
                    data,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.get2FAStatus = async (req, res, next) => {
            try {
                if (!req.authUser) {
                    throw new api_error_1.ApiError(401, 'No autorizado.');
                }
                const data = await this.authService.get2FAStatus(req.authUser.id);
                res.status(200).json({
                    success: true,
                    data,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.verify2FA = async (req, res, next) => {
            try {
                const { tempToken, code } = req.body;
                if (!tempToken || !code) {
                    throw new api_error_1.ApiError(400, 'Se requiere token temporal y código de verificación.');
                }
                const decoded = (0, auth_js_1.verifyTempToken)(tempToken);
                if (decoded.step !== '2fa') {
                    throw new api_error_1.ApiError(400, 'Token inválido.');
                }
                const data = await this.authService.verify2FA(decoded.userId, code);
                res.status(200).json({
                    success: true,
                    data,
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map