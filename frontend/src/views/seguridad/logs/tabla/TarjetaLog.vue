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
  <article class="flex items-start justify-between gap-3 p-4">
    <div class="min-w-0 flex-1">
      <p class="font-mono text-[11px] text-lyer-muted">{{ fechaHora(log.fecha) }}</p>
      <p class="mt-1 text-sm font-semibold text-lyer-fg">{{ log.usuario?.nombreCompleto || 'Sistema' }}</p>
      <p class="text-xs uppercase tracking-wider text-lyer-muted">{{ log.usuario?.rol || 'Automático' }}</p>
      <div class="mt-2 flex flex-wrap items-center gap-1.5">
        <span
          v-for="marca in marcas(log)"
          :key="marca.clave"
          :class="['rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider', marca.tono]"
        >{{ marca.label }}</span>
        <span class="text-xs font-semibold uppercase text-lyer-fg">{{ log.accion }}</span>
      </div>
      <p v-if="resumenLog(log)" class="mt-1 text-xs text-lyer-muted">{{ resumenLog(log) }}</p>
      <p v-if="log.orden" class="mt-1 font-mono text-xs text-lyer-cyan">{{ log.orden.numeroOrden }}</p>
    </div>
    <button type="button" :class="accionBtn" title="Ver detalle" @click="$emit('verDetalle', log)">
      <Eye class="h-4 w-4" />
    </button>
  </article>
</template>
