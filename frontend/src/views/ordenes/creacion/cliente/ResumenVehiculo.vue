<script setup>
import { Car } from 'lucide-vue-next';

defineProps({
  resumen: { type: Object, required: true },
  puedeEditar: { type: Boolean, default: false },
});

defineEmits(['editar', 'cambiar']);
</script>

<template>
  <div class="flex flex-col gap-4 rounded-2xl border border-lyer-cyan/30 bg-[#221433]/90 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
    <div class="flex min-w-0 items-center gap-3.5">
      <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-lyer-cyan/40 bg-lyer-cyan/10 text-lyer-cyan">
        <Car class="h-5 w-5" />
      </div>
      <div class="min-w-0">
        <span class="block text-[11px] font-semibold uppercase tracking-wider text-lyer-cyan">Vehículo asociado</span>
        <p class="mt-0.5 truncate text-sm text-slate-300 md:text-base">
          <span class="mr-2 inline-block rounded border border-[#4a2870] bg-[#140a22] px-2 py-0.5 font-mono text-base font-bold tracking-wider text-white">
            {{ resumen.placa }}
          </span>
          {{ resumen.marca }} {{ resumen.modelo }}
          <span
            v-if="resumen.kilometraje || resumen.horometro"
            class="ml-2 hidden font-mono text-xs text-slate-500 md:inline"
          >
            <template v-if="resumen.kilometraje">{{ resumen.kilometraje }} KM</template>
            <template v-if="resumen.kilometraje && resumen.horometro"> · </template>
            <template v-if="resumen.horometro">{{ resumen.horometro }} HRS</template>
          </span>
        </p>
      </div>
    </div>
    <div class="flex items-center gap-2 self-start sm:self-auto">
      <button
        v-if="puedeEditar"
        type="button"
        class="inline-flex items-center gap-1.5 rounded-lg border border-[#4a2870]/50 bg-[#2a1840] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-lyer-cyan/40 hover:text-white"
        @click="$emit('editar')"
      >
        Editar
      </button>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-lg border border-[#4a2870]/50 bg-[#2a1840] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-lyer-cyan/40 hover:text-white"
        @click="$emit('cambiar')"
      >
        Cambiar
      </button>
    </div>
  </div>
</template>
