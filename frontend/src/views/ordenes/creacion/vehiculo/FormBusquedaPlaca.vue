<script setup>
import { ref, onBeforeUnmount } from 'vue';
import { Search, History, Info, Loader2, Camera } from 'lucide-vue-next';
import { nombreClienteOrden } from '../../../../utils/ordenDisplay.js';
import { labelEstadoOrden } from '../../../../constants/estadosOrden.js';
import { formatearPlacaEscrita } from '../../../../utils/placa.js';
import { vehiculoService } from '../../../../services/vehiculoService.js';

const props = defineProps({
  placa: { type: String, default: '' },
  historial: { type: Array, default: () => [] },
  error: { type: String, default: '' },
  puedeEscanear: { type: Boolean, default: false },
});

const emit = defineEmits(['update:placa', 'buscar', 'escanear']);

const sugerencias = ref([]);
const buscando = ref(false);
const mostrarSugerencias = ref(false);
let debounceTimer = null;
let busquedaSeq = 0;

const buscarSugerencias = async (texto) => {
  const q = String(texto || '').trim();
  const seq = ++busquedaSeq;
  if (q.replace(/[^A-Z0-9]/gi, '').length < 2) {
    sugerencias.value = [];
    mostrarSugerencias.value = false;
    return;
  }
  buscando.value = true;
  try {
    const data = await vehiculoService.sugerir(q);
    if (seq !== busquedaSeq) return;
    sugerencias.value = data;
    mostrarSugerencias.value = data.length > 0;
  } catch {
    if (seq !== busquedaSeq) return;
    sugerencias.value = [];
    mostrarSugerencias.value = false;
  } finally {
    if (seq === busquedaSeq) buscando.value = false;
  }
};

const onInput = (e) => {
  const val = formatearPlacaEscrita(props.placa, e.target.value);
  e.target.value = val;
  emit('update:placa', val);
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => buscarSugerencias(val), 280);
};

const elegir = (vehiculo) => {
  sugerencias.value = [];
  mostrarSugerencias.value = false;
  emit('update:placa', vehiculo.placa);
  emit('buscar', vehiculo.placa);
};

const cerrarSugerencias = () => {
  setTimeout(() => { mostrarSugerencias.value = false; }, 180);
};

onBeforeUnmount(() => clearTimeout(debounceTimer));
</script>

<template>
  <section class="space-y-4">
    <div class="flex items-center gap-2.5">
      <div class="flex h-8 w-8 items-center justify-center rounded-lg border border-lyer-cyan/30 bg-lyer-cyan/10 text-lyer-cyan">
        <Search class="h-4 w-4" />
      </div>
      <h2 class="font-display text-base font-bold uppercase tracking-wider text-white md:text-lg">Identificar placa</h2>
    </div>

    <div>
      <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">
        Placa
        <span class="text-lyer-accent">*</span>
      </label>
    <div class="flex flex-col items-stretch gap-3 sm:flex-row">
      <div :class="['relative min-w-0 flex-1', mostrarSugerencias && 'z-20']">
      <input
        :value="placa"
        maxlength="12"
        placeholder="EJ: ABC-123"
        autocomplete="off"
        :class="[
          'h-14 w-full rounded-xl border bg-[#140a22] px-4 pr-12 font-mono text-xl font-bold uppercase tracking-widest text-white placeholder:text-slate-600 focus:outline-none md:text-2xl',
          error ? 'border-rose-400 focus:border-rose-400' : 'border-[#4a2870]/50 focus:border-lyer-cyan',
        ]"
        @input="onInput"
        @focus="sugerencias.length && (mostrarSugerencias = true)"
        @blur="cerrarSugerencias"
        @keyup.enter="emit('buscar', placa)"
      />
      <Loader2 v-if="buscando" class="absolute right-4 top-4.5 h-5 w-5 animate-spin text-lyer-cyan" />
      <ul
        v-if="mostrarSugerencias && sugerencias.length"
        class="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-[#4a2870]/50 bg-[#140a22] shadow-xl"
      >
        <li
          v-for="v in sugerencias"
          :key="v.placa"
          class="cursor-pointer border-b border-[#4a2870]/30 px-4 py-3 last:border-0 hover:bg-[#2a1840]"
          @mousedown.prevent="elegir(v)"
        >
          <p class="font-mono text-base font-bold tracking-widest text-white">{{ v.placa }}</p>
          <p class="text-[11px] font-medium text-slate-400">
            {{ v.marca?.nombre || 'Sin marca' }}
            <span v-if="v.modelo"> · {{ v.modelo }}</span>
          </p>
        </li>
      </ul>
      </div>
      <button
        type="button"
        class="flex h-14 items-center justify-center gap-2 rounded-xl border border-lyer-accent/40 bg-[#2a0a4a] px-8 font-display text-base font-bold uppercase tracking-wider text-white hover:bg-[#3a1260]"
        @click="emit('buscar', placa)"
      >
        <Search class="h-5 w-5" />
        Buscar placa
      </button>
    </div>
    </div>

    <p v-if="error" class="text-sm font-medium text-rose-300">{{ error }}</p>
    <button
      v-if="puedeEscanear"
      type="button"
      class="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-lyer-cyan"
      @click="emit('escanear')"
    >
      <Camera class="h-4 w-4" />
      Escanear con cámara
    </button>
    <p v-else-if="!historial.length && !placa" class="flex items-start gap-2 text-xs text-slate-400 md:text-sm">
      <Info class="mt-0.5 h-4 w-4 shrink-0 text-lyer-cyan" />
      Formato de placa: AAA-AAA.
    </p>

    <div v-if="historial.length" class="overflow-hidden rounded-xl border border-[#4a2870]/40">
      <div class="flex items-center gap-2 bg-[#160a24] px-4 py-3 text-slate-400">
        <History class="h-4 w-4" />
        <span class="text-[10px] font-bold uppercase tracking-widest">Historial reciente ({{ historial.length }})</span>
      </div>
      <ul class="divide-y divide-[#4a2870]/30">
        <li v-for="o in historial" :key="o.id" class="flex justify-between gap-3 px-4 py-3 text-sm">
          <div>
            <span class="font-bold text-lyer-cyan">{{ o.numeroOrden }}</span>
            <span class="ml-2 text-xs text-slate-400">{{ nombreClienteOrden(o) }}</span>
          </div>
          <span class="text-[10px] font-bold uppercase text-slate-400">{{ labelEstadoOrden(o.estado) }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>
