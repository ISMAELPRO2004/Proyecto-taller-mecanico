<script setup>
import { Search } from 'lucide-vue-next';

defineProps({
  busqueda: { type: String, default: '' },
  filtroUsuarioId: { type: String, default: '' },
  usuarios: { type: Array, default: () => [] },
});

defineEmits(['update:busqueda', 'update:filtroUsuarioId']);
</script>

<template>
  <div class="p-4 md:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 items-center">
    <div class="relative w-full sm:flex-1">
      <Search class="absolute left-4 top-3 w-4 h-4 text-slate-400" />
      <input
        :value="busqueda"
        @input="$emit('update:busqueda', $event.target.value)"
        type="text"
        placeholder="Buscar por acción..."
        class="input input-bordered w-full pl-12 bg-white border-slate-200 focus:border-lyer-accent rounded-2xl text-sm font-medium shadow-inner"
      />
    </div>
    <div class="w-full sm:w-auto">
      <select
        :value="filtroUsuarioId"
        @change="$emit('update:filtroUsuarioId', $event.target.value)"
        class="select select-bordered w-full bg-white border-slate-200 rounded-2xl text-sm font-bold focus:border-lyer-accent min-w-[160px]"
      >
        <option value="">Todos los usuarios</option>
        <option v-for="u in usuarios" :key="u.id" :value="u.id">{{ u.nombreCompleto }}</option>
      </select>
    </div>
  </div>
</template>
