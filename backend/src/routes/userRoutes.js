import { Router } from 'express';
import {
  crearUsuario,
  editarUsuario,
  toggleActivarUsuario,
  listarUsuarios,
  listarLogs,
} from '../controllers/userController.js';
import { authenticateJWT, authorize } from '../middleware/auth.js';
import { auditLog } from '../middleware/audit.js';

const router = Router();

// ─── USUARIOS ─────────────────────────────────────────────────────────────────

// Listar usuarios — todos los roles autenticados
router.get(
  '/',
  authenticateJWT,
  authorize(['ADMIN', 'RESPONSABLE', 'USUARIO_GENERAL']),
  listarUsuarios
);

// Crear usuario — solo Admin
router.post(
  '/',
  authenticateJWT,
  authorize(['ADMIN']),
  auditLog('CREAR USUARIO'),
  crearUsuario
);

// Editar usuario — solo Admin
router.put(
  '/:id',
  authenticateJWT,
  authorize(['ADMIN']),
  auditLog('EDITAR USUARIO'),
  editarUsuario
);

// Activar / Desactivar usuario — solo Admin
router.patch(
  '/:id/toggle-activo',
  authenticateJWT,
  authorize(['ADMIN']),
  auditLog('TOGGLE USUARIO'),
  toggleActivarUsuario
);

// ─── LOGS ─────────────────────────────────────────────────────────────────────

// Listar logs con filtros — solo Admin
router.get(
  '/logs',
  authenticateJWT,
  authorize(['ADMIN']),
  listarLogs
);

export default router;