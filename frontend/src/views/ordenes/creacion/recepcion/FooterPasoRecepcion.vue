<script setup>
import { ArrowLeft, Check } from 'lucide-vue-next';

defineProps({
  recepcionCompleta: { type: Boolean, default: false },
  guardando: { type: Boolean, default: false },
});

defineEmits(['atras', 'finalizar']);
</script>

<template>
  <footer class="flex flex-col gap-4 rounded-2xl border border-lyer-linea/45 bg-lyer-card/90 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.35)] sm:flex-row sm:items-center sm:justify-between">
    <div class="min-w-0">
      <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Al finalizar</p>
      <p class="mt-1 text-sm text-lyer-muted">
        La orden queda
        <span class="font-semibold text-lyer-soft">en espera</span>
        hasta que un supervisor la valide.
      </p>
    </div>
    <div class="flex w-full shrink-0 gap-3 sm:w-auto">
      <button
        type="button"
        class="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-lyer-linea/50 px-5 text-xs font-bold uppercase tracking-wider text-lyer-fg hover:text-lyer-fg sm:flex-none"
        @click="$emit('atras')"
      >
        <ArrowLeft class="h-4 w-4" />
        Atrás
      </button>
      <button
        type="button"
        :disabled="guardando"
        class="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-lyer-accent px-7 font-display text-sm font-bold uppercase tracking-wider text-[#1a0633] shadow-[0_0_20px_-3px_rgba(255,96,128,0.45)] disabled:opacity-60 sm:flex-none"
        @click="$emit('finalizar')"
      >
        <span v-if="guardando" class="loading loading-spinner loading-sm" />
        <template v-else>
          {{ recepcionCompleta ? 'Guardar cambios' : 'Finalizar orden' }}
          <Check class="h-5 w-5" />
        </template>
      </button>
    </div>
  </footer>
</template>
