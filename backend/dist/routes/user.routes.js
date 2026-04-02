"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const user_repository_1 = require("../repositories/user.repository");
const user_service_1 = require("../services/user.service");
const userRouter = (0, express_1.Router)();
exports.userRouter = userRouter;
const userRepository = new user_repository_1.UserRepository();
const userService = new user_service_1.UserService(userRepository);
const userController = new user_controller_1.UserController(userService);
userRouter.patch('/me/photo', auth_middleware_1.authMiddleware, upload_middleware_1.uploadSingleImage, userController.updateMyPhoto);
//# sourceMappingURL=user.routes.js.map