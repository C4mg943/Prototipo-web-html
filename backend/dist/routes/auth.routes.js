"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const user_repository_1 = require("../repositories/user.repository");
const auth_service_1 = require("../services/auth.service");
const authRouter = (0, express_1.Router)();
exports.authRouter = authRouter;
const userRepository = new user_repository_1.UserRepository();
const authService = new auth_service_1.AuthService(userRepository);
const authController = new auth_controller_1.AuthController(authService);
authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);
// Rutas públicas (para verificar 2FA después del login)
authRouter.post('/verify-2fa', authController.verify2FA);
// Rutas protegidas (requieren estar logueado)
authRouter.get('/me', auth_middleware_1.authMiddleware, authController.me);
authRouter.post('/logout', auth_middleware_1.authMiddleware, authController.logout);
authRouter.get('/2fa/status', auth_middleware_1.authMiddleware, authController.get2FAStatus);
authRouter.post('/2fa/setup', auth_middleware_1.authMiddleware, authController.setup2FA);
authRouter.post('/2fa/confirm', auth_middleware_1.authMiddleware, authController.confirm2FA);
authRouter.post('/2fa/disable', auth_middleware_1.authMiddleware, authController.disable2FA);
//# sourceMappingURL=auth.routes.js.map