import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { UserRepository } from '../repositories/user.repository';
import { AuthService } from '../services/auth.service';

const authRouter = Router();

const userRepository = new UserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);
authRouter.post('/google', authController.googleLogin);
authRouter.get('/me', authMiddleware, authController.me);
authRouter.post('/logout', authMiddleware, authController.logout);

export { authRouter };
