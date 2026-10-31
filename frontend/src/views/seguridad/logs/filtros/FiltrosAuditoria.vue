<script setup>
import { ChevronDown, Search } from 'lucide-vue-next';

defineProps({
  busqueda: { type: String, default: '' },
  filtroUsuarioId: { type: String, default: '' },
  usuarios: { type: Array, default: () => [] },
});

defineEmits(['update:busqueda', 'update:filtroUsuarioId']);

const campo = 'h-11 w-full rounded-xl border border-lyer-linea/60 bg-lyer-fondo text-sm text-lyer-fg placeholder:text-lyer-muted focus:border-lyer-cyan/70 focus:outline-none';
</script>

<template>
  <div class="flex flex-col gap-3 border-b border-lyer-linea/40 px-4 py-4 sm:flex-row sm:items-end md:px-6">
    <label class="block min-w-0 flex-1 space-y-1.5">
      <span class="font-mono text-[10px] font-bold uppercase tracking-wider text-lyer-muted">Acción</span>
      <span class="relative block">
        <Search class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          :value="busqueda"
          type="text"
          placeholder="Buscar por acción..."
          :class="[campo, 'pl-10 pr-4']"
          @input="$emit('update:busqueda', $event.target.value)"
        />
      </span>
    </label>
    <label class="block w-full space-y-1.5 sm:w-64">
      <span class="font-mono text-[10px] font-bold uppercase tracking-wider text-lyer-muted">Usuario</span>
      <span class="relative block">
        <select
          :value="filtroUsuarioId"
          :class="[campo, 'appearance-none px-4 pr-10']"
          @change="$emit('update:filtroUsuarioId', $event.target.value)"
        >
          <option value="">Todos los usuarios</option>
          <option v-for="u in usuarios" :key="u.id" :value="u.id">{{ u.nombreCompleto }}</option>
        </select>
        <ChevronDown class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lyer-muted" />
      </span>
    </label>
  </div>
</template>
