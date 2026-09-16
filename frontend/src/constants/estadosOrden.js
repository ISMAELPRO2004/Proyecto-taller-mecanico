export const ESTADOS_ORDEN = {
  EN_ESPERA: 'En Espera',
  ACEPTADO: 'Aceptado',
  EN_REPARACION: 'En Reparación',
  CAMBIO_ACEITE: 'Cambio de Aceite',
  ESPERANDO_REPUESTO: 'Esperando Repuesto',
  TERMINADO: 'Terminado',
  CANCELADO: 'Cancelado',
};

export const ESTADO_ORDEN_OPTIONS = Object.entries(ESTADOS_ORDEN).map(([value, label]) => ({
  value,
  label,
}));

export const ESTADOS_OPERATIVOS = [
  'EN_REPARACION',
  'CAMBIO_ACEITE',
  'ESPERANDO_REPUESTO',
  'TERMINADO',
  'CANCELADO',
];

export const labelEstadoOrden = (estado) => ESTADOS_ORDEN[estado] || estado || '—';

export const ROLES = {
  ADMIN: 'Administrador',
  SUPERVISOR: 'Supervisor',
  TECNICO: 'Técnico',
  RECEPCIONISTA: 'Recepcionista',
};

export const ROL_OPTIONS = Object.entries(ROLES).map(([value, label]) => ({ value, label }));
