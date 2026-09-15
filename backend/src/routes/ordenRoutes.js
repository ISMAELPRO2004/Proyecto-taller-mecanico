import { Router } from 'express';
import {
  crearOrden,
  listarOrdenes,
  obtenerOrdenPorId,
  actualizarOrden,
  actualizarEstadoOrden,
  eliminarOrden,
  cerrarOrden,
} from '../controllers/ordenController.js';
import { authenticateJWT, authorize } from '../middleware/auth.js';
import { auditLog } from '../middleware/audit.js';
import { validateBody, validateParams } from '../middleware/validateBody.js';
import {
  crearOrdenSchema,
  actualizarOrdenSchema,
  actualizarEstadoSchema,
  idParamSchema,
} from '../schemas/index.js';

const router = Router();

router.get('/', authenticateJWT, listarOrdenes);

router.get('/:id', authenticateJWT, validateParams(idParamSchema), obtenerOrdenPorId);

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
  actualizarOrden
);

router.put('/:id/estado',
  authenticateJWT,
  authorize(['ADMIN', 'RESPONSABLE']),
  validateParams(idParamSchema),
  validateBody(actualizarEstadoSchema),
  auditLog('CAMBIO DE ESTADO EN OT'),
  actualizarEstadoOrden
);

router.patch('/:id/cerrar',
  authenticateJWT,
  authorize(['ADMIN']),
  validateParams(idParamSchema),
  auditLog('CIERRE DEFINITIVO OT'),
  cerrarOrden
);

router.delete('/:id',
  authenticateJWT,
  authorize(['ADMIN']),
  validateParams(idParamSchema),
  auditLog('ELIMINAR ORDEN DE TRABAJO'),
  eliminarOrden
);

export default router;
