import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { uploadSingleImage } from '../middleware/upload.middleware';
import { UserRepository } from '../repositories/user.repository';
import { UserService } from '../services/user.service';

const userRouter = Router();

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

userRouter.patch('/me/photo', authMiddleware, uploadSingleImage, userController.updateMyPhoto);

export { userRouter };
