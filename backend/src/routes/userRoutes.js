import { Router } from 'express';
import { crearUsuario, listarLogs } from '../controllers/userController.js';
import { authenticateJWT, authorize } from '../middleware/auth.js';
import { auditLog } from '../middleware/audit.js';

const router = Router();

// CRUD de usuarios (Solo Admin)
router.post('/', authenticateJWT, authorize(['ADMIN']), auditLog('CREACIÓN DE USUARIO'), crearUsuario);

// Ver logs de auditoría (Solo Admin)
router.get('/logs', authenticateJWT, authorize(['ADMIN']), listarLogs);

export default router;