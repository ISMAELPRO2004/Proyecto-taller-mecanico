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
  <div class="flex flex-col gap-3 rounded-2xl border border-[#4a2870]/45 bg-[#221433]/90 p-4 sm:flex-row sm:items-center">
    <input
      :value="busqueda"
      type="text"
      placeholder="Buscar placa, cliente o N° orden..."
      class="h-11 w-full rounded-xl border border-[#4a2870]/50 bg-[#140a22] px-4 text-sm text-white placeholder:text-slate-500 focus:border-lyer-cyan focus:outline-none"
      @input="$emit('update:busqueda', $event.target.value)"
    />
    <div class="flex gap-2 sm:w-auto sm:shrink-0">
      <select
        :value="filtroEstado"
        class="h-11 min-w-0 flex-1 rounded-xl border border-[#4a2870]/50 bg-[#140a22] px-3 text-sm text-slate-200 focus:border-lyer-cyan focus:outline-none sm:w-52"
        @change="$emit('update:filtroEstado', $event.target.value)"
      >
        <option value="">Todos los estados</option>
        <option v-for="opt in ESTADO_ORDEN_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
      <button
        type="button"
        title="Actualizar listado"
        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#4a2870]/50 bg-[#2a1840] text-slate-300 hover:text-white"
        @click="$emit('refrescar')"
      >
        <RefreshCcw :class="{ 'animate-spin': cargando }" class="h-5 w-5" />
      </button>
    </div>
  </div>
</template>
