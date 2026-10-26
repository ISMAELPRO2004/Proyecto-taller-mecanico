<script setup>
import { ArrowLeft, ChevronDown, Receipt } from 'lucide-vue-next';
import { ESTADO, ESTADO_ORDEN_OPTIONS, ESTADOS_OPERATIVOS, labelEstadoOrden } from '../../../constants/estadosOrden.js';
import { notify } from '../../../utils/alerts.js';

const props = defineProps({
  esEdicion: { type: Boolean, default: false },
  estado: { type: String, default: ESTADO.EN_ESPERA },
  numeroOrden: { type: String, default: '' },
  modo: { type: String, default: 'recepcion' }, // recepcion | taller
  paso: { type: Number, default: 1 },
});

const emit = defineEmits(['back', 'update:estado']);

const alCambiarEstado = async (event) => {
  const nuevo = event.target.value;
  if (nuevo === ESTADO.TERMINADO && nuevo !== props.estado) {
    const ok = await notify.confirm(
      'La orden pasará a Terminada',
      'Es decir, no se podrá editar. ¿Estás seguro?'
    );
    if (!ok) {
      event.target.value = props.estado;
      return;
    }
  }
  emit('update:estado', nuevo);
};

const opcionesEstado = ESTADO_ORDEN_OPTIONS.filter((o) => ESTADOS_OPERATIVOS.includes(o.value));
</script>

<template>
  <header
    v-if="modo === 'recepcion'"
    class="flex flex-col gap-4 border-b border-lyer-linea/40 pb-6 sm:flex-row sm:items-center sm:justify-between"
  >
    <div class="flex items-center gap-4">
      <button
        type="button"
        class="flex h-11 w-11 items-center justify-center rounded-xl border border-lyer-linea/50 bg-lyer-card text-lyer-muted hover:border-lyer-cyan/50 hover:text-lyer-fg"
        title="Regresar"
        @click="$emit('back')"
      >
        <ArrowLeft class="h-5 w-5" />
      </button>
      <div>
        <h2 class="font-display text-2xl font-bold uppercase tracking-tight text-lyer-fg md:text-3xl">
          {{ esEdicion ? 'Editar orden' : 'Nueva orden' }}
        </h2>
        <p class="mt-0.5 text-xs font-medium uppercase tracking-wider text-lyer-muted">
          Registro de recepción / borrador
        </p>
      </div>
    </div>
    <div class="self-start rounded-lg border border-lyer-accent/40 bg-lyer-boton px-3 py-1.5 font-mono text-xs font-semibold tracking-wider text-lyer-soft sm:self-auto">
      Paso {{ paso }} de 3
    </div>
  </header>

  <header v-else class="rounded-2xl border border-lyer-linea/45 bg-lyer-card/90 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div class="flex min-w-0 flex-wrap items-center gap-4">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl border border-lyer-linea/50 bg-lyer-fondo px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-lyer-muted hover:text-lyer-fg"
          @click="$emit('back')"
        >
          <ArrowLeft class="h-4 w-4" />
          Volver
        </button>
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-3">
            <h2 class="flex items-center gap-2 font-display text-xl font-bold uppercase tracking-tight text-lyer-fg md:text-2xl">
              <Receipt class="h-6 w-6 text-lyer-cyan" />
              Orden de trabajo
              <span v-if="numeroOrden" class="font-mono text-lyer-cyan">{{ numeroOrden }}</span>
            </h2>
            <span class="rounded-full border border-lyer-cyan/40 bg-lyer-cyan/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-lyer-cyan">
              {{ labelEstadoOrden(estado) }}
            </span>
          </div>
          <p class="mt-1 text-[11px] font-medium uppercase tracking-widest text-lyer-muted">
            Mecánica LYER Motors
          </p>
        </div>
      </div>

      <label class="flex items-center gap-2.5 self-start rounded-xl border border-lyer-linea/60 bg-lyer-fondo px-3 py-2 lg:self-center">
        <span class="text-[11px] font-semibold uppercase tracking-wider text-lyer-muted">Estado</span>
        <div class="relative">
          <select
            :value="estado"
            class="cursor-pointer appearance-none bg-transparent py-1 pr-6 font-mono text-xs font-bold uppercase text-lyer-soft focus:outline-none"
            @change="alCambiarEstado"
          >
            <option v-if="estado === ESTADO.ACEPTADO" :value="ESTADO.ACEPTADO">Aceptado</option>
            <option v-for="opt in opcionesEstado" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          <ChevronDown class="pointer-events-none absolute right-0 top-1 h-4 w-4 text-lyer-muted" />
        </div>
      </label>
    </div>
  </header>
</template>
