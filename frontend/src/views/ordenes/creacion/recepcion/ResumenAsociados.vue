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
    <div class="flex items-center justify-between gap-3 rounded-xl border border-[#4a2870]/45 bg-[#221433]/90 p-4">
      <div class="flex min-w-0 items-center gap-3.5">
        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-lyer-cyan/30 bg-lyer-cyan/10 text-lyer-cyan">
          <Car class="h-5 w-5" />
        </div>
        <div class="min-w-0">
          <span class="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Vehículo asociado</span>
          <div class="mt-0.5 flex flex-wrap items-center gap-2">
            <span class="rounded border border-[#4a2870] bg-[#140a22] px-2 py-0.5 font-mono text-xs font-bold tracking-wider text-white">
              {{ resumenVehiculo.placa }}
            </span>
            <span class="truncate text-sm font-semibold text-slate-100">
              {{ resumenVehiculo.marca }} {{ resumenVehiculo.modelo }}
            </span>
          </div>
          <p v-if="resumenVehiculo.kilometraje || resumenVehiculo.horometro" class="mt-0.5 font-mono text-[11px] text-slate-400">
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
          class="rounded-lg border border-[#4a2870]/50 bg-[#2a1840] px-2.5 py-1.5 text-xs font-semibold uppercase text-slate-200 hover:text-white"
          @click="$emit('editar-vehiculo')"
        >
          Editar
        </button>
        <button
          type="button"
          class="rounded-lg border border-[#4a2870]/50 bg-[#2a1840] px-2.5 py-1.5 text-xs font-semibold uppercase text-slate-400 hover:text-white"
          @click="$emit('cambiar-vehiculo')"
        >
          Cambiar
        </button>
      </div>
    </div>

    <div class="flex items-center justify-between gap-3 rounded-xl border border-[#4a2870]/45 bg-[#221433]/90 p-4">
      <div class="flex min-w-0 items-center gap-3.5">
        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-lyer-cyan/30 bg-lyer-cyan/10 text-lyer-cyan">
          <User class="h-5 w-5" />
        </div>
        <div class="min-w-0">
          <span class="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Cliente asignado</span>
          <h4 class="mt-0.5 truncate text-sm font-bold text-white">{{ resumenCliente.nombre }}</h4>
          <p class="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
            <span v-if="resumenCliente.documento" class="rounded border border-[#4a2870]/70 bg-[#140a22] px-1.5 py-0.5 font-mono">
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
          class="rounded-lg border border-[#4a2870]/50 bg-[#2a1840] px-2.5 py-1.5 text-xs font-semibold uppercase text-slate-200 hover:text-white"
          @click="$emit('editar-cliente')"
        >
          Editar
        </button>
        <button
          type="button"
          class="rounded-lg border border-[#4a2870]/50 bg-[#2a1840] px-2.5 py-1.5 text-xs font-semibold uppercase text-slate-400 hover:text-white"
          @click="$emit('cambiar-cliente')"
        >
          Cambiar
        </button>
      </div>
    </div>
  </div>
</template>
