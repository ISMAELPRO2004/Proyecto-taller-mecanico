<script setup>
import { ref, onBeforeUnmount } from 'vue';
import { User, Loader2, Edit3, Search, Phone, Mail, ChevronDown, Info, CheckCircle2 } from 'lucide-vue-next';
import { clienteService } from '../../../services/clienteService.js';

const props = defineProps({
  cliente: { type: Object, required: true },
  errores: { type: Object, default: () => ({}) },
  bloqueado: { type: Boolean, default: false },
  nombreBloqueado: { type: Boolean, default: false },
  consultado: { type: Boolean, default: false },
  esNuevo: { type: Boolean, default: true },
  puedeEditar: { type: Boolean, default: false },
});

const emit = defineEmits(['update:cliente', 'actualizar-nombre', 'sin-coincidencias', 'seleccionar-cliente', 'editar']);

const sugerencias = ref([]);
const buscando = ref(false);
const mostrarSugerencias = ref(false);
let debounceTimer = null;
let busquedaSeq = 0;

const digitosDocumento = (tipo, valor) => {
  const max = tipo === 'RUC' ? 11 : 8;
  return String(valor || '').replace(/\D/g, '').slice(0, max);
};

const patch = (campo, valor) => {
  if (props.bloqueado) return;
  const next = { ...props.cliente, [campo]: valor };
  if (campo === 'tipoCliente' && valor === 'EMPRESA') {
    next.tipoDocumento = 'RUC';
  }
  if (campo === 'tipoCliente' || campo === 'tipoDocumento') {
    next.numeroDocumento = digitosDocumento(next.tipoDocumento, next.numeroDocumento);
  }
  if (campo === 'numeroDocumento') {
    next.numeroDocumento = digitosDocumento(next.tipoDocumento, valor);
  }
  emit('update:cliente', next);
};

const buscarPorNombre = async (texto) => {
  if (props.nombreBloqueado) return;
  const q = (texto || '').trim();
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
  emit('actualizar-nombre', valor);
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => buscarPorNombre(valor), 280);
};

const seleccionarCliente = (c) => {
  if (props.nombreBloqueado) return;
  emit('seleccionar-cliente', c);
  sugerencias.value = [];
  mostrarSugerencias.value = false;
};

const buscarCliente = () => {
  sugerencias.value = [];
  mostrarSugerencias.value = false;
  emit('sin-coincidencias');
};

const cerrarSugerencias = () => {
  setTimeout(() => { mostrarSugerencias.value = false; }, 180);
};

onBeforeUnmount(() => clearTimeout(debounceTimer));

const campo = 'h-12 w-full rounded-xl border border-[#4a2870]/50 bg-[#140a22] px-4 text-sm text-white placeholder:text-slate-600 focus:border-lyer-cyan focus:outline-none disabled:cursor-not-allowed disabled:opacity-80';
</script>

<template>
  <section class="space-y-8 rounded-2xl border border-[#4a2870]/45 bg-[#221433]/90 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.35)] sm:p-8 md:p-10">
    <div class="space-y-4">
      <div class="flex items-center gap-2.5">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg border border-lyer-cyan/30 bg-lyer-cyan/10 text-lyer-cyan">
          <Search class="h-4 w-4" />
        </div>
        <h2 class="font-display text-base font-bold uppercase tracking-wider text-white md:text-lg">Identificar cliente</h2>
      </div>

      <div class="relative">
        <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">
          Nombre del cliente o empresa
          <span class="text-lyer-accent">*</span>
        </label>
        <div class="flex flex-col items-stretch gap-3 sm:flex-row">
          <div :class="['relative min-w-0 flex-1', mostrarSugerencias && 'z-20']">
            <input
              :value="cliente.nombreRazonSocial"
              :disabled="nombreBloqueado"
              autocomplete="off"
              placeholder="Escribe para buscar..."
              :class="[
                'h-14 w-full rounded-xl border bg-[#140a22] px-4 pr-12 text-xl font-semibold text-white placeholder:text-slate-600 focus:outline-none',
                errores.nombreRazonSocial ? 'border-rose-400 focus:border-rose-400' : 'border-[#4a2870]/50 focus:border-lyer-cyan',
              ]"
              @input="onNombreInput"
              @focus="!nombreBloqueado && sugerencias.length && (mostrarSugerencias = true)"
              @blur="cerrarSugerencias"
              @keyup.enter="buscarCliente"
            />
            <Loader2 v-if="buscando" class="absolute right-4 top-4.5 h-5 w-5 animate-spin text-lyer-cyan" />
            <ul
              v-if="!nombreBloqueado && mostrarSugerencias && sugerencias.length"
              class="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-[#4a2870]/50 bg-[#140a22] shadow-xl"
            >
          <li
            v-for="c in sugerencias"
            :key="c.id"
            class="cursor-pointer border-b border-[#4a2870]/30 px-4 py-3 last:border-0 hover:bg-[#2a1840]"
            @mousedown.prevent="seleccionarCliente(c)"
          >
            <p class="text-sm font-semibold uppercase text-white">{{ c.nombreRazonSocial }}</p>
            <p class="text-[11px] font-medium text-slate-400">
              <template v-if="c.numeroDocumento">{{ c.tipoDocumento }} {{ c.numeroDocumento }}</template>
              <template v-else>Sin documento</template>
              <span v-if="c.celular"> · {{ c.celular }}</span>
            </p>
          </li>
            </ul>
          </div>
          <button
            type="button"
            class="flex h-14 items-center justify-center gap-2 rounded-xl border border-lyer-accent/40 bg-[#2a0a4a] px-6 font-display text-base font-bold uppercase tracking-wider text-white hover:bg-[#3a1260] disabled:opacity-60"
            :disabled="nombreBloqueado"
            @click="buscarCliente"
          >
            <Search class="h-5 w-5" />
            Buscar cliente
          </button>
        </div>
      </div>
      <p v-if="errores.nombreRazonSocial" class="text-sm font-medium text-rose-300">{{ errores.nombreRazonSocial }}</p>
    </div>

    <template v-if="consultado">
      <div class="border-t border-[#4a2870]/40" />

      <p v-if="esNuevo" class="flex items-start gap-2 text-sm text-slate-300">
        <Info class="mt-0.5 h-4 w-4 shrink-0 text-lyer-cyan" />
        <span>
          {{ cliente.tipoCliente === 'EMPRESA' ? 'Nueva empresa' : 'Nueva persona' }}.
          Completa los datos para registrarla. El documento es opcional.
        </span>
      </p>
      <p v-else class="flex items-start gap-2 text-sm text-lyer-cyan">
        <CheckCircle2 class="mt-0.5 h-4 w-4 shrink-0" />
        <span>{{ cliente.tipoCliente === 'EMPRESA' ? 'Empresa registrada' : 'Persona registrada' }}</span>
      </p>

      <div class="space-y-6">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg border border-lyer-cyan/30 bg-lyer-cyan/10 text-lyer-cyan">
              <User class="h-4 w-4" />
            </div>
            <h2 class="font-display text-base font-bold uppercase tracking-wider text-white md:text-lg">Datos del cliente</h2>
          </div>
          <button
            v-if="bloqueado && puedeEditar"
            type="button"
            class="inline-flex items-center gap-1 text-sm font-semibold text-lyer-cyan hover:text-white"
            @click="$emit('editar')"
          >
            <Edit3 class="h-4 w-4" />
            Editar
          </button>
          <span
            v-else-if="bloqueado"
            class="rounded-md border border-lyer-cyan/30 bg-lyer-cyan/10 px-2.5 py-1 font-mono text-[11px] font-semibold tracking-wider text-lyer-cyan"
          >
            Guardado
          </span>
        </div>

        <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Tipo
              <span class="text-lyer-accent">*</span>
            </label>
            <div class="relative">
              <select
                :value="cliente.tipoCliente"
                :disabled="bloqueado"
                :class="[campo, 'appearance-none pr-10']"
                @change="patch('tipoCliente', $event.target.value)"
              >
                <option value="PERSONA">Persona</option>
                <option value="EMPRESA">Empresa</option>
              </select>
              <ChevronDown class="pointer-events-none absolute right-3 top-3.5 h-5 w-5 text-slate-400" />
            </div>
          </div>

          <div>
            <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">Documento</label>
            <div class="relative">
              <select
                :value="cliente.tipoCliente === 'EMPRESA' ? 'RUC' : cliente.tipoDocumento"
                :disabled="bloqueado || cliente.tipoCliente === 'EMPRESA'"
                :class="[campo, 'appearance-none pr-10', errores.tipoDocumento ? 'border-rose-400' : '']"
                @change="patch('tipoDocumento', $event.target.value)"
              >
                <option v-if="cliente.tipoCliente !== 'EMPRESA'" value="DNI">DNI</option>
                <option value="RUC">RUC</option>
              </select>
              <p v-if="errores.tipoDocumento" class="mt-1 text-xs text-rose-300">{{ errores.tipoDocumento }}</p>
              <ChevronDown class="pointer-events-none absolute right-3 top-3.5 h-5 w-5 text-slate-400" />
            </div>
          </div>

          <div>
            <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">N° documento</label>
            <input
              :value="cliente.numeroDocumento"
              :disabled="bloqueado"
              inputmode="numeric"
              :maxlength="cliente.tipoDocumento === 'RUC' ? 11 : 8"
              placeholder="Opcional"
              :class="[campo, 'font-mono', errores.numeroDocumento ? 'border-rose-400' : '']"
              @input="patch('numeroDocumento', $event.target.value)"
            />
            <p v-if="errores.numeroDocumento" class="mt-1 text-xs text-rose-300">{{ errores.numeroDocumento }}</p>
          </div>

          <div>
            <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Representante / quien deja el vehículo
            </label>
            <input
              :value="cliente.representante"
              :disabled="bloqueado"
              placeholder="Opcional"
              :class="campo"
              @input="patch('representante', $event.target.value)"
            />
          </div>

          <div>
            <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">Celular</label>
            <div class="relative">
              <Phone class="pointer-events-none absolute left-3.5 top-3.5 h-5 w-5 text-slate-500" />
              <input
                :value="cliente.celular"
                maxlength="9"
                inputmode="numeric"
                :disabled="bloqueado"
                placeholder="Opcional"
                :class="[campo, 'pl-10 font-mono', errores.celular ? 'border-rose-400' : '']"
                @input="patch('celular', $event.target.value.replace(/\D/g, ''))"
              />
            </div>
            <p v-if="errores.celular" class="mt-1 text-xs text-rose-300">{{ errores.celular }}</p>
          </div>

          <div>
            <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">Correo electrónico</label>
            <div class="relative">
              <Mail class="pointer-events-none absolute left-3.5 top-3.5 h-5 w-5 text-slate-500" />
              <input
                :value="cliente.correo"
                type="email"
                :disabled="bloqueado"
                placeholder="Opcional"
                :class="[campo, 'pl-10']"
                @input="patch('correo', $event.target.value)"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>
