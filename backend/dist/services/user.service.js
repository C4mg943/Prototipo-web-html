"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const api_error_1 = require("../utils/api-error");
class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async updateMyPhoto(userId, photoUrl) {
        const user = await this.userRepository.findById(userId);
        if (!user || !user.esta_activo) {
            throw new api_error_1.ApiError(404, 'Usuario no encontrado o inactivo.');
        }
        await this.userRepository.updatePhoto(userId, photoUrl);
        return {
            fotoPerfilUrl: photoUrl,
        };
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map