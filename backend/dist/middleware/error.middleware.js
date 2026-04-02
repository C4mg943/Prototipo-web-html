"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = errorMiddleware;
const zod_1 = require("zod");
const api_error_1 = require("../utils/api-error");
function errorMiddleware(error, _req, res, _next) {
    if (error instanceof api_error_1.ApiError) {
        res.status(error.statusCode).json({
            success: false,
            message: error.message,
            errors: error.errors,
        });
        return;
    }
    if (error instanceof zod_1.ZodError) {
        const errors = error.issues.map((issue) => issue.message);
        res.status(400).json({
            success: false,
            message: 'Datos de entrada inválidos.',
            errors,
        });
        return;
    }
    const message = error instanceof Error ? error.message : 'Error interno del servidor.';
    res.status(500).json({
        success: false,
        message,
    });
}
//# sourceMappingURL=error.middleware.js.map