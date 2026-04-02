import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { uploadSingleImage } from '../middleware/upload.middleware';

const uploadRouter = Router();

const uploadController = new UploadController();

uploadRouter.post('/image', authMiddleware, uploadSingleImage, uploadController.uploadImage);

export { uploadRouter };
