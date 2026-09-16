import { Router } from 'express';
import {
  listarMarcas,
  crearMarca,
  actualizarMarca,
  eliminarMarca,
  listarVehiculos,
  buscarPorPlaca,
  upsertVehiculo,
  actualizarVehiculo,
  eliminarVehiculo,
} from '../controllers/vehiculoController.js';
import { authenticateJWT, authorize } from '../middleware/auth.js';
import { auditLog } from '../middleware/audit.js';
import { validateBody, validateParams } from '../middleware/validateBody.js';
import { crearMarcaSchema, upsertVehiculoSchema, idParamSchema } from '../schemas/index.js';

const router = Router();
const ROLES = ['ADMIN', 'SUPERVISOR', 'TECNICO', 'RECEPCIONISTA'];
const ROLES_ESCRITURA = ['ADMIN', 'SUPERVISOR', 'TECNICO', 'RECEPCIONISTA'];
const SOLO_ADMIN = ['ADMIN'];

router.get('/marcas', authenticateJWT, authorize(ROLES), listarMarcas);
router.post('/marcas',
  authenticateJWT,
  authorize(ROLES_ESCRITURA),
  validateBody(crearMarcaSchema),
  auditLog('CREAR MARCA'),
  crearMarca
);
router.put('/marcas/:id',
  authenticateJWT,
  authorize(SOLO_ADMIN),
  validateParams(idParamSchema),
  validateBody(crearMarcaSchema),
  auditLog('EDITAR MARCA'),
  actualizarMarca
);
router.delete('/marcas/:id',
  authenticateJWT,
  authorize(SOLO_ADMIN),
  validateParams(idParamSchema),
  auditLog('ELIMINAR MARCA'),
  eliminarMarca
);

router.get('/', authenticateJWT, authorize(SOLO_ADMIN), listarVehiculos);
router.get('/:placa', authenticateJWT, authorize(ROLES), buscarPorPlaca);
router.post('/',
  authenticateJWT,
  authorize(ROLES_ESCRITURA),
  validateBody(upsertVehiculoSchema),
  auditLog('UPSERT VEHICULO'),
  upsertVehiculo
);
router.put('/:placa',
  authenticateJWT,
  authorize(SOLO_ADMIN),
  validateBody(upsertVehiculoSchema.omit({ placa: true })),
  auditLog('EDITAR VEHICULO'),
  actualizarVehiculo
);
router.delete('/:placa',
  authenticateJWT,
  authorize(SOLO_ADMIN),
  auditLog('ELIMINAR VEHICULO'),
  eliminarVehiculo
);

export default router;
