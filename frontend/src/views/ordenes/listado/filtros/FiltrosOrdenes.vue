<script setup>
import { RefreshCcw } from 'lucide-vue-next';
import { ESTADO_ORDEN_OPTIONS } from '../../../../constants/estadosOrden.js';

defineProps({
  busqueda: { type: String, default: '' },
  filtroEstado: { type: String, default: '' },
  cargando: { type: Boolean, default: false },
});

defineEmits(['update:busqueda', 'update:filtroEstado', 'refrescar']);
</script>

<template>
  <div class="flex flex-col gap-3 rounded-2xl border border-lyer-linea/45 bg-lyer-card/90 p-4 sm:flex-row sm:items-center">
    <input
      :value="busqueda"
      type="text"
      placeholder="Buscar placa, cliente o N° orden..."
      class="h-11 w-full rounded-xl border border-lyer-linea/50 bg-lyer-fondo px-4 text-sm text-lyer-fg placeholder:text-lyer-muted focus:border-lyer-cyan focus:outline-none"
      @input="$emit('update:busqueda', $event.target.value)"
    />
    <div class="flex gap-2 sm:w-auto sm:shrink-0">
      <select
        :value="filtroEstado"
        class="h-11 min-w-0 flex-1 rounded-xl border border-lyer-linea/50 bg-lyer-fondo px-3 text-sm text-lyer-fg focus:border-lyer-cyan focus:outline-none sm:w-52"
        @change="$emit('update:filtroEstado', $event.target.value)"
      >
        <option value="">Todos los estados</option>
        <option v-for="opt in ESTADO_ORDEN_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
      <button
        type="button"
        title="Actualizar listado"
        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-lyer-linea/50 bg-lyer-hover text-lyer-muted hover:text-lyer-fg"
        @click="$emit('refrescar')"
      >
        <RefreshCcw :class="{ 'animate-spin': cargando }" class="h-5 w-5" />
      </button>
    </div>
  </div>
</template>
