import authRoutes from './routes/authRoutes.js'; 
import userRoutes from './routes/userRoutes.js';
import inventarioRoutes from './routes/inventarioRoutes.js';
import servicioRoutes from './routes/serviciosRoutes.js';
import tercerRoutes from './routes/serviciosTercerosRoutes.js';
import ordenRoutes from './routes/ordenRoutes.js';
import vehiculoRoutes from './routes/vehiculoRoutes.js';

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/servicios', servicioRoutes);
app.use('/api/terceros', tercerRoutes);
app.use('/api/ordenes', ordenRoutes);
app.use('/api/vehiculos', vehiculoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});