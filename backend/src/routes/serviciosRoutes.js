import { Router } from 'express';
import { listarServicios, crearServicio, actualizarServicio, eliminarServicio } from '../controllers/serviciosController.js';
import { authenticateJWT, authorize } from '../middleware/auth.js';
import { auditLog } from '../middleware/audit.js';

const router = Router();

// Todos los usuarios autenticados pueden ver el catálogo
router.get('/', authenticateJWT, listarServicios);

// Solo el ADMIN puede crear, editar o eliminar servicios
router.post('/', authenticateJWT, authorize(['ADMIN']), auditLog('NUEVO SERVICIO EN CATÁLOGO'), crearServicio);
router.put('/:id', authenticateJWT, authorize(['ADMIN']), auditLog('ACTUALIZACIÓN DE SERVICIO'), actualizarServicio);
router.delete('/:id', authenticateJWT, authorize(['ADMIN']), auditLog('ELIMINACIÓN DE SERVICIO'), eliminarServicio);

export default router;