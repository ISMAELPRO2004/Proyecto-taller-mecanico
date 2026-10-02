import { Router } from 'express';
import { listarLogs, obtenerFotoLog } from '../controllers/auditoriaController.js';
import { authenticateJWT, authorize } from '../middleware/auth.js';

const router = Router();

router.get(
  '/logs',
  authenticateJWT,
  authorize(['ADMIN']),
  listarLogs
);

router.get(
  '/foto',
  authenticateJWT,
  authorize(['ADMIN']),
  obtenerFotoLog
);

export default router;
