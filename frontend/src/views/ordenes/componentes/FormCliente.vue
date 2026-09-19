<script setup>
import { ref, watch, onBeforeUnmount } from 'vue';
import { User, Loader2, Edit3 } from 'lucide-vue-next';
import { clienteService } from '../../../services/clienteService.js';

const props = defineProps({
  cliente: { type: Object, required: true },
  errores: { type: Object, default: () => ({}) },
  bloqueado: { type: Boolean, default: false },
  puedeEditar: { type: Boolean, default: false },
});

const emit = defineEmits(['update:cliente', 'seleccionar-cliente', 'editar']);

const sugerencias = ref([]);
const buscando = ref(false);
const mostrarSugerencias = ref(false);
let debounceTimer = null;

const patch = (campo, valor) => {
  if (props.bloqueado) return;
  const next = { ...props.cliente, [campo]: valor };
  if (campo === 'tipoCliente') {
    next.tipoDocumento = valor === 'EMPRESA' ? 'RUC' : 'DNI';
  }
  emit('update:cliente', next);
};

const buscarPorNombre = async (texto) => {
  if (props.bloqueado) return;
  const q = (texto || '').trim();
  if (q.length < 2) {
    sugerencias.value = [];
    mostrarSugerencias.value = false;
    return;
  }
  buscando.value = true;
  try {
    sugerencias.value = await clienteService.listar(q);
    mostrarSugerencias.value = sugerencias.value.length > 0;
  } catch {
    sugerencias.value = [];
    mostrarSugerencias.value = false;
  } finally {
    buscando.value = false;
  }
};

const onNombreInput = (e) => {
  const valor = e.target.value;
  patch('nombreRazonSocial', valor);
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => buscarPorNombre(valor), 280);
};

const seleccionarCliente = (c) => {
  if (props.bloqueado) return;
  emit('seleccionar-cliente', c);
  sugerencias.value = [];
  mostrarSugerencias.value = false;
};

const cerrarSugerencias = () => {
  setTimeout(() => { mostrarSugerencias.value = false; }, 150);
};

watch(() => props.cliente.nombreRazonSocial, (val, old) => {
  if (val !== old && !mostrarSugerencias.value && sugerencias.value.length) {
    sugerencias.value = [];
  }
});

onBeforeUnmount(() => clearTimeout(debounceTimer));
</script>

<template>
  <section class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-2 text-lyer-green">
        <User class="w-4 h-4" />
        <span class="text-[10px] font-black uppercase tracking-widest">Cliente</span>
        <span v-if="bloqueado" class="badge badge-sm bg-emerald-50 text-emerald-700 border-emerald-100 font-black uppercase text-[8px]">
          Guardado
        </span>
      </div>
      <button
        v-if="bloqueado && puedeEditar"
        type="button"
        @click="$emit('editar')"
        class="btn btn-sm btn-ghost text-lyer-green font-bold gap-1"
      >
        <Edit3 class="w-3.5 h-3.5" /> Editar
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="md:col-span-2 relative">
        <label class="text-[9px] font-bold text-slate-400 block mb-1 uppercase">
          {{ cliente.tipoCliente === 'EMPRESA' ? 'Razón social' : 'Nombres y apellidos' }}
        </label>
        <div class="relative">
          <input
            :value="cliente.nombreRazonSocial"
            :disabled="bloqueado"
            @input="onNombreInput"
            @focus="!bloqueado && sugerencias.length && (mostrarSugerencias = true)"
            @blur="cerrarSugerencias"
            autocomplete="off"
            :class="[
              'input input-bordered w-full rounded-xl font-bold border-none pr-10',
              bloqueado ? 'bg-slate-50 opacity-80' : 'bg-slate-50',
              errores.nombreRazonSocial ? 'bg-red-50' : '',
            ]"
            placeholder="Escribe para buscar cliente existente..."
          />
          <Loader2 v-if="buscando" class="absolute right-3 top-3.5 w-4 h-4 animate-spin text-lyer-green" />
        </div>

        <ul
          v-if="!bloqueado && mostrarSugerencias && sugerencias.length"
          class="absolute z-30 mt-1 w-full bg-white border border-slate-200 rounded-2xl shadow-xl max-h-56 overflow-y-auto"
        >
          <li
            v-for="c in sugerencias"
            :key="c.id"
            @mousedown.prevent="seleccionarCliente(c)"
            class="px-4 py-3 hover:bg-emerald-50 cursor-pointer border-b border-slate-50 last:border-0"
          >
            <p class="font-black text-slate-800 text-sm uppercase">{{ c.nombreRazonSocial }}</p>
            <p class="text-[10px] text-slate-400 font-bold">
              {{ c.tipoDocumento }} {{ c.numeroDocumento }}
              <span v-if="c.celular"> · {{ c.celular }}</span>
            </p>
          </li>
        </ul>
        <p v-if="errores.nombreRazonSocial" class="text-xs text-red-500 mt-1">{{ errores.nombreRazonSocial }}</p>
        <p v-if="!bloqueado" class="text-[10px] text-slate-400 mt-1">Si ya existe, selecciónalo. Si es nuevo, completa los datos.</p>
      </div>

      <div>
        <label class="text-[9px] font-bold text-slate-400 block mb-1 uppercase">Tipo</label>
        <select :value="cliente.tipoCliente" :disabled="bloqueado" @change="patch('tipoCliente', $event.target.value)"
          class="select select-bordered w-full rounded-xl font-bold bg-slate-50 border-none"
          :class="bloqueado ? 'opacity-80' : ''">
          <option value="PERSONA">Persona</option>
          <option value="EMPRESA">Empresa</option>
        </select>
      </div>

      <div>
        <label class="text-[9px] font-bold text-slate-400 block mb-1 uppercase">Documento</label>
        <select :value="cliente.tipoDocumento" :disabled="bloqueado" @change="patch('tipoDocumento', $event.target.value)"
          class="select select-bordered w-full rounded-xl font-bold bg-slate-50 border-none"
          :class="bloqueado ? 'opacity-80' : ''">
          <option value="DNI">DNI</option>
          <option value="RUC">RUC</option>
        </select>
      </div>

      <div class="md:col-span-2">
        <label class="text-[9px] font-bold text-slate-400 block mb-1 uppercase">N° documento</label>
        <input
          :value="cliente.numeroDocumento"
          :disabled="bloqueado"
          @input="patch('numeroDocumento', $event.target.value.replace(/\D/g, ''))"
          :maxlength="cliente.tipoDocumento === 'RUC' ? 11 : 8"
          :class="['input input-bordered w-full rounded-xl font-bold bg-slate-50 border-none', errores.numeroDocumento ? 'bg-red-50' : '', bloqueado ? 'opacity-80' : '']"
          placeholder="Se completa al elegir el cliente o se ingresa manual"
        />
        <p v-if="errores.numeroDocumento" class="text-xs text-red-500 mt-1">{{ errores.numeroDocumento }}</p>
      </div>

      <div class="md:col-span-2">
        <label class="text-[9px] font-bold text-slate-400 block mb-1 uppercase">Representante / quien deja el vehículo</label>
        <input
          :value="cliente.representante"
          :disabled="bloqueado"
          @input="patch('representante', $event.target.value)"
          class="input input-bordered w-full rounded-xl font-bold bg-slate-50 border-none"
          :class="bloqueado ? 'opacity-80' : ''"
          placeholder="Opcional (chofer, trabajador, etc.)"
        />
      </div>

      <div>
        <label class="text-[9px] font-bold text-slate-400 block mb-1 uppercase">Celular</label>
        <input
          :value="cliente.celular"
          maxlength="9"
          :disabled="bloqueado"
          @input="patch('celular', $event.target.value.replace(/\D/g, ''))"
          class="input input-bordered w-full rounded-xl font-bold bg-slate-50 border-none"
          :class="bloqueado ? 'opacity-80' : ''"
        />
      </div>

      <div>
        <label class="text-[9px] font-bold text-slate-400 block mb-1 uppercase">Correo</label>
        <input
          :value="cliente.correo"
          type="email"
          :disabled="bloqueado"
          @input="patch('correo', $event.target.value)"
          class="input input-bordered w-full rounded-xl font-bold bg-slate-50 border-none"
          :class="bloqueado ? 'opacity-80' : ''"
        />
      </div>
    </div>
  </section>
</template>
