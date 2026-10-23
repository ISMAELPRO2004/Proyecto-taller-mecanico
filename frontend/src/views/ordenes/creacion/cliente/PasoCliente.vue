<script setup>
import { ArrowLeft, ArrowRight } from 'lucide-vue-next';
import ResumenVehiculo from './ResumenVehiculo.vue';
import FormCliente from './FormCliente.vue';

defineProps({
  resumenVehiculo: { type: Object, required: true },
  puedeEditarVehiculo: { type: Boolean, default: false },
  cliente: { type: Object, required: true },
  errores: { type: Object, default: () => ({}) },
  bloqueado: { type: Boolean, default: false },
  nombreBloqueado: { type: Boolean, default: false },
  consultado: { type: Boolean, default: false },
  esNuevo: { type: Boolean, default: true },
  puedeEditarCliente: { type: Boolean, default: false },
  editando: { type: Boolean, default: false },
  clienteConfirmado: { type: Boolean, default: false },
  guardandoPaso: { type: Boolean, default: false },
  consultando: { type: Boolean, default: false },
});

defineEmits([
  'editar-vehiculo',
  'cambiar-vehiculo',
  'update:cliente',
  'actualizar-nombre',
  'cambiar-busqueda',
  'buscar-documento',
  'seleccionar-cliente',
  'editar-cliente',
  'cambiar-cliente',
  'atras',
  'cancelar',
  'guardar',
]);
</script>

<template>
  <div class="space-y-8">
    <ResumenVehiculo
      :resumen="resumenVehiculo"
      :puede-editar="puedeEditarVehiculo"
      @editar="$emit('editar-vehiculo')"
      @cambiar="$emit('cambiar-vehiculo')"
    />

    <FormCliente
      :cliente="cliente"
      :errores="errores"
      :bloqueado="bloqueado"
      :nombre-bloqueado="nombreBloqueado"
      :consultado="consultado"
      :es-nuevo="esNuevo"
      :puede-editar="puedeEditarCliente"
      :consultando="consultando"
      @update:cliente="$emit('update:cliente', $event)"
      @actualizar-nombre="$emit('actualizar-nombre', $event)"
      @cambiar-busqueda="$emit('cambiar-busqueda', $event)"
      @buscar-documento="$emit('buscar-documento')"
      @seleccionar-cliente="$emit('seleccionar-cliente', $event)"
      @editar="$emit('editar-cliente')"
    />

    <div v-if="bloqueado && !puedeEditarCliente" class="flex justify-end">
      <button
        type="button"
        class="text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white"
        @click="$emit('cambiar-cliente')"
      >
        Cambiar selección de cliente
      </button>
    </div>

    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex w-full gap-3 sm:w-auto">
        <button
          type="button"
          class="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-[#4a2870]/50 px-5 text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white sm:flex-none"
          @click="$emit('atras')"
        >
          <ArrowLeft class="h-4 w-4" />
          Atrás
        </button>
        <button
          v-if="editando && clienteConfirmado"
          type="button"
          class="inline-flex h-12 items-center justify-center rounded-xl border border-[#4a2870]/50 px-5 text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white"
          @click="$emit('cancelar')"
        >
          Cancelar
        </button>
      </div>
      <button
        type="button"
        :disabled="guardandoPaso"
        class="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-lyer-accent px-8 font-display text-sm font-bold uppercase tracking-wider text-[#1a0633] shadow-[0_0_20px_-3px_rgba(255,96,128,0.45)] disabled:opacity-60"
        @click="$emit('guardar')"
      >
        <span v-if="guardandoPaso" class="loading loading-spinner loading-sm" />
        <template v-else>
          Continuar al trabajo
          <ArrowRight class="h-5 w-5" />
        </template>
      </button>
    </div>
  </div>
</template>
