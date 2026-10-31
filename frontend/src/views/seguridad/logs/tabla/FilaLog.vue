<script setup>
import { Eye } from 'lucide-vue-next';
import { fechaHora } from '../../../../utils/fecha.js';
import { accionBtn, marcas, resumenLog } from './logTabla.js';

defineProps({
  log: { type: Object, required: true },
});

defineEmits(['verDetalle']);
</script>

<template>
  <tr class="transition-colors hover:bg-white/5">
    <td class="whitespace-nowrap px-6 py-3.5 font-mono text-xs text-lyer-muted">{{ fechaHora(log.fecha) }}</td>
    <td class="px-4 py-3.5">
      <p class="font-semibold text-lyer-fg">{{ log.usuario?.nombreCompleto || 'Sistema' }}</p>
      <p class="text-[11px] uppercase tracking-wider text-lyer-muted">{{ log.usuario?.rol }}</p>
    </td>
    <td class="px-4 py-3.5">
      <div class="flex flex-wrap items-center gap-1.5">
        <span
          v-for="marca in marcas(log)"
          :key="marca.clave"
          :class="['rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider', marca.tono]"
        >{{ marca.label }}</span>
        <span class="text-xs font-semibold uppercase text-lyer-fg">{{ log.accion }}</span>
      </div>
      <p v-if="resumenLog(log)" class="mt-1 text-xs text-lyer-muted">{{ resumenLog(log) }}</p>
    </td>
    <td class="px-4 py-3.5 font-mono text-xs">
      <span v-if="log.orden" class="rounded-md border border-lyer-linea/60 bg-lyer-fondo px-2 py-0.5 text-lyer-cyan">{{ log.orden.numeroOrden }}</span>
      <span v-else class="text-slate-500">—</span>
    </td>
    <td class="px-6 py-3.5">
      <div class="flex justify-center">
        <button type="button" :class="accionBtn" title="Ver detalle" @click="$emit('verDetalle', log)">
          <Eye class="h-4 w-4" />
        </button>
      </div>
    </td>
  </tr>
</template>
