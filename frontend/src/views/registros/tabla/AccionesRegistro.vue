<script setup>
import { Edit3, Trash2 } from 'lucide-vue-next';
import { accionBtn } from './registroTabla.js';

defineProps({
  item: { type: Object, required: true },
});

defineEmits(['editar', 'eliminar']);
</script>

<template>
  <div class="flex items-center justify-center gap-1.5">
    <button
      type="button"
      :class="[accionBtn, 'text-lyer-cyan hover:border-lyer-cyan/50 hover:bg-lyer-cyan/10']"
      title="Editar"
      @click="$emit('editar', item)"
    >
      <Edit3 class="h-4 w-4" />
    </button>
    <button
      type="button"
      :class="[accionBtn, 'text-rose-300 hover:border-rose-400/50 hover:bg-rose-500/10']"
      title="Eliminar"
      @click="$emit('eliminar', item)"
    >
      <Trash2 class="h-4 w-4" />
    </button>
  </div>
</template>
