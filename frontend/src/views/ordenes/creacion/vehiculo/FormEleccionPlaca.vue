<script setup>
import { Camera, Keyboard } from 'lucide-vue-next';

defineEmits(['escanear', 'manual']);
</script>

<template>
  <section class="space-y-5 rounded-2xl border border-[#4a2870]/45 bg-[#221433]/90 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.35)] sm:p-8">
    <div>
      <h2 class="font-display text-xl font-bold uppercase tracking-tight text-white md:text-2xl">
        Identificar placa
      </h2>
      <p class="mt-1 text-sm text-slate-400">
        Elige cómo registrar el vehículo para la orden.
      </p>
    </div>

    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <button
        type="button"
        class="flex flex-col items-start gap-3 rounded-2xl border border-lyer-cyan/35 bg-[#160a24] p-5 text-left hover:border-lyer-cyan/70"
        @click="$emit('escanear')"
      >
        <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-lyer-cyan/15 text-lyer-cyan">
          <Camera class="h-5 w-5" />
        </span>
        <span class="font-display text-base font-bold uppercase tracking-wider text-white">Escanear placa</span>
        <span class="text-xs leading-relaxed text-slate-400">
          Enciende la cámara, toma la foto y confirma los dígitos.
        </span>
      </button>

      <button
        type="button"
        class="flex flex-col items-start gap-3 rounded-2xl border border-[#4a2870]/50 bg-[#160a24] p-5 text-left hover:border-lyer-accent/50"
        @click="$emit('manual')"
      >
        <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-lyer-accent/15 text-lyer-soft">
          <Keyboard class="h-5 w-5" />
        </span>
        <span class="font-display text-base font-bold uppercase tracking-wider text-white">Escribirla</span>
        <span class="text-xs leading-relaxed text-slate-400">
          Ingresa la placa a mano y busca el historial del vehículo.
        </span>
      </button>
    </div>
  </section>
</template>
