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
      <span class="rounded-md border border-[#4a2870]/60 bg-[#140a22] px-2 py-0.5 font-mono text-xs font-bold uppercase tracking-wider text-lyer-cyan">{{ vehiculo.placa }}</span>
    </td>
    <td class="px-4 py-3.5 font-semibold text-slate-100">{{ vehiculo.marca?.nombre }}</td>
    <td class="px-4 py-3.5 text-slate-300">{{ vehiculo.modelo }}</td>
    <td class="px-4 py-3.5 font-mono text-xs text-slate-300">{{ vehiculo.kilometraje ?? '—' }} km / {{ vehiculo.horometro ?? '—' }} h</td>
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
