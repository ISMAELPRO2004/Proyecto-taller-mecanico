<script setup>
import { computed } from 'vue';
import { PlusCircle, Trash2, RefreshCcw, ArrowRight } from 'lucide-vue-next';
import { MOVIMIENTO, claveMovimiento } from '../../../../../utils/movimientoLog.js';

const props = defineProps({
  modo: String,
  filas: { type: Array, default: () => [] },
});

const clave = computed(() => claveMovimiento('', props.modo));
const marca = computed(() => MOVIMIENTO[clave.value]);
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-2" :class="marca.tono">
      <PlusCircle v-if="clave === 'creado'" class="h-4 w-4" />
      <Trash2 v-else-if="clave === 'eliminado'" class="h-4 w-4" />
      <RefreshCcw v-else class="h-4 w-4" />
      <span class="font-mono text-[11px] font-bold uppercase tracking-widest">{{ marca.label }}</span>
    </div>

    <div v-if="clave === 'modificado'" class="space-y-3">
      <div v-for="fila in filas" :key="fila.etiqueta" class="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
        <p class="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-200">{{ fila.etiqueta }}</p>
        <div class="mt-2 flex flex-wrap items-center gap-2 text-sm font-semibold">
          <span class="text-lyer-muted line-through">{{ fila.de }}</span>
          <ArrowRight class="h-3.5 w-3.5 shrink-0 text-amber-200" />
          <span class="text-lyer-fg">{{ fila.a }}</span>
        </div>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div v-for="fila in filas" :key="fila.etiqueta" :class="['rounded-xl border p-4', marca.tono]">
        <span class="mb-1 block font-mono text-[10px] font-bold uppercase tracking-wider opacity-80">{{ fila.etiqueta }}</span>
        <span class="text-sm font-semibold text-lyer-fg">{{ fila.valor }}</span>
      </div>
    </div>
  </div>
</template>
