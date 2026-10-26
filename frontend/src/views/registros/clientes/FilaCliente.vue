<script setup>
import AccionesRegistro from '../tabla/AccionesRegistro.vue';

defineProps({
  cliente: { type: Object, required: true },
});

defineEmits(['editar', 'eliminar']);
</script>

<template>
  <tr class="transition-colors hover:bg-white/5">
    <td class="px-6 py-3.5 font-semibold uppercase text-lyer-fg">{{ cliente.nombreRazonSocial }}</td>
    <td class="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-lyer-muted">{{ cliente.tipoCliente }}</td>
    <td class="px-4 py-3.5 font-mono text-xs text-lyer-fg">{{ cliente.tipoDocumento }} {{ cliente.numeroDocumento }}</td>
    <td class="px-4 py-3.5 font-mono text-xs text-lyer-muted">{{ cliente.celular || '—' }}</td>
    <td class="px-4 py-3.5 font-mono text-xs font-bold text-lyer-cyan">{{ cliente._count?.ordenes ?? 0 }}</td>
    <td class="px-6 py-3.5">
      <AccionesRegistro
        :item="cliente"
        @editar="$emit('editar', $event)"
        @eliminar="$emit('eliminar', $event)"
      />
    </td>
  </tr>
</template>
