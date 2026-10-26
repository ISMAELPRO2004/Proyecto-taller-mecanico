<script setup>
import AccionesRegistro from '../tabla/AccionesRegistro.vue';

defineProps({
  marca: { type: Object, required: true },
});

defineEmits(['editar', 'eliminar']);
</script>

<template>
  <tr class="transition-colors hover:bg-white/5">
    <td class="px-6 py-3.5 font-semibold text-lyer-fg">{{ marca.nombre }}</td>
    <td class="px-4 py-3.5 font-mono text-xs font-bold text-lyer-cyan">{{ marca._count?.vehiculos ?? 0 }}</td>
    <td class="px-6 py-3.5">
      <AccionesRegistro
        :item="marca"
        @editar="$emit('editar', $event)"
        @eliminar="$emit('eliminar', $event)"
      />
    </td>
  </tr>
</template>
