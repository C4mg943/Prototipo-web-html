"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const api_error_1 = require("../utils/api-error");
class UserController {
    constructor(userService) {
        this.userService = userService;
        this.updateMyPhoto = async (req, res, next) => {
            try {
                if (!req.authUser) {
                    throw new api_error_1.ApiError(401, 'No autorizado.');
                }
                if (!req.file) {
                    throw new api_error_1.ApiError(400, 'No se recibió ninguna imagen.');
                }
                const photoUrl = `/uploads/${req.file.filename}`;
                const data = await this.userService.updateMyPhoto(req.authUser.id, photoUrl);
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
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map