"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const zod_1 = require("zod");
const api_error_1 = require("../utils/api-error");
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
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map