import { Router } from 'express';
import {
  listarMarcas,
  crearMarca,
  buscarPorPlaca,
  upsertVehiculo,
} from '../controllers/vehiculoController.js';
import { authenticateJWT, authorize } from '../middleware/auth.js';
import { auditLog } from '../middleware/audit.js';
import { validateBody } from '../middleware/validateBody.js';
import { crearMarcaSchema, upsertVehiculoSchema } from '../schemas/index.js';

const router = Router();
const ROLES = ['ADMIN', 'SUPERVISOR', 'TECNICO', 'RECEPCIONISTA'];
const ROLES_ESCRITURA = ['ADMIN', 'SUPERVISOR', 'TECNICO', 'RECEPCIONISTA'];

router.get('/marcas', authenticateJWT, authorize(ROLES), listarMarcas);
router.post('/marcas',
  authenticateJWT,
  authorize(ROLES_ESCRITURA),
  validateBody(crearMarcaSchema),
  auditLog('CREAR MARCA'),
  crearMarca
);

router.get('/:placa', authenticateJWT, authorize(ROLES), buscarPorPlaca);
router.post('/',
  authenticateJWT,
  authorize(ROLES_ESCRITURA),
  validateBody(upsertVehiculoSchema),
  auditLog('UPSERT VEHICULO'),
  upsertVehiculo
);

export default router;
