import { Router } from 'express';
import { listarServiciosTerceros, crearServicioTercero, actualizarServicioTercero, eliminarServicioTercero } from '../controllers/serviciosTercerosController.js';
import { authenticateJWT, authorize } from '../middleware/auth.js';
import { auditLog } from '../middleware/audit.js';

const router = Router();
const ROLES_VER = ['ADMIN', 'SUPERVISOR', 'TECNICO', 'RECEPCIONISTA'];
const ROLES_EDITAR = ['ADMIN', 'SUPERVISOR'];
const ROLES_CREAR = ['ADMIN', 'SUPERVISOR', 'TECNICO'];

router.get('/', authenticateJWT, authorize(ROLES_VER), listarServiciosTerceros);
router.post('/', authenticateJWT, authorize(ROLES_CREAR), auditLog('NUEVO TERCERO'), crearServicioTercero);
router.put('/:id', authenticateJWT, authorize(ROLES_EDITAR), auditLog('ACTUALIZAR TERCERO'), actualizarServicioTercero);
router.delete('/:id', authenticateJWT, authorize(['ADMIN']), auditLog('ELIMINAR TERCERO'), eliminarServicioTercero);

export default router;
