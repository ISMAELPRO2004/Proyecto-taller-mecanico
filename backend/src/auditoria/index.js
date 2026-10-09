/**
 * Punto de entrada de la auditoría.
 *
 * Borrador y orden en trabajo: un log con secciones.
 * Marca, cliente y vehículo: un log por ficha.
 * Catálogo, usuarios, fotos y factura: registrarLog compara antes y después.
 */
import { registrarGrupo } from './guardar.js';
import { grupoDeEventos } from './eventos.js';

export { registrarLog, registrarEventos, registrarGrupo } from './guardar.js';
export {
  eventosPasoVehiculo,
  eventosPasoCliente,
  eventosTrabajoBorrador,
  eventosEliminarBorrador,
  eventosActualizarTaller,
  eventoEstado,
} from './eventos.js';
export { auditarMarca, auditarCliente, auditarVehiculo } from './registros.js';

const guardarGrupo = (req, eventos, { contexto, resumen, ordenId }) => registrarGrupo(
  req,
  grupoDeEventos(eventos, { contexto, resumen }),
  ordenId
);

export const auditarBorrador = (req, { orden, eventos, ordenId = orden?.id ?? null }) => guardarGrupo(
  req,
  eventos,
  { contexto: 'BORRADOR', resumen: orden?.numeroOrden, ordenId }
);

export const auditarOrden = (req, { orden, eventos }) => guardarGrupo(
  req,
  eventos,
  { contexto: 'ORDEN', resumen: orden?.numeroOrden, ordenId: orden?.id ?? null }
);
