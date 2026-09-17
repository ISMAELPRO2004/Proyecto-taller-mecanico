import { Router } from 'express';
import { listarMateriales, crearMaterial, actualizarMaterial, eliminarMaterial } from '../controllers/inventarioController.js';
import { authenticateJWT, authorize } from '../middleware/auth.js';
import { auditLog } from '../middleware/audit.js';

const router = Router();
const ROLES_VER = ['ADMIN', 'SUPERVISOR', 'TECNICO', 'RECEPCIONISTA'];
const ROLES_EDITAR = ['ADMIN', 'SUPERVISOR'];
const ROLES_CREAR = ['ADMIN', 'SUPERVISOR', 'TECNICO'];

router.get('/', authenticateJWT, authorize(ROLES_VER), listarMateriales);
router.post('/', authenticateJWT, authorize(ROLES_CREAR), auditLog('NUEVO MATERIAL'), crearMaterial);
router.put('/:id', authenticateJWT, authorize(ROLES_EDITAR), auditLog('ACTUALIZAR MATERIAL'), actualizarMaterial);
router.delete('/:id', authenticateJWT, authorize(['ADMIN']), auditLog('ELIMINAR MATERIAL'), eliminarMaterial);

export default router;
