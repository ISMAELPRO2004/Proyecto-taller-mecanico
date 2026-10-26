import { Router } from 'express';
import { listarServicios, crearServicio, actualizarServicio, eliminarServicio } from '../controllers/serviciosController.js';
import { authenticateJWT, authorize } from '../middleware/auth.js';
import { auditLog } from '../middleware/audit.js';
import { validateBody, validateParams } from '../middleware/validateBody.js';
import { crearItemCatalogoSchema, actualizarItemCatalogoSchema, idParamSchema } from '../schemas/index.js';

const router = Router();
const ROLES_VER = ['ADMIN', 'SUPERVISOR', 'TECNICO', 'RECEPCIONISTA'];
const ROLES_EDITAR = ['ADMIN', 'SUPERVISOR'];
const ROLES_CREAR = ['ADMIN', 'SUPERVISOR', 'TECNICO'];

router.get('/', authenticateJWT, authorize(ROLES_VER), listarServicios);
router.post('/',
  authenticateJWT,
  authorize(ROLES_CREAR),
  validateBody(crearItemCatalogoSchema),
  auditLog('NUEVO SERVICIO'),
  crearServicio
);
router.put('/:id',
  authenticateJWT,
  authorize(ROLES_EDITAR),
  validateParams(idParamSchema),
  validateBody(actualizarItemCatalogoSchema),
  auditLog('ACTUALIZAR SERVICIO'),
  actualizarServicio
);
router.delete('/:id',
  authenticateJWT,
  authorize(['ADMIN']),
  validateParams(idParamSchema),
  auditLog('ELIMINAR SERVICIO'),
  eliminarServicio
);

export default router;
