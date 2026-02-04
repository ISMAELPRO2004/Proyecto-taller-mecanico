import { Router } from 'express';
import { login } from '../controllers/authController';

const router = Router();

// Ruta: POST /api/auth/login
router.post('/login', login);

export default router;