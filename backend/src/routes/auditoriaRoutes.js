import { Router } from 'express';
import { listarLogs } from '../controllers/auditoriaController.js';
import { authenticateJWT, authorize } from '../middleware/auth.js';

const router = Router();

router.get(
  '/logs',
  authenticateJWT,
  authorize(['ADMIN']),
  listarLogs
);

export default router;
