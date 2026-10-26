<script setup>
import { ESTADO, ESTADOS_ORDEN } from '../../constants/estadosOrden.js';

const props = defineProps({
  estado: { type: String, default: '' },
  cerrada: { type: Boolean, default: false },
  size: {
    type: String,
    default: 'sm',
    validator: (v) => ['sm', 'md'].includes(v),
  },
  oscuro: { type: Boolean, default: false },
});

const BADGE = {
  [ESTADO.EN_ESPERA]: 'badge-ghost text-slate-600',
  [ESTADO.ACEPTADO]: 'badge-primary text-primary-content',
  [ESTADO.EN_REPARACION]: 'badge-warning text-warning-content',
  [ESTADO.CAMBIO_ACEITE]: 'badge-info text-info-content',
  [ESTADO.ESPERANDO_REPUESTO]: 'badge-info text-info-content',
  [ESTADO.TERMINADO]: 'badge-success text-success-content',
  [ESTADO.CANCELADO]: 'badge-error text-error-content',
};

const badgeClass = (estado) => {
  if (props.oscuro && estado === ESTADO.EN_ESPERA) {
    return 'bg-slate-700 text-lyer-fg border border-slate-500';
  }
  return BADGE[estado] || 'badge-ghost';
};

const label = (estado) => ESTADOS_ORDEN[estado] || estado || '—';
</script>

<template>
  <span
    :class="[
      'badge badge-sm font-black p-2 border-none text-[9px] uppercase',
      size === 'md' ? 'p-3' : '',
      badgeClass(estado),
    ]"
  >
    {{ label(estado) }}
  </span>
</template>
