import { Router } from 'express';
import { crearOrden, listarOrdenes, obtenerOrdenPorId, actualizarEstadoOrden, eliminarOrden } from '../controllers/ordenController.js';
import { authenticateJWT, authorize } from '../middleware/auth.js';
import { auditLog } from '../middleware/audit.js';

const router = Router();

// 1. Listar todas las órdenes (Accesible para ADMIN y RESPONSABLE)
router.get('/', authenticateJWT, listarOrdenes);

// 2. Obtener el detalle profundo de una orden (Para el Modal de detalles)
router.get('/:id', authenticateJWT, obtenerOrdenPorId);

// 3. Crear nueva orden (Lógica transaccional con Vehículo y Catálogos)
router.post('/', 
  authenticateJWT, 
  authorize(['ADMIN', 'RESPONSABLE']), 
  auditLog('REGISTRO DE NUEVA ORDEN DE TRABAJO'), 
  crearOrden
);

// 4. Actualizar el estado de la orden (EN_REPARACION -> TERMINADO, etc.)
router.put('/:id/estado', 
  authenticateJWT, 
  authorize(['ADMIN', 'RESPONSABLE']), 
  auditLog('CAMBIO DE ESTADO EN OT'), 
  actualizarEstadoOrden
);

// 5. Eliminar orden (Acción restringida solo para el ADMIN)
router.delete('/:id', 
  authenticateJWT, 
  authorize(['ADMIN']), 
  auditLog('ELIMINAR ORDEN DE TRABAJO'), 
  eliminarOrden
);

export default router;