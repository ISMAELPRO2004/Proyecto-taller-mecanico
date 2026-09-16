<script setup>
import { RefreshCcw } from 'lucide-vue-next';
import { ESTADO_ORDEN_OPTIONS } from '../../../constants/estadosOrden.js';

defineProps({
  busqueda: { type: String, default: '' },
  filtroEstado: { type: String, default: '' },
  cargando: { type: Boolean, default: false },
});

defineEmits(['update:busqueda', 'update:filtroEstado', 'refrescar']);
</script>

<template>
  <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-3">
    <input :value="busqueda" @input="$emit('update:busqueda', $event.target.value)" type="text"
      placeholder="Buscar placa, cliente o N° orden..."
      class="input input-bordered w-full bg-slate-50 border-slate-100 focus:border-lyer-accent rounded-xl text-sm" />
    <div class="flex gap-2">
      <select :value="filtroEstado" @change="$emit('update:filtroEstado', $event.target.value)"
        class="select select-bordered flex-1 bg-slate-50 border-slate-100 rounded-xl text-sm">
        <option value="">Todos los estados</option>
        <option v-for="opt in ESTADO_ORDEN_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
      <button @click="$emit('refrescar')"
        class="btn btn-square bg-white border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl shrink-0">
        <RefreshCcw :class="{ 'animate-spin': cargando }" class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>
