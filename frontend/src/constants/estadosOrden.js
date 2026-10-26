export const ESTADO = Object.freeze({
  EN_ESPERA: 'EN_ESPERA',
  ACEPTADO: 'ACEPTADO',
  EN_REPARACION: 'EN_REPARACION',
  CAMBIO_ACEITE: 'CAMBIO_ACEITE',
  ESPERANDO_REPUESTO: 'ESPERANDO_REPUESTO',
  TERMINADO: 'TERMINADO',
  CANCELADO: 'CANCELADO',
});

export const ESTADOS_ORDEN = {
  [ESTADO.EN_ESPERA]: 'En Espera',
  [ESTADO.ACEPTADO]: 'Aceptado',
  [ESTADO.EN_REPARACION]: 'En Reparación',
  [ESTADO.CAMBIO_ACEITE]: 'Cambio de Aceite',
  [ESTADO.ESPERANDO_REPUESTO]: 'Esperando Repuesto',
  [ESTADO.TERMINADO]: 'Terminado',
  [ESTADO.CANCELADO]: 'Cancelado',
};

export const ESTADO_ORDEN_OPTIONS = Object.entries(ESTADOS_ORDEN).map(([value, label]) => ({
  value,
  label,
}));

/** Estados que se eligen en taller. Cancelado no va aquí: solo el admin, con la orden ya terminada. */
export const ESTADOS_OPERATIVOS = [
  ESTADO.EN_REPARACION,
  ESTADO.CAMBIO_ACEITE,
  ESTADO.ESPERANDO_REPUESTO,
  ESTADO.TERMINADO,
];

export const ESTADOS_CERRADOS = [ESTADO.TERMINADO, ESTADO.CANCELADO];

export const labelEstadoOrden = (estado) => ESTADOS_ORDEN[estado] || estado || '—';

export const estaCerrada = (estado) => ESTADOS_CERRADOS.includes(estado);

export const ROLES = {
  ADMIN: 'Administrador',
  SUPERVISOR: 'Supervisor',
  TECNICO: 'Técnico',
  RECEPCIONISTA: 'Recepcionista',
};

export const ROL_OPTIONS = Object.entries(ROLES).map(([value, label]) => ({ value, label }));
