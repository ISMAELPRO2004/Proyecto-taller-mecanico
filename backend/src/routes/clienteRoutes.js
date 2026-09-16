import { Router } from 'express';
import {
  listarClientes,
  buscarPorDocumento,
  upsertCliente,
} from '../controllers/clienteController.js';
import { authenticateJWT, authorize } from '../middleware/auth.js';
import { auditLog } from '../middleware/audit.js';
import { validateBody } from '../middleware/validateBody.js';
import { crearClienteSchema } from '../schemas/index.js';

const router = Router();
const ROLES = ['ADMIN', 'SUPERVISOR', 'TECNICO', 'RECEPCIONISTA'];

router.get('/', authenticateJWT, authorize(ROLES), listarClientes);
router.get('/documento/:documento', authenticateJWT, authorize(ROLES), buscarPorDocumento);
router.post('/',
  authenticateJWT,
  authorize(ROLES),
  validateBody(crearClienteSchema),
  auditLog('UPSERT CLIENTE'),
  upsertCliente
);

export default router;
