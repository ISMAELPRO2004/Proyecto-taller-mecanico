<script setup>
defineProps({
  stats: { type: Object, required: true },
  cargando: { type: Boolean, default: false },
});
</script>

<template>
  <div v-if="cargando" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
    <div v-for="n in 5" :key="n" class="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse h-24" />
  </div>

  <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
    <div class="bg-white p-4 rounded-2xl border-b-4 border-lyer-green shadow-sm flex flex-col gap-1">
      <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total</p>
      <h3 class="text-3xl font-black text-slate-800">{{ stats.total }}</h3>
      <p class="text-[10px] text-slate-400 font-medium">Órdenes registradas</p>
    </div>

    <div class="bg-white p-4 rounded-2xl border-b-4 border-amber-400 shadow-sm flex flex-col gap-1">
      <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Reparación</p>
      <h3 class="text-3xl font-black text-amber-500">{{ stats.enReparacion }}</h3>
      <p class="text-[10px] text-slate-400 font-medium">En proceso activo</p>
    </div>

    <div class="bg-white p-4 rounded-2xl border-b-4 border-sky-400 shadow-sm flex flex-col gap-1">
      <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">En Espera</p>
      <h3 class="text-3xl font-black text-sky-500">
        {{ stats.esperandoRepuesto + stats.cambioAceite }}
      </h3>
      <p class="text-[10px] text-slate-400 font-medium">Repuesto o aceite</p>
    </div>

    <div class="bg-white p-4 rounded-2xl border-b-4 border-emerald-500 shadow-sm flex flex-col gap-1">
      <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Terminadas</p>
      <h3 class="text-3xl font-black text-emerald-600">{{ stats.terminadas }}</h3>
      <p class="text-[10px] text-slate-400 font-medium">Listas para entrega</p>
    </div>

    <div class="bg-white p-4 rounded-2xl border-b-4 border-red-400 shadow-sm flex flex-col gap-1 col-span-2 sm:col-span-1">
      <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Canceladas</p>
      <h3 class="text-3xl font-black text-red-500">{{ stats.canceladas }}</h3>
      <p class="text-[10px] text-slate-400 font-medium">Sin completar</p>
    </div>
  </div>
</template>
