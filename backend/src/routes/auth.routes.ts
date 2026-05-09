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

// Rutas públicas (para verificar 2FA después del login)
authRouter.post('/verify-2fa', authController.verify2FA);
authRouter.post('/recover-with-2fa', authController.recoverWith2FA);

// Rutas protegidas (requieren estar logueado)
authRouter.get('/me', authMiddleware, authController.me);
authRouter.post('/logout', authMiddleware, authController.logout);
authRouter.get('/2fa/status', authMiddleware, authController.get2FAStatus);
authRouter.post('/2fa/setup', authMiddleware, authController.setup2FA);
authRouter.post('/2fa/confirm', authMiddleware, authController.confirm2FA);
authRouter.post('/2fa/disable', authMiddleware, authController.disable2FA);

export { authRouter };
