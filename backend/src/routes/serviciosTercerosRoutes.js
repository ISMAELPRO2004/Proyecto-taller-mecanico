import { Router } from 'express';
import { listarServiciosTerceros, crearServicioTercero, actualizarServicioTercero, eliminarServicioTercero } from '../controllers/serviciosTercerosController.js';
import { authenticateJWT, authorize } from '../middleware/auth.js';
import { auditLog } from '../middleware/audit.js';

const router = Router();

// Todos los usuarios autenticados pueden ver el catálogo
router.get('/', authenticateJWT, listarServiciosTerceros);

// Solo el ADMIN puede crear, editar o eliminar servicios de terceros
router.post('/', authenticateJWT, authorize(['ADMIN']), auditLog('NUEVO SERVICIO DE TERCERO EN CATÁLOGO'), crearServicioTercero);
router.put('/:id', authenticateJWT, authorize(['ADMIN']), auditLog('ACTUALIZACIÓN DE SERVICIO DE TERCERO'), actualizarServicioTercero);
router.delete('/:id', authenticateJWT, authorize(['ADMIN']), auditLog('ELIMINACIÓN DE SERVICIO DE TERCERO'), eliminarServicioTercero);

export default router;