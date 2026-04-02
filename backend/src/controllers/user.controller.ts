import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/api-error';
import { UserService } from '../services/user.service';

export class UserController {
  constructor(private readonly userService: UserService) {}

  updateMyPhoto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.authUser) {
        throw new ApiError(401, 'No autorizado.');
      }

      if (!req.file) {
        throw new ApiError(400, 'No se recibió ninguna imagen.');
      }

      const photoUrl = `/uploads/${req.file.filename}`;
      const data = await this.userService.updateMyPhoto(req.authUser.id, photoUrl);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };
}
