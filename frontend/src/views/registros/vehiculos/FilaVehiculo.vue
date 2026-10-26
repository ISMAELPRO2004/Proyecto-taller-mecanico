<script setup>
import AccionesRegistro from '../tabla/AccionesRegistro.vue';

defineProps({
  vehiculo: { type: Object, required: true },
});

defineEmits(['editar', 'eliminar']);
</script>

<template>
  <tr class="transition-colors hover:bg-white/5">
    <td class="px-6 py-3.5">
      <span class="rounded-md border border-lyer-linea/60 bg-lyer-fondo px-2 py-0.5 font-mono text-xs font-bold uppercase tracking-wider text-lyer-cyan">{{ vehiculo.placa }}</span>
    </td>
    <td class="px-4 py-3.5 font-semibold text-lyer-fg">{{ vehiculo.marca?.nombre }}</td>
    <td class="px-4 py-3.5 text-lyer-muted">{{ vehiculo.modelo }}</td>
    <td class="px-4 py-3.5 font-mono text-xs text-lyer-muted">{{ vehiculo.kilometraje ?? '—' }} km / {{ vehiculo.horometro ?? '—' }} h</td>
    <td class="px-4 py-3.5 font-mono text-xs font-bold text-lyer-cyan">{{ vehiculo._count?.ordenes ?? 0 }}</td>
    <td class="px-6 py-3.5">
      <AccionesRegistro
        :item="vehiculo"
        @editar="$emit('editar', $event)"
        @eliminar="$emit('eliminar', $event)"
      />
    </td>
  </tr>
</template>
