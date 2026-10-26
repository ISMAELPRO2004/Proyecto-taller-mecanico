<script setup>
import { ref, onBeforeUnmount } from 'vue';
import { Search, Loader2 } from 'lucide-vue-next';
import { clienteService } from '../../../../services/clienteService.js';

const props = defineProps({
  nombre: { type: String, default: '' },
  bloqueado: { type: Boolean, default: false },
  error: { type: String, default: '' },
});

const emit = defineEmits(['update:nombre', 'marcar-nuevo', 'seleccionar']);

const sugerencias = ref([]);
const buscando = ref(false);
const mostrarSugerencias = ref(false);
let debounceTimer = null;
let busquedaSeq = 0;

const buscarPorNombre = async (texto) => {
  if (props.bloqueado) return;
  const q = String(texto || '').trim();
  const seq = ++busquedaSeq;
  if (q.length < 2) {
    sugerencias.value = [];
    mostrarSugerencias.value = false;
    return;
  }
  buscando.value = true;
  try {
    const data = await clienteService.listar(q);
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

const onNombreInput = (e) => {
  const valor = e.target.value;
  emit('update:nombre', valor);
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => buscarPorNombre(valor), 280);
};

const seleccionar = (c) => {
  if (props.bloqueado) return;
  emit('seleccionar', c);
  sugerencias.value = [];
  mostrarSugerencias.value = false;
};

const buscarCliente = () => {
  sugerencias.value = [];
  mostrarSugerencias.value = false;
  emit('marcar-nuevo');
};

const cerrarSugerencias = () => {
  setTimeout(() => { mostrarSugerencias.value = false; }, 180);
};

onBeforeUnmount(() => clearTimeout(debounceTimer));
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-2.5">
      <div class="flex h-8 w-8 items-center justify-center rounded-lg border border-lyer-cyan/30 bg-lyer-cyan/10 text-lyer-cyan">
        <Search class="h-4 w-4" />
      </div>
      <h2 class="font-display text-base font-bold uppercase tracking-wider text-lyer-fg md:text-lg">Identificar cliente</h2>
    </div>

    <div>
      <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-lyer-muted">
        Nombre del cliente o empresa
        <span class="text-lyer-accent">*</span>
      </label>
      <div class="flex flex-col items-stretch gap-3 sm:flex-row">
        <div :class="['relative min-w-0 flex-1', mostrarSugerencias && 'z-20']">
          <input
            :value="nombre"
            :disabled="bloqueado"
            autocomplete="off"
            placeholder="Escribe para buscar..."
            :class="[
              'h-14 w-full rounded-xl border bg-lyer-fondo px-4 pr-12 text-xl font-semibold text-lyer-fg placeholder:text-lyer-muted focus:outline-none',
              error ? 'border-rose-400 focus:border-rose-400' : 'border-lyer-linea/50 focus:border-lyer-cyan',
            ]"
            @input="onNombreInput"
            @focus="!bloqueado && sugerencias.length && (mostrarSugerencias = true)"
            @blur="cerrarSugerencias"
            @keyup.enter="buscarCliente"
          />
          <Loader2 v-if="buscando" class="absolute right-4 top-4.5 h-5 w-5 animate-spin text-lyer-cyan" />
          <ul
            v-if="!bloqueado && mostrarSugerencias && sugerencias.length"
            class="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-lyer-linea/50 bg-lyer-fondo shadow-xl"
          >
            <li
              v-for="c in sugerencias"
              :key="c.id"
              class="cursor-pointer border-b border-lyer-linea/30 px-4 py-3 last:border-0 hover:bg-lyer-hover"
              @mousedown.prevent="seleccionar(c)"
            >
              <p class="text-sm font-semibold uppercase text-lyer-fg">{{ c.nombreRazonSocial }}</p>
              <p class="text-[11px] font-medium text-lyer-muted">
                <template v-if="c.numeroDocumento">{{ c.tipoDocumento }} {{ c.numeroDocumento }}</template>
                <template v-else>Sin documento</template>
                <span v-if="c.celular"> · {{ c.celular }}</span>
              </p>
            </li>
          </ul>
        </div>
        <button
          type="button"
          class="flex h-14 items-center justify-center gap-2 rounded-xl border border-lyer-accent/40 bg-lyer-boton px-6 font-display text-base font-bold uppercase tracking-wider text-lyer-fg hover:bg-lyer-boton disabled:opacity-60"
          :disabled="bloqueado"
          @click="buscarCliente"
        >
          <Search class="h-5 w-5" />
          Buscar cliente
        </button>
      </div>
      <p v-if="error" class="mt-2 text-sm font-medium text-rose-300">{{ error }}</p>
    </div>
  </div>
</template>
