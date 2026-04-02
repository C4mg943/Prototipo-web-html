import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'node:path';
import { env } from './config/env';
import { errorMiddleware } from './middleware/error.middleware';
import { authRouter } from './routes/auth.routes';
import { healthRouter } from './routes/health.routes';
import { reservaRouter } from './routes/reserva.routes';
import { uploadRouter } from './routes/upload.routes';
import { userRouter } from './routes/user.routes';

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin,
  }),
);
app.use(morgan('dev'));
app.use(express.json());
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

app.use('/api', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/reservas', reservaRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/users', userRouter);

app.use(errorMiddleware);
