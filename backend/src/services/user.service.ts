import { UserRepository } from '../repositories/user.repository';
import { ApiError } from '../utils/api-error';

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async updateMyPhoto(userId: number, photoUrl: string): Promise<{ fotoPerfilUrl: string }> {
    const user = await this.userRepository.findById(userId);

    if (!user || !user.esta_activo) {
      throw new ApiError(404, 'Usuario no encontrado o inactivo.');
    }

    await this.userRepository.updatePhoto(userId, photoUrl);

    return {
      fotoPerfilUrl: photoUrl,
    };
  }
}
