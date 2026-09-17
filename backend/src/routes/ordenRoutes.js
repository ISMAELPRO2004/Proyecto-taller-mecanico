import { Router } from 'express';
import {
  crearOrden,
  listarOrdenes,
  obtenerOrdenPorId,
  actualizarOrden,
  actualizarEstadoOrden,
  eliminarOrden,
  cerrarOrden,
  aceptarOrden,
  subirFoto,
  quitarFoto,
  obtenerFoto,
} from '../controllers/ordenController.js';
import { authenticateJWT, authorize } from '../middleware/auth.js';
import { auditLog } from '../middleware/audit.js';
import { validateBody, validateParams } from '../middleware/validateBody.js';
import { uploadFoto } from '../middleware/uploadFoto.js';
import {
  crearBorradorOrdenSchema,
  actualizarOrdenSchema,
  actualizarEstadoSchema,
  aceptarOrdenSchema,
  idParamSchema,
  fotoParamSchema,
} from '../schemas/index.js';

const router = Router();

const ROLES_TODOS = ['ADMIN', 'SUPERVISOR', 'TECNICO', 'RECEPCIONISTA'];
const ROLES_CREAR = ['ADMIN', 'SUPERVISOR', 'TECNICO', 'RECEPCIONISTA'];
const ROLES_EDITAR = ['ADMIN', 'SUPERVISOR', 'TECNICO'];
const ROLES_ACEPTAR = ['ADMIN', 'SUPERVISOR'];
const ROLES_ADMIN = ['ADMIN'];

router.get('/', authenticateJWT, authorize(ROLES_TODOS), listarOrdenes);

router.get('/:id/foto/:tipo', authenticateJWT, authorize(ROLES_TODOS), validateParams(fotoParamSchema), obtenerFoto);
router.post('/:id/foto/:tipo', authenticateJWT, authorize(ROLES_TODOS), validateParams(fotoParamSchema), uploadFoto, subirFoto);
router.delete('/:id/foto/:tipo', authenticateJWT, authorize(ROLES_TODOS), validateParams(fotoParamSchema), quitarFoto);

router.get('/:id', authenticateJWT, authorize(ROLES_TODOS), validateParams(idParamSchema), obtenerOrdenPorId);

router.post('/',
  authenticateJWT,
  authorize(ROLES_CREAR),
  validateBody(crearBorradorOrdenSchema),
  auditLog('REGISTRO BORRADOR OT'),
  crearOrden
);

router.put('/:id',
  authenticateJWT,
  authorize(ROLES_EDITAR),
  validateParams(idParamSchema),
  validateBody(actualizarOrdenSchema),
  auditLog('ACTUALIZAR ORDEN'),
  actualizarOrden
);

router.post('/:id/aceptar',
  authenticateJWT,
  authorize(ROLES_ACEPTAR),
  validateParams(idParamSchema),
  validateBody(aceptarOrdenSchema),
  auditLog('ACEPTAR ORDEN'),
  aceptarOrden
);

router.put('/:id/estado',
  authenticateJWT,
  authorize(ROLES_EDITAR),
  validateParams(idParamSchema),
  validateBody(actualizarEstadoSchema),
  auditLog('CAMBIO DE ESTADO OT'),
  actualizarEstadoOrden
);

router.patch('/:id/cerrar',
  authenticateJWT,
  authorize(ROLES_ADMIN),
  validateParams(idParamSchema),
  auditLog('CIERRE DEFINITIVO OT'),
  cerrarOrden
);

router.delete('/:id',
  authenticateJWT,
  authorize(ROLES_ADMIN),
  validateParams(idParamSchema),
  auditLog('ELIMINAR ORDEN'),
  eliminarOrden
);

export default router;
