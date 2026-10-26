<script setup>
import { computed } from 'vue';
import { ChevronLeft, ChevronRight, ListOrdered } from 'lucide-vue-next';

const props = defineProps({
  modelValue: { type: Number, default: 1 },
  itemsPorPagina: { type: Number, default: 10 },
  totalPaginas: { type: Number, default: 1 },
  total: { type: Number, default: null },
  opcionesItems: { type: Array, default: () => [5, 10, 20, 50] },
  labelItems: { type: String, default: 'filas' },
  mostrarLabelVer: { type: Boolean, default: false },
  paginasVisibles: { type: Array, default: null },
  totalSufijo: { type: String, default: '' },
  oscuro: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue', 'update:itemsPorPagina']);

const totalPaginasSeguro = computed(() => Math.max(1, Number(props.totalPaginas) || 1));

const paginas = computed(() =>
  props.paginasVisibles ?? Array.from({ length: totalPaginasSeguro.value }, (_, i) => i + 1)
);

const paginaActual = computed({
  get: () => Number(props.modelValue) || 1,
  set: (v) => emit('update:modelValue', v),
});

const itemsPorPaginaLocal = computed({
  get: () => Number(props.itemsPorPagina) || 10,
  set: (v) => emit('update:itemsPorPagina', Number(v)),
});
</script>

<template>
  <div class="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
    <div :class="['flex items-center', mostrarLabelVer ? 'gap-4' : 'gap-3']">
      <div v-if="mostrarLabelVer" class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-lyer-muted">
        <ListOrdered class="w-4 h-4" /> Mostrar:
        <select v-model="itemsPorPaginaLocal"
          :class="oscuro
            ? 'h-8 rounded-lg border border-lyer-linea/50 bg-lyer-panel px-2 text-xs font-bold text-lyer-fg'
            : 'select select-ghost select-xs font-black text-lyer-green focus:bg-transparent'">
          <option v-for="opt in opcionesItems" :key="opt" :value="opt">{{ opt }} {{ labelItems }}</option>
        </select>
      </div>
      <select v-else v-model="itemsPorPaginaLocal"
        :class="oscuro
          ? 'h-8 rounded-lg border border-lyer-linea/50 bg-lyer-panel px-2 text-xs font-bold text-lyer-fg'
          : 'select select-ghost select-xs font-black text-lyer-green focus:bg-transparent'">
        <option v-for="opt in opcionesItems" :key="opt" :value="opt">{{ opt }} {{ labelItems }}</option>
      </select>
      <span v-if="total !== null" :class="['text-[10px] font-black uppercase tracking-widest', oscuro ? 'text-lyer-muted' : 'text-lyer-muted']">
        Total: <strong :class="oscuro ? 'text-lyer-fg' : ''">{{ total }}</strong><template v-if="totalSufijo"> {{ totalSufijo }}</template>
      </span>
    </div>

    <div :class="['join overflow-hidden rounded-xl border', oscuro ? 'border-lyer-linea/50 bg-lyer-panel' : 'border-slate-200 bg-white shadow-sm']">
      <button @click="paginaActual--" :disabled="paginaActual === 1"
        :class="['join-item btn btn-sm border-none', oscuro ? 'bg-transparent text-lyer-muted disabled:text-slate-600' : 'bg-white disabled:text-lyer-fg']">
        <ChevronLeft class="w-4 h-4" />
      </button>
      <button v-for="p in paginas" :key="p" @click="paginaActual = p"
        :class="[
          'join-item btn btn-sm border-none font-black px-3',
          paginaActual === p
            ? (oscuro ? 'bg-lyer-accent text-[#1a0633]' : 'bg-lyer-green text-lyer-fg')
            : (oscuro ? 'bg-transparent text-lyer-muted' : 'bg-white text-lyer-muted'),
        ]">
        {{ p }}
      </button>
      <button @click="paginaActual++" :disabled="paginaActual === totalPaginasSeguro"
        :class="['join-item btn btn-sm border-none', oscuro ? 'bg-transparent text-lyer-muted disabled:text-slate-600' : 'bg-white disabled:text-lyer-fg']">
        <ChevronRight class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
