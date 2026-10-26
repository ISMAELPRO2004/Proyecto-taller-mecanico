<script setup>
import { computed } from 'vue';
import { ArrowRight } from 'lucide-vue-next';
import FormEleccionPlaca from './FormEleccionPlaca.vue';
import FormEscanearPlaca from './FormEscanearPlaca.vue';
import FormBusquedaPlaca from './FormBusquedaPlaca.vue';
import FormVehiculo from './FormVehiculo.vue';

const props = defineProps({
  placa: { type: String, default: '' },
  historial: { type: Array, default: () => [] },
  errores: { type: Object, default: () => ({}) },
  placaConsultada: { type: Boolean, default: false },
  vehiculo: { type: Object, required: true },
  marcas: { type: Array, default: () => [] },
  bloqueado: { type: Boolean, default: false },
  puedeEditar: { type: Boolean, default: false },
  editando: { type: Boolean, default: false },
  ordenId: { type: [Number, String, null], default: null },
  guardandoPaso: { type: Boolean, default: false },
  pasoOrigenEdicion: { type: [Number, null], default: null },
  modoEntrada: { type: String, default: null },
});

const emit = defineEmits([
  'update:placa',
  'buscar',
  'update:vehiculo',
  'crear-marca',
  'editar',
  'cancelar',
  'guardar',
  'elegir-modo',
]);

const mostrarEleccion = computed(() =>
  !props.placaConsultada && !props.ordenId && !props.modoEntrada && !props.editando
);
const mostrarEscaner = computed(() =>
  props.modoEntrada === 'escanear' && !props.placaConsultada && !props.ordenId
);
const puedeEscanear = computed(() => !props.ordenId && !props.placaConsultada);
</script>

<template>
  <FormEleccionPlaca
    v-if="mostrarEleccion"
    @escanear="emit('elegir-modo', 'escanear')"
    @manual="emit('elegir-modo', 'manual')"
  />

  <FormEscanearPlaca
    v-else-if="mostrarEscaner"
    @usar-placa="emit('buscar', $event)"
    @manual="emit('elegir-modo', 'manual')"
  />

  <div
    v-else
    class="space-y-8 rounded-2xl border border-[#4a2870]/45 bg-[#221433]/90 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.35)] sm:p-8 md:p-10"
  >
    <FormBusquedaPlaca
      :placa="placa"
      :historial="historial"
      :error="errores.placa"
      :puede-escanear="puedeEscanear"
      @update:placa="$emit('update:placa', $event)"
      @buscar="$emit('buscar', $event)"
      @escanear="emit('elegir-modo', 'escanear')"
    />

    <template v-if="placaConsultada">
      <div class="border-t border-[#4a2870]/40" />
      <FormVehiculo
        :vehiculo="vehiculo"
        :marcas="marcas"
        :errores="errores"
        :bloqueado="bloqueado"
        :puede-editar="puedeEditar"
        @update:vehiculo="$emit('update:vehiculo', $event)"
        @crear-marca="$emit('crear-marca', $event)"
        @editar="$emit('editar')"
      />

      <div class="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          v-if="editando && ordenId"
          type="button"
          class="h-12 rounded-xl border border-[#4a2870]/50 px-5 text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white"
          @click="$emit('cancelar')"
        >
          Cancelar
        </button>
        <span v-else />
        <button
          type="button"
          :disabled="guardandoPaso"
          class="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-lyer-accent px-8 font-display text-sm font-bold uppercase tracking-wider text-[#1a0633] shadow-[0_0_20px_-3px_rgba(255,96,128,0.45)] disabled:opacity-60 sm:ml-auto"
          @click="$emit('guardar')"
        >
          <span v-if="guardandoPaso" class="loading loading-spinner loading-sm" />
          <template v-else>
            {{ editando && ordenId
              ? (pasoOrigenEdicion >= 3 ? 'Guardar y volver' : 'Guardar vehículo')
              : 'Continuar al cliente' }}
            <ArrowRight class="h-5 w-5" />
          </template>
        </button>
      </div>
    </template>
  </div>
</template>
