import { Router } from 'express';
import {
  crearUsuario,
  editarUsuario,
  toggleActivarUsuario,
  eliminarUsuario,
  listarUsuarios,
} from '../controllers/userController.js';
import { listarLogs } from '../controllers/auditoriaController.js';
import { authenticateJWT, authorize } from '../middleware/auth.js';
import { auditLog } from '../middleware/audit.js';

const router = Router();
const ROLES_TODOS = ['ADMIN', 'SUPERVISOR', 'TECNICO', 'RECEPCIONISTA'];

router.get('/', authenticateJWT, authorize(ROLES_TODOS), listarUsuarios);

router.post('/', authenticateJWT, authorize(['ADMIN']), auditLog('CREAR USUARIO'), crearUsuario);
router.put('/:id', authenticateJWT, authorize(['ADMIN']), auditLog('EDITAR USUARIO'), editarUsuario);
router.patch('/:id/toggle-activo', authenticateJWT, authorize(['ADMIN']), auditLog('TOGGLE USUARIO'), toggleActivarUsuario);
router.delete('/:id', authenticateJWT, authorize(['ADMIN']), auditLog('ELIMINAR USUARIO'), eliminarUsuario);

// Compat: frontend antiguo
router.get('/logs', authenticateJWT, authorize(['ADMIN']), listarLogs);

export default router;
