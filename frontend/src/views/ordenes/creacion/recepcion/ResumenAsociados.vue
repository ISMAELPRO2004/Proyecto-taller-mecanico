<script setup>
import { Car, User } from 'lucide-vue-next';

defineProps({
  resumenVehiculo: { type: Object, required: true },
  resumenCliente: { type: Object, required: true },
  puedeEditarVehiculo: { type: Boolean, default: false },
  puedeEditarCliente: { type: Boolean, default: false },
});

defineEmits(['editar-vehiculo', 'cambiar-vehiculo', 'editar-cliente', 'cambiar-cliente']);
</script>

<template>
  <div class="grid gap-3.5 sm:grid-cols-2">
    <div class="flex items-center justify-between gap-3 rounded-xl border border-lyer-linea/45 bg-lyer-card/90 p-4">
      <div class="flex min-w-0 items-center gap-3.5">
        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-lyer-cyan/30 bg-lyer-cyan/10 text-lyer-cyan">
          <Car class="h-5 w-5" />
        </div>
        <div class="min-w-0">
          <span class="block text-[11px] font-semibold uppercase tracking-wider text-lyer-muted">Vehículo asociado</span>
          <div class="mt-0.5 flex flex-wrap items-center gap-2">
            <span class="rounded border border-lyer-linea bg-lyer-fondo px-2 py-0.5 font-mono text-xs font-bold tracking-wider text-lyer-fg">
              {{ resumenVehiculo.placa }}
            </span>
            <span class="truncate text-sm font-semibold text-lyer-fg">
              {{ resumenVehiculo.marca }} {{ resumenVehiculo.modelo }}
            </span>
          </div>
          <p v-if="resumenVehiculo.kilometraje || resumenVehiculo.horometro" class="mt-0.5 font-mono text-[11px] text-lyer-muted">
            <template v-if="resumenVehiculo.kilometraje">{{ resumenVehiculo.kilometraje }} KM</template>
            <template v-if="resumenVehiculo.kilometraje && resumenVehiculo.horometro"> · </template>
            <template v-if="resumenVehiculo.horometro">{{ resumenVehiculo.horometro }} HRS</template>
          </p>
        </div>
      </div>
      <div class="flex shrink-0 items-center gap-1.5">
        <button
          v-if="puedeEditarVehiculo"
          type="button"
          class="rounded-lg border border-lyer-linea/50 bg-lyer-hover px-2.5 py-1.5 text-xs font-semibold uppercase text-lyer-fg hover:text-lyer-fg"
          @click="$emit('editar-vehiculo')"
        >
          Editar
        </button>
        <button
          type="button"
          class="rounded-lg border border-lyer-linea/50 bg-lyer-hover px-2.5 py-1.5 text-xs font-semibold uppercase text-lyer-muted hover:text-lyer-fg"
          @click="$emit('cambiar-vehiculo')"
        >
          Cambiar
        </button>
      </div>
    </div>

    <div class="flex items-center justify-between gap-3 rounded-xl border border-lyer-linea/45 bg-lyer-card/90 p-4">
      <div class="flex min-w-0 items-center gap-3.5">
        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-lyer-cyan/30 bg-lyer-cyan/10 text-lyer-cyan">
          <User class="h-5 w-5" />
        </div>
        <div class="min-w-0">
          <span class="block text-[11px] font-semibold uppercase tracking-wider text-lyer-muted">Cliente asignado</span>
          <h4 class="mt-0.5 truncate text-sm font-bold text-lyer-fg">{{ resumenCliente.nombre }}</h4>
          <p class="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-lyer-muted">
            <span v-if="resumenCliente.documento" class="rounded border border-lyer-linea/70 bg-lyer-fondo px-1.5 py-0.5 font-mono">
              {{ resumenCliente.documento }}
            </span>
            <span v-if="resumenCliente.representante">{{ resumenCliente.representante }}</span>
          </p>
        </div>
      </div>
      <div class="flex shrink-0 items-center gap-1.5">
        <button
          v-if="puedeEditarCliente"
          type="button"
          class="rounded-lg border border-lyer-linea/50 bg-lyer-hover px-2.5 py-1.5 text-xs font-semibold uppercase text-lyer-fg hover:text-lyer-fg"
          @click="$emit('editar-cliente')"
        >
          Editar
        </button>
        <button
          type="button"
          class="rounded-lg border border-lyer-linea/50 bg-lyer-hover px-2.5 py-1.5 text-xs font-semibold uppercase text-lyer-muted hover:text-lyer-fg"
          @click="$emit('cambiar-cliente')"
        >
          Cambiar
        </button>
      </div>
    </div>
  </div>
</template>
