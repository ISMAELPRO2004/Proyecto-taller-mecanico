import { Router } from 'express';
import {
  listarMarcas,
  crearMarca,
  actualizarMarca,
  eliminarMarca,
  listarVehiculos,
  sugerirVehiculos,
  buscarPorPlaca,
  upsertVehiculo,
  actualizarVehiculo,
  eliminarVehiculo,
} from '../controllers/vehiculoController.js';
import { authenticateJWT, authorize } from '../middleware/auth.js';
import { auditLog } from '../middleware/audit.js';
import { validateBody, validateParams } from '../middleware/validateBody.js';
import { crearMarcaSchema, upsertVehiculoSchema, placaParamSchema, idParamSchema } from '../schemas/index.js';

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
router.get('/sugerencias', authenticateJWT, authorize(ROLES), sugerirVehiculos);
router.get('/:placa',
  authenticateJWT,
  authorize(ROLES),
  validateParams(placaParamSchema),
  buscarPorPlaca
);
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
  validateParams(placaParamSchema),
  validateBody(upsertVehiculoSchema.omit({ placa: true })),
  auditLog('EDITAR VEHICULO'),
  actualizarVehiculo
);
router.delete('/:placa',
  authenticateJWT,
  authorize(SOLO_ADMIN),
  validateParams(placaParamSchema),
  auditLog('ELIMINAR VEHICULO'),
  eliminarVehiculo
);

export default router;
