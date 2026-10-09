<script setup>
import { Camera } from 'lucide-vue-next';

defineProps({
  operacion: String,
  etiqueta: String,
  imagen: String,
  tipoFoto: String,
  cargando: Boolean,
  vistaAnterior: String,
  vistaNueva: String,
});
const emit = defineEmits(['ampliar']);
</script>

<template>
  <div class="space-y-6">
  <div class="flex items-center gap-2" :class="operacion === 'QUITAR' ? 'text-red-500' : 'text-lyer-green'">
    <Camera class="w-4 h-4" />
    <span class="text-[10px] font-black uppercase tracking-widest">{{ etiqueta }}</span>
  </div>
  <div class="p-5 rounded-2xl border border-slate-100 bg-slate-50 space-y-4">
    <p class="text-sm font-black text-slate-800 uppercase">{{ imagen }}</p>
    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
      {{ tipoFoto === 'registro' ? 'Foto inicial de ingreso' : 'Foto rotativa de desarrollo' }}
    </p>

    <div v-if="cargando" class="py-8 text-center">
      <span class="loading loading-ring loading-md text-lyer-green" />
    </div>

    <div v-else-if="operacion === 'REEMPLAZAR'" class="grid grid-cols-2 gap-3">
      <div class="space-y-1.5">
        <p class="text-[9px] font-black text-slate-400 uppercase">Anterior</p>
        <button type="button" class="aspect-[4/3] w-full rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center"
          :disabled="!vistaAnterior" @click="emit('ampliar', vistaAnterior)">
          <img v-if="vistaAnterior" :src="vistaAnterior" alt="Foto anterior" class="w-full h-full object-contain" />
          <p v-else class="text-[10px] font-bold text-slate-300 uppercase px-2 text-center">Sin copia anterior</p>
        </button>
      </div>
      <div class="space-y-1.5">
        <p class="text-[9px] font-black text-lyer-green uppercase">Nueva</p>
        <button type="button" class="aspect-[4/3] w-full rounded-xl overflow-hidden bg-white border border-emerald-100 flex items-center justify-center"
          :disabled="!vistaNueva" @click="emit('ampliar', vistaNueva)">
          <img v-if="vistaNueva" :src="vistaNueva" alt="Foto nueva" class="w-full h-full object-contain" />
          <p v-else class="text-[10px] font-bold text-slate-300 uppercase px-2 text-center">Sin copia nueva</p>
        </button>
      </div>
    </div>

    <div v-else-if="operacion === 'QUITAR'">
      <p class="text-[9px] font-black text-red-400 uppercase mb-1.5">Imagen quitada</p>
      <button type="button" class="aspect-[4/3] max-w-xs w-full rounded-xl overflow-hidden bg-white border border-red-100 flex items-center justify-center"
        :disabled="!vistaAnterior" @click="emit('ampliar', vistaAnterior)">
        <img v-if="vistaAnterior" :src="vistaAnterior" alt="Foto quitada" class="w-full h-full object-contain" />
        <p v-else class="text-[10px] font-bold text-slate-300 uppercase">No hay copia de la imagen</p>
      </button>
    </div>

    <div v-else>
      <button type="button" class="aspect-[4/3] max-w-xs w-full rounded-xl overflow-hidden bg-white border border-emerald-100 flex items-center justify-center"
        :disabled="!vistaNueva" @click="emit('ampliar', vistaNueva)">
        <img v-if="vistaNueva" :src="vistaNueva" alt="Foto subida" class="w-full h-full object-contain" />
        <p v-else class="text-[10px] font-bold text-slate-300 uppercase">No hay copia de la imagen</p>
      </button>
    </div>
  </div>
  </div>
</template>
