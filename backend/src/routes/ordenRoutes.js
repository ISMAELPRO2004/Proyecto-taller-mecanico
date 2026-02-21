import { Router } from 'express';
import { crearOrden, listarOrdenes } from '../controllers/ordenController.js';
import { authenticateJWT, authorize } from '../middleware/auth.js';
import { auditLog } from '../middleware/audit.js';

const router = Router();

// Listar todas las órdenes (Todos los usuarios autenticados)
router.get('/', authenticateJWT, listarOrdenes);

// Crear nueva orden (Admin y Responsable)
router.post('/', 
  authenticateJWT, 
  authorize(['ADMIN', 'RESPONSABLE']), 
  auditLog('REGISTRO DE NUEVA ORDEN DE TRABAJO'), 
  crearOrden
);

export default router;