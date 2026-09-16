<script setup>
import { computed } from 'vue';
import { ChevronLeft, ChevronRight, ListOrdered } from 'lucide-vue-next';

const props = defineProps({
  modelValue: { type: Number, required: true },
  itemsPorPagina: { type: Number, required: true },
  totalPaginas: { type: Number, required: true },
  total: { type: Number, default: null },
  opcionesItems: { type: Array, default: () => [5, 10, 20, 50] },
  labelItems: { type: String, default: 'filas' },
  mostrarLabelVer: { type: Boolean, default: false },
  paginasVisibles: { type: Array, default: null },
  totalSufijo: { type: String, default: '' },
});

const emit = defineEmits(['update:modelValue', 'update:itemsPorPagina']);

const paginas = computed(() =>
  props.paginasVisibles ?? Array.from({ length: props.totalPaginas }, (_, i) => i + 1)
);

const paginaActual = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

const itemsPorPaginaLocal = computed({
  get: () => props.itemsPorPagina,
  set: (v) => emit('update:itemsPorPagina', Number(v)),
});
</script>

<template>
  <div class="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
    <div :class="['flex items-center', mostrarLabelVer ? 'gap-4' : 'gap-3']">
      <div v-if="mostrarLabelVer" class="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
        <ListOrdered class="w-4 h-4" /> Mostrar:
        <select v-model="itemsPorPaginaLocal"
          class="select select-ghost select-xs font-black text-lyer-green focus:bg-transparent">
          <option v-for="opt in opcionesItems" :key="opt" :value="opt">{{ opt }} {{ labelItems }}</option>
        </select>
      </div>
      <select v-else v-model="itemsPorPaginaLocal"
        class="select select-ghost select-xs font-black text-lyer-green focus:bg-transparent">
        <option v-for="opt in opcionesItems" :key="opt" :value="opt">{{ opt }} {{ labelItems }}</option>
      </select>
      <span v-if="total !== null" class="text-[10px] font-black text-slate-400 uppercase tracking-widest">
        Total: {{ total }}<template v-if="totalSufijo"> {{ totalSufijo }}</template>
      </span>
    </div>

    <div class="join shadow-sm border border-slate-200 bg-white rounded-xl overflow-hidden">
      <button @click="paginaActual--" :disabled="paginaActual === 1"
        class="join-item btn btn-sm bg-white border-none disabled:text-slate-200">
        <ChevronLeft class="w-4 h-4" />
      </button>
      <button v-for="p in paginas" :key="p" @click="paginaActual = p"
        :class="['join-item btn btn-sm border-none font-black px-3', paginaActual === p ? 'bg-lyer-green text-white' : 'bg-white text-slate-400']">
        {{ p }}
      </button>
      <button @click="paginaActual++" :disabled="paginaActual === totalPaginas"
        class="join-item btn btn-sm bg-white border-none disabled:text-slate-200">
        <ChevronRight class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
