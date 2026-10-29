<script setup>
import { computed, ref, onBeforeUnmount } from 'vue';
import { Search, Loader2 } from 'lucide-vue-next';
import { clienteService } from '../../../../services/clienteService.js';

const props = defineProps({
  modo: { type: String, default: 'documento' },
  nombre: { type: String, default: '' },
  tipoDocumento: { type: String, default: 'DNI' },
  numeroDocumento: { type: String, default: '' },
  bloqueado: { type: Boolean, default: false },
  buscando: { type: Boolean, default: false },
  errorNombre: { type: String, default: '' },
  errorDocumento: { type: String, default: '' },
});

const emit = defineEmits([
  'cambiar-modo',
  'update:nombre',
  'update:tipoDocumento',
  'update:numeroDocumento',
  'marcar-nuevo',
  'seleccionar',
  'consultar',
]);

const sugerencias = ref([]);
const buscandoNombre = ref(false);
const mostrarSugerencias = ref(false);
let debounceTimer = null;
let busquedaSeq = 0;

const modoDocumento = computed(() => props.modo === 'documento');
const maxDigitos = computed(() => (props.tipoDocumento === 'RUC' ? 11 : 8));

const buscarPorNombre = async (texto) => {
  if (props.bloqueado || modoDocumento.value) return;
  const q = String(texto || '').trim();
  const seq = ++busquedaSeq;
  if (q.length < 2) {
    sugerencias.value = [];
    mostrarSugerencias.value = false;
    return;
  }
  buscandoNombre.value = true;
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
    if (seq === busquedaSeq) buscandoNombre.value = false;
  }
};

const onNombreInput = (e) => {
  const valor = e.target.value;
  emit('update:nombre', valor);
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => buscarPorNombre(valor), 280);
};

const onNumeroInput = (e) => {
  emit('update:numeroDocumento', e.target.value.replace(/\D/g, '').slice(0, maxDigitos.value));
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

const consultarDocumento = () => {
  if (props.bloqueado) return;
  emit('consultar');
};

const cambiarModo = (siguiente) => {
  if (props.bloqueado || siguiente === props.modo) return;
  sugerencias.value = [];
  mostrarSugerencias.value = false;
  emit('cambiar-modo', siguiente);
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

    <div class="flex rounded-xl border border-lyer-linea/50 bg-lyer-fondo p-1">
      <button
        type="button"
        :disabled="bloqueado"
        :class="[
          'flex-1 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors',
          modoDocumento ? 'bg-lyer-cyan/20 text-lyer-cyan' : 'text-lyer-muted hover:text-lyer-fg',
        ]"
        @click="cambiarModo('documento')"
      >
        Por DNI / RUC
      </button>
      <button
        type="button"
        :disabled="bloqueado"
        :class="[
          'flex-1 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors',
          !modoDocumento ? 'bg-lyer-cyan/20 text-lyer-cyan' : 'text-lyer-muted hover:text-lyer-fg',
        ]"
        @click="cambiarModo('nombre')"
      >
        Por nombre
      </button>
    </div>

    <div v-if="modoDocumento">
      <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-lyer-muted">
        Documento
        <span class="text-lyer-accent">*</span>
      </label>
      <div class="flex flex-col gap-2 sm:flex-row">
        <select
          :value="tipoDocumento"
          :disabled="bloqueado"
          class="h-12 rounded-xl border border-lyer-linea/50 bg-lyer-fondo px-3 text-sm font-semibold text-lyer-fg focus:border-lyer-cyan focus:outline-none disabled:opacity-80 sm:w-28"
          @change="$emit('update:tipoDocumento', $event.target.value)"
        >
          <option value="DNI">DNI</option>
          <option value="RUC">RUC</option>
        </select>
        <input
          :value="numeroDocumento"
          :disabled="bloqueado"
          inputmode="numeric"
          :maxlength="maxDigitos"
          :placeholder="tipoDocumento === 'RUC' ? '11 dígitos' : '8 dígitos'"
          :class="[
            'h-12 min-w-0 flex-1 rounded-xl border bg-lyer-fondo px-4 font-mono text-sm text-lyer-fg placeholder:text-lyer-muted focus:border-lyer-cyan focus:outline-none disabled:opacity-80',
            errorDocumento ? 'border-rose-400' : 'border-lyer-linea/50',
          ]"
          @input="onNumeroInput"
          @keydown.enter.prevent="consultarDocumento"
        />
        <button
          type="button"
          :disabled="bloqueado || buscando"
          class="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-lyer-cyan px-5 text-sm font-bold text-lyer-green disabled:opacity-60"
          @click="consultarDocumento"
        >
          <Loader2 v-if="buscando" class="h-4 w-4 animate-spin" />
          <Search v-else class="h-4 w-4" />
          Consultar
        </button>
      </div>
      <p v-if="errorDocumento" class="mt-1 text-xs text-rose-300">{{ errorDocumento }}</p>
      <p v-else class="mt-1 text-xs text-lyer-muted">Primero busca en el taller; si no está, se consulta RENIEC / SUNAT.</p>
    </div>

    <div v-else>
      <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-lyer-muted">
        Nombre / razón social
        <span class="text-lyer-accent">*</span>
      </label>
      <div class="relative" @focusout="cerrarSugerencias">
        <div class="flex gap-2">
          <input
            :value="nombre"
            :disabled="bloqueado"
            placeholder="Escribe al menos 2 letras"
            autocomplete="off"
            :class="[
              'h-12 min-w-0 flex-1 rounded-xl border bg-lyer-fondo px-4 text-sm text-lyer-fg placeholder:text-lyer-muted focus:border-lyer-cyan focus:outline-none disabled:opacity-80',
              errorNombre ? 'border-rose-400' : 'border-lyer-linea/50',
            ]"
            @input="onNombreInput"
            @keydown.enter.prevent="buscarCliente"
            @focus="mostrarSugerencias = sugerencias.length > 0"
          />
          <button
            type="button"
            :disabled="bloqueado"
            class="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-lyer-cyan px-5 text-sm font-bold text-lyer-green disabled:opacity-60"
            @click="buscarCliente"
          >
            <Search class="h-4 w-4" />
            Buscar cliente
          </button>
        </div>
        <div
          v-if="mostrarSugerencias && sugerencias.length"
          class="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-lyer-linea/50 bg-lyer-card shadow-lg"
        >
          <button
            v-for="c in sugerencias"
            :key="c.id"
            type="button"
            class="flex w-full flex-col gap-0.5 px-4 py-2.5 text-left hover:bg-lyer-cyan/10"
            @mousedown.prevent="seleccionar(c)"
          >
            <span class="text-sm font-semibold text-lyer-fg">{{ c.nombreRazonSocial }}</span>
            <span class="font-mono text-[11px] text-lyer-muted">
              {{ c.tipoDocumento }} {{ c.numeroDocumento || 'sin documento' }}
            </span>
          </button>
        </div>
        <p v-if="buscandoNombre" class="mt-1 text-xs text-lyer-muted">Buscando coincidencias…</p>
      </div>
      <p v-if="errorNombre" class="mt-1 text-xs text-rose-300">{{ errorNombre }}</p>
      <p v-else class="mt-1 text-xs text-lyer-muted">Elige una coincidencia o pulsa Buscar cliente para registrar uno nuevo.</p>
    </div>
  </div>
</template>
