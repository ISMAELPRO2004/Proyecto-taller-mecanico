import { Router } from 'express';
import { crearOrden, listarOrdenes, obtenerOrdenPorId, actualizarOrden, actualizarEstadoOrden, eliminarOrden, cerrarOrden } from '../controllers/ordenController.js';
import { authenticateJWT, authorize } from '../middleware/auth.js';
import { auditLog } from '../middleware/audit.js';
import { validateBody, validateParams } from '../middleware/validateBody.js';
import { crearOrdenSchema, actualizarOrdenSchema, actualizarEstadoSchema, idParamSchema } from '../middleware/validate.js';

const router = Router();

// 1. Listar todas las órdenes (Accesible para ADMIN y RESPONSABLE)
router.get('/', authenticateJWT, listarOrdenes);

// 2. Obtener el detalle profundo de una orden (Para el Modal de detalles)
router.get('/:id', authenticateJWT, validateParams(idParamSchema), obtenerOrdenPorId);

// 3. Crear nueva orden (Lógica transaccional con Vehículo y Catálogos)
router.post('/', 
  authenticateJWT, 
  authorize(['ADMIN', 'RESPONSABLE']),
  validateBody(crearOrdenSchema),
  auditLog('REGISTRO DE NUEVA ORDEN DE TRABAJO'), 
  crearOrden
);

router.put('/:id',
  authenticateJWT,
  authorize(['ADMIN', 'RESPONSABLE']),
  validateParams(idParamSchema),
  validateBody(actualizarOrdenSchema),
  auditLog('ACTUALIZAR ORDEN DE TRABAJO'),
  actualizarOrden);

// 4. Actualizar el estado de la orden (EN_REPARACION -> TERMINADO, etc.)
router.put('/:id/estado', 
  authenticateJWT, 
  authorize(['ADMIN', 'RESPONSABLE']), 
  validateParams(idParamSchema),
  validateBody(actualizarEstadoSchema),
  auditLog('CAMBIO DE ESTADO EN OT'), 
  actualizarEstadoOrden
);

// 5. Cerrar orden permanentemente (Acción restringida solo para el ADMIN)
router.patch('/:id/cerrar',
  authenticateJWT,
  authorize(['ADMIN']),
  validateParams(idParamSchema),
  auditLog('CIERRE DEFINITIVO OT'),
  cerrarOrden
);

// 6. Eliminar orden (Acción restringida solo para el ADMIN)
router.delete('/:id', 
  authenticateJWT, 
  authorize(['ADMIN']), 
  validateParams(idParamSchema),
  auditLog('ELIMINAR ORDEN DE TRABAJO'), 
  eliminarOrden
);

export default router;
