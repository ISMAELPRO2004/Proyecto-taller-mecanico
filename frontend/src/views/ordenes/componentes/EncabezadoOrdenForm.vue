<script setup>
import { ArrowLeft } from 'lucide-vue-next';
import { ESTADO_ORDEN_OPTIONS, ESTADOS_OPERATIVOS } from '../../../constants/estadosOrden.js';

defineProps({
  esEdicion: { type: Boolean, default: false },
  estado: { type: String, default: 'EN_ESPERA' },
  modo: { type: String, default: 'recepcion' }, // recepcion | taller
});

defineEmits(['back', 'update:estado']);

const opcionesEstado = ESTADO_ORDEN_OPTIONS.filter((o) => ESTADOS_OPERATIVOS.includes(o.value));
</script>

<template>
  <header class="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
    <div class="flex items-center gap-4 w-full md:w-auto">
      <button @click="$emit('back')" class="btn btn-circle btn-ghost"><ArrowLeft class="w-5 h-5" /></button>
      <div>
        <h2 class="text-xl font-black text-slate-800 uppercase italic tracking-tighter">
          {{ modo === 'taller' ? 'Completar' : (esEdicion ? 'Editar' : 'Nueva') }} <span class="text-lyer-green">Orden</span>
        </h2>
        <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
          {{ modo === 'recepcion' ? 'Registro de recepción / borrador' : 'Mecánica LYER Motors' }}
        </p>
      </div>
    </div>
    <div v-if="esEdicion && modo === 'taller'" class="w-full md:w-auto bg-slate-50 px-5 py-2 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
      <span class="text-[9px] font-black text-slate-400 uppercase">Estado:</span>
      <select :value="estado" @change="$emit('update:estado', $event.target.value)"
        class="select select-xs select-ghost font-black text-lyer-green focus:bg-transparent">
        <option v-if="estado === 'ACEPTADO'" value="ACEPTADO">ACEPTADO</option>
        <option v-for="opt in opcionesEstado" :key="opt.value" :value="opt.value">
          {{ opt.label.toUpperCase() }}
        </option>
      </select>
    </div>
  </header>
</template>
