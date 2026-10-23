<script setup>
import { Edit3, Trash2 } from 'lucide-vue-next';
import { accionBtn } from './catalogoTabla.js';

defineProps({
  item: { type: Object, required: true },
  compacta: { type: Boolean, default: false },
});

defineEmits(['editar', 'eliminar']);
</script>

<template>
  <div v-if="compacta" class="flex items-center justify-center gap-1.5">
    <button
      type="button"
      :class="[accionBtn, 'h-8 w-8 text-lyer-cyan hover:border-lyer-cyan/50 hover:bg-lyer-cyan/10']"
      title="Editar"
      @click="$emit('editar', item)"
    >
      <Edit3 class="h-4 w-4" />
    </button>
    <button
      type="button"
      :class="[accionBtn, 'h-8 w-8 text-rose-300 hover:border-rose-400/50 hover:bg-rose-500/10']"
      title="Eliminar"
      @click="$emit('eliminar', item.id)"
    >
      <Trash2 class="h-4 w-4" />
    </button>
  </div>
  <div v-else class="flex gap-2">
    <button
      type="button"
      :class="[accionBtn, 'h-10 flex-1 gap-2 text-sm font-semibold text-lyer-cyan hover:border-lyer-cyan/50 hover:bg-lyer-cyan/10']"
      @click="$emit('editar', item)"
    >
      <Edit3 class="h-4 w-4" /> Editar
    </button>
    <button
      type="button"
      :class="[accionBtn, 'h-10 flex-1 gap-2 text-sm font-semibold text-rose-300 hover:border-rose-400/50 hover:bg-rose-500/10']"
      @click="$emit('eliminar', item.id)"
    >
      <Trash2 class="h-4 w-4" /> Eliminar
    </button>
  </div>
</template>
