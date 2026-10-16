<script setup>
import { computed } from 'vue';
import { Camera } from 'lucide-vue-next';
import { MOVIMIENTO } from '../../../../utils/movimientoLog.js';

const props = defineProps({
  operacion: String,
  etiqueta: String,
  imagen: String,
  tipoFoto: String,
  cargando: Boolean,
  vistaAnterior: String,
  vistaNueva: String,
});
const emit = defineEmits(['ampliar']);

const clave = computed(() => (
  props.operacion === 'QUITAR' ? 'eliminado' : props.operacion === 'REEMPLAZAR' ? 'modificado' : 'creado'
));
const marca = computed(() => MOVIMIENTO[clave.value]);
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-2" :class="marca.tono">
      <Camera class="h-4 w-4" />
      <span class="font-mono text-[11px] font-bold uppercase tracking-widest">{{ marca.label }}</span>
      <span class="text-sm text-slate-300">{{ etiqueta }}</span>
    </div>

    <div class="space-y-4 rounded-xl border border-[#4a2870]/45 bg-[#140a22] p-4">
      <p class="text-sm font-semibold uppercase text-white">{{ imagen }}</p>
      <p class="font-mono text-[10px] uppercase tracking-widest text-slate-400">
        {{ tipoFoto === 'registro' ? 'Foto inicial de ingreso' : 'Foto de desarrollo' }}
      </p>

      <div v-if="cargando" class="py-8 text-center">
        <span class="loading loading-ring loading-md text-lyer-accent" />
      </div>

      <div v-else-if="operacion === 'REEMPLAZAR'" class="grid grid-cols-2 gap-3">
        <div class="space-y-1.5">
          <p class="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">Anterior</p>
          <button
            type="button"
            class="flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl border border-[#4a2870]/50 bg-[#10041f]"
            :disabled="!vistaAnterior"
            @click="emit('ampliar', vistaAnterior)"
          >
            <img v-if="vistaAnterior" :src="vistaAnterior" alt="Foto anterior" class="h-full w-full object-contain" />
            <p v-else class="px-2 text-center text-[11px] text-slate-500">Sin copia anterior</p>
          </button>
        </div>
        <div class="space-y-1.5">
          <p class="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-200">Nueva</p>
          <button
            type="button"
            class="flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl border border-amber-500/30 bg-[#10041f]"
            :disabled="!vistaNueva"
            @click="emit('ampliar', vistaNueva)"
          >
            <img v-if="vistaNueva" :src="vistaNueva" alt="Foto nueva" class="h-full w-full object-contain" />
            <p v-else class="px-2 text-center text-[11px] text-slate-500">Sin copia nueva</p>
          </button>
        </div>
      </div>

      <div v-else-if="operacion === 'QUITAR'">
        <p class="mb-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-rose-300">Imagen quitada</p>
        <button
          type="button"
          class="flex aspect-[4/3] w-full max-w-xs items-center justify-center overflow-hidden rounded-xl border border-rose-500/30 bg-[#10041f]"
          :disabled="!vistaAnterior"
          @click="emit('ampliar', vistaAnterior)"
        >
          <img v-if="vistaAnterior" :src="vistaAnterior" alt="Foto quitada" class="h-full w-full object-contain" />
          <p v-else class="text-[11px] text-slate-500">No hay copia de la imagen</p>
        </button>
      </div>

      <div v-else>
        <button
          type="button"
          class="flex aspect-[4/3] w-full max-w-xs items-center justify-center overflow-hidden rounded-xl border border-green-500/30 bg-[#10041f]"
          :disabled="!vistaNueva"
          @click="emit('ampliar', vistaNueva)"
        >
          <img v-if="vistaNueva" :src="vistaNueva" alt="Foto subida" class="h-full w-full object-contain" />
          <p v-else class="text-[11px] text-slate-500">No hay copia de la imagen</p>
        </button>
      </div>
    </div>
  </div>
</template>
