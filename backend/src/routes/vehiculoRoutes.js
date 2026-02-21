import { Router } from 'express';
import { buscarPorPlaca } from '../controllers/vehiculoController.js'; // Ajustar según nombre de archivo
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

router.get('/:placa', authenticateJWT, buscarPorPlaca);

export default router;