import { Router } from 'express';
import { listarMateriales, crearMaterial, actualizarPrecio } from '../controllers/inventarioController.js';
import { authenticateJWT, authorize } from '../middleware/auth.js';
import { auditLog } from '../middleware/audit.js';

const router = Router();

// Todos los usuarios autenticados pueden ver el catálogo
router.get('/', authenticateJWT, listarMateriales);

// Solo el ADMIN puede crear o cambiar precios
router.post('/', authenticateJWT, authorize(['ADMIN']), auditLog('NUEVO MATERIAL EN CATÁLOGO'), crearMaterial);
router.put('/:id', authenticateJWT, authorize(['ADMIN']), auditLog('ACTUALIZACIÓN DE PRECIO'), actualizarPrecio);

export default router;