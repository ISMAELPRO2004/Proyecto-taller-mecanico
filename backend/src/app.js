import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import { env } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import auditoriaRoutes from './routes/auditoriaRoutes.js';
import inventarioRoutes from './routes/inventarioRoutes.js';
import servicioRoutes from './routes/serviciosRoutes.js';
import tercerRoutes from './routes/serviciosTercerosRoutes.js';
import ordenRoutes from './routes/ordenRoutes.js';
import vehiculoRoutes from './routes/vehiculoRoutes.js';
import clienteRoutes from './routes/clienteRoutes.js';

export const createApp = () => {
  const app = express();

  app.use(cors({
    origin: env.allowedOrigins.length > 0 ? env.allowedOrigins : env.frontendUrl,
    credentials: true,
  }));

  app.use(express.json({ limit: '10mb' }));

  const loginLimiter = rateLimit({
    windowMs: 3 * 60 * 1000,
    max: 10,
    message: {
      message: 'Demasiados intentos de inicio de sesión. Intenta nuevamente en 3 minutos.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/auth/login', loginLimiter);

  app.use('/api/auth', authRoutes);
  app.use('/api/usuarios', userRoutes);
  app.use('/api/auditoria', auditoriaRoutes);
  app.use('/api/inventario', inventarioRoutes);
  app.use('/api/servicios', servicioRoutes);
  app.use('/api/terceros', tercerRoutes);
  app.use('/api/ordenes', ordenRoutes);
  app.use('/api/vehiculos', vehiculoRoutes);
  app.use('/api/clientes', clienteRoutes);

  return app;
};
