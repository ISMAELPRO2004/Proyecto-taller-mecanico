<script setup>
import { Edit3, ToggleLeft, ToggleRight, Trash2 } from 'lucide-vue-next';

defineProps({
  usuario: { type: Object, required: true },
});

defineEmits(['editar', 'toggle', 'eliminar']);

const accionBtn = 'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-lyer-linea/50 bg-lyer-hover transition-colors';
</script>

<template>
  <div class="flex shrink-0 gap-1.5">
    <button type="button" :class="[accionBtn, 'text-lyer-cyan hover:border-lyer-cyan/50 hover:bg-lyer-cyan/10']" title="Editar" @click="$emit('editar', usuario)">
      <Edit3 class="h-4 w-4" />
    </button>
    <button
      type="button"
      :class="[accionBtn, usuario.activo ? 'text-amber-200 hover:border-amber-400/50 hover:bg-amber-500/10' : 'text-green-300 hover:border-green-400/50 hover:bg-green-500/10']"
      :title="usuario.activo ? 'Desactivar' : 'Activar'"
      @click="$emit('toggle', usuario)"
    >
      <ToggleLeft v-if="usuario.activo" class="h-4 w-4" />
      <ToggleRight v-else class="h-4 w-4" />
    </button>
    <button type="button" :class="[accionBtn, 'text-rose-300 hover:border-rose-400/50 hover:bg-rose-500/10']" title="Eliminar" @click="$emit('eliminar', usuario)">
      <Trash2 class="h-4 w-4" />
    </button>
  </div>
</template>
