import authRoutes from './routes/authRoutes.js'; 
import userRoutes from './routes/userRoutes.js';
import inventarioRoutes from './routes/inventarioRoutes.js';
import servicioRoutes from './routes/serviciosRoutes.js';
import tercerRoutes from './routes/serviciosTercerosRoutes.js';
import ordenRoutes from './routes/ordenRoutes.js';
import vehiculoRoutes from './routes/vehiculoRoutes.js';

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// ── CORS restrictivo ─────────────────────────────────────────────────────────
const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : process.env.FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());

// ── Rate limiting: login ────────────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 3 * 60 * 1000, // 3 minutos
  max: 10,                  // máximo 10 intentos por IP
  message: {
    message: 'Demasiados intentos de inicio de sesión. Intenta nuevamente en 3 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/login', loginLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/servicios', servicioRoutes);
app.use('/api/terceros', tercerRoutes);
app.use('/api/ordenes', ordenRoutes);
app.use('/api/vehiculos', vehiculoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0',() => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});