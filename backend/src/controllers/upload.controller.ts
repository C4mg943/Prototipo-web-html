import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/api-error';

export class UploadController {
  uploadImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw new ApiError(400, 'No se recibió ninguna imagen.');
      }

      const data = {
        url: `/uploads/${req.file.filename}`,
      };

      res.status(201).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };
}
