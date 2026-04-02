"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRouter = void 0;
const express_1 = require("express");
const upload_controller_1 = require("../controllers/upload.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const uploadRouter = (0, express_1.Router)();
exports.uploadRouter = uploadRouter;
const uploadController = new upload_controller_1.UploadController();
uploadRouter.post('/image', auth_middleware_1.authMiddleware, upload_middleware_1.uploadSingleImage, uploadController.uploadImage);
//# sourceMappingURL=upload.routes.js.map