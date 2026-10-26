<script setup>
import { computed } from 'vue';
import { ChevronLeft, ChevronRight, ListOrdered } from 'lucide-vue-next';

const esEntero = (v) => v == null || (typeof v === 'number' && Number.isFinite(v));

const props = defineProps({
  modelValue: { type: Number, default: 1, validator: esEntero },
  itemsPorPagina: { type: Number, default: 10, validator: esEntero },
  totalPaginas: { type: Number, default: 1, validator: esEntero },
  total: { type: Number, default: null, validator: esEntero },
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
      <div v-if="mostrarLabelVer" class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
        <ListOrdered class="w-4 h-4" /> Mostrar:
        <select v-model="itemsPorPaginaLocal"
          :class="oscuro
            ? 'h-8 rounded-lg border border-[#4a2870]/50 bg-[#160a24] px-2 text-xs font-bold text-slate-200'
            : 'select select-ghost select-xs font-black text-lyer-green focus:bg-transparent'">
          <option v-for="opt in opcionesItems" :key="opt" :value="opt">{{ opt }} {{ labelItems }}</option>
        </select>
      </div>
      <select v-else v-model="itemsPorPaginaLocal"
        :class="oscuro
          ? 'h-8 rounded-lg border border-[#4a2870]/50 bg-[#160a24] px-2 text-xs font-bold text-slate-200'
          : 'select select-ghost select-xs font-black text-lyer-green focus:bg-transparent'">
        <option v-for="opt in opcionesItems" :key="opt" :value="opt">{{ opt }} {{ labelItems }}</option>
      </select>
      <span v-if="total !== null" :class="['text-[10px] font-black uppercase tracking-widest', oscuro ? 'text-slate-400' : 'text-slate-400']">
        Total: <strong :class="oscuro ? 'text-white' : ''">{{ total }}</strong><template v-if="totalSufijo"> {{ totalSufijo }}</template>
      </span>
    </div>

    <div :class="['join overflow-hidden rounded-xl border', oscuro ? 'border-[#4a2870]/50 bg-[#160a24]' : 'border-slate-200 bg-white shadow-sm']">
      <button @click="paginaActual--" :disabled="paginaActual === 1"
        :class="['join-item btn btn-sm border-none', oscuro ? 'bg-transparent text-slate-300 disabled:text-slate-600' : 'bg-white disabled:text-slate-200']">
        <ChevronLeft class="w-4 h-4" />
      </button>
      <button v-for="p in paginas" :key="p" @click="paginaActual = p"
        :class="[
          'join-item btn btn-sm border-none font-black px-3',
          paginaActual === p
            ? (oscuro ? 'bg-lyer-accent text-[#1a0633]' : 'bg-lyer-green text-white')
            : (oscuro ? 'bg-transparent text-slate-400' : 'bg-white text-slate-400'),
        ]">
        {{ p }}
      </button>
      <button @click="paginaActual++" :disabled="paginaActual === totalPaginasSeguro"
        :class="['join-item btn btn-sm border-none', oscuro ? 'bg-transparent text-slate-300 disabled:text-slate-600' : 'bg-white disabled:text-slate-200']">
        <ChevronRight class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
