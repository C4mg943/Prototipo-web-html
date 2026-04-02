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
authRouter.get('/me', auth_middleware_1.authMiddleware, authController.me);
authRouter.post('/logout', auth_middleware_1.authMiddleware, authController.logout);
//# sourceMappingURL=auth.routes.js.map