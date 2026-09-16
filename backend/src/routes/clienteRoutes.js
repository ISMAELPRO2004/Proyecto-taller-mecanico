import { Router } from 'express';
import {
  listarClientes,
  buscarPorDocumento,
  upsertCliente,
  actualizarCliente,
  eliminarCliente,
} from '../controllers/clienteController.js';
import { authenticateJWT, authorize } from '../middleware/auth.js';
import { auditLog } from '../middleware/audit.js';
import { validateBody, validateParams } from '../middleware/validateBody.js';
import { crearClienteSchema, idParamSchema } from '../schemas/index.js';

const router = Router();
const ROLES = ['ADMIN', 'SUPERVISOR', 'TECNICO', 'RECEPCIONISTA'];
const SOLO_ADMIN = ['ADMIN'];

router.get('/', authenticateJWT, authorize(ROLES), listarClientes);
router.get('/documento/:documento', authenticateJWT, authorize(ROLES), buscarPorDocumento);
router.post('/',
  authenticateJWT,
  authorize(ROLES),
  validateBody(crearClienteSchema),
  auditLog('UPSERT CLIENTE'),
  upsertCliente
);
router.put('/:id',
  authenticateJWT,
  authorize(SOLO_ADMIN),
  validateParams(idParamSchema),
  validateBody(crearClienteSchema),
  auditLog('EDITAR CLIENTE'),
  actualizarCliente
);
router.delete('/:id',
  authenticateJWT,
  authorize(SOLO_ADMIN),
  validateParams(idParamSchema),
  auditLog('ELIMINAR CLIENTE'),
  eliminarCliente
);

export default router;
