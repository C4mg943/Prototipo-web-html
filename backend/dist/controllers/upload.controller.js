"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const api_error_1 = require("../utils/api-error");
class UploadController {
    constructor() {
        this.uploadImage = async (req, res, next) => {
            try {
                if (!req.file) {
                    throw new api_error_1.ApiError(400, 'No se recibió ninguna imagen.');
                }
                const data = {
                    url: `/uploads/${req.file.filename}`,
                };
                res.status(201).json({
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
exports.UploadController = UploadController;
//# sourceMappingURL=upload.controller.js.map