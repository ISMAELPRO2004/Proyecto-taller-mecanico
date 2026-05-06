<script setup>
defineProps({
  estado: { type: String, required: true },
  cerrada: { type: Boolean, default: false },
  size: { type: String, default: 'sm' }, // sm, md
});

const ESTADO_CONFIG = {
  EN_REPARACION: { label: 'En Reparación', badge: 'badge-warning text-warning-content' },
  CAMBIO_ACEITE: { label: 'Cambio de Aceite', badge: 'badge-info text-info-content' },
  ESPERANDO_REPUESTO: { label: 'Esperando Repuesto', badge: 'badge-info text-info-content' },
  TERMINADO: { label: 'Terminado', badge: 'badge-success text-success-content' },
  CANCELADO: { label: 'Cancelado', badge: 'badge-error text-error-content' },
};

const badgeClass = (estado, cerrada) => {
  if (cerrada) return 'badge-neutral text-neutral-content';
  return ESTADO_CONFIG[estado]?.badge || 'badge-ghost';
};
const label = (estado, cerrada) => {
  if (cerrada) return 'CERRADA';
  return ESTADO_CONFIG[estado]?.label || estado;
};
</script>

<template>
  <span
    :class="[
      'badge badge-sm font-black p-2 border-none text-[9px] uppercase',
      size === 'md' ? 'p-3' : '',
      badgeClass(estado, cerrada),
    ]"
  >
    {{ label(estado, cerrada) }}
  </span>
</template>
