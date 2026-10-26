<script setup>
import { ref, onBeforeUnmount } from 'vue';
import { Search, Loader2, ChevronDown } from 'lucide-vue-next';
import { clienteService } from '../../../../services/clienteService.js';

const props = defineProps({
  tipoDocumento: { type: String, default: 'DNI' },
  numeroDocumento: { type: String, default: '' },
  bloqueado: { type: Boolean, default: false },
  consultando: { type: Boolean, default: false },
  error: { type: String, default: '' },
});

const emit = defineEmits(['update:tipoDocumento', 'update:numeroDocumento', 'buscar', 'seleccionar']);

const sugerencias = ref([]);
const buscando = ref(false);
const mostrarSugerencias = ref(false);
let debounceTimer = null;
let busquedaSeq = 0;

const maxDigitos = (tipo) => (tipo === 'RUC' ? 11 : 8);

const digitos = (tipo, valor) => String(valor || '').replace(/\D/g, '').slice(0, maxDigitos(tipo));

const cambiarTipo = (tipo) => {
  if (props.bloqueado) return;
  const numero = digitos(tipo, props.numeroDocumento);
  emit('update:tipoDocumento', tipo);
  emit('update:numeroDocumento', numero);
  sugerencias.value = [];
  mostrarSugerencias.value = false;
};

const buscarSugerencias = async (texto) => {
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

const onNumeroInput = (e) => {
  const valor = digitos(props.tipoDocumento, e.target.value);
  e.target.value = valor;
  emit('update:numeroDocumento', valor);
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => buscarSugerencias(valor), 280);
};

const seleccionar = (c) => {
  if (props.bloqueado) return;
  emit('seleccionar', c);
  sugerencias.value = [];
  mostrarSugerencias.value = false;
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
        DNI o RUC
        <span class="text-lyer-accent">*</span>
      </label>
      <div class="flex flex-col items-stretch gap-3 sm:flex-row">
        <div class="relative sm:w-36">
          <select
            :value="tipoDocumento"
            :disabled="bloqueado"
            class="h-14 w-full appearance-none rounded-xl border border-lyer-linea/50 bg-lyer-fondo px-4 pr-10 text-sm font-bold uppercase tracking-wider text-lyer-fg focus:border-lyer-cyan focus:outline-none disabled:cursor-not-allowed disabled:opacity-80"
            @change="cambiarTipo($event.target.value)"
          >
            <option value="DNI">DNI</option>
            <option value="RUC">RUC</option>
          </select>
          <ChevronDown class="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-lyer-muted" />
        </div>

        <div :class="['relative min-w-0 flex-1', mostrarSugerencias && 'z-20']">
          <input
            :value="numeroDocumento"
            :disabled="bloqueado"
            inputmode="numeric"
            :maxlength="maxDigitos(tipoDocumento)"
            autocomplete="off"
            :placeholder="tipoDocumento === 'RUC' ? '11 dígitos' : '8 dígitos'"
            :class="[
              'h-14 w-full rounded-xl border bg-lyer-fondo px-4 pr-12 font-mono text-xl font-bold tracking-widest text-lyer-fg placeholder:text-lyer-muted focus:outline-none',
              error ? 'border-rose-400 focus:border-rose-400' : 'border-lyer-linea/50 focus:border-lyer-cyan',
            ]"
            @input="onNumeroInput"
            @focus="!bloqueado && sugerencias.length && (mostrarSugerencias = true)"
            @blur="cerrarSugerencias"
            @keyup.enter="emit('buscar')"
          />
          <Loader2 v-if="buscando || consultando" class="absolute right-4 top-4.5 h-5 w-5 animate-spin text-lyer-cyan" />
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
          :disabled="bloqueado || consultando"
          @click="emit('buscar')"
        >
          <Search class="h-5 w-5" />
          Buscar cliente
        </button>
      </div>
      <p v-if="error" class="mt-2 text-sm font-medium text-rose-300">{{ error }}</p>
    </div>
  </div>
</template>
