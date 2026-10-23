<script setup>
import TarjetaEstadistica from './TarjetaEstadistica.vue';

defineProps({
  stats: { type: Object, required: true },
  cargando: { type: Boolean, default: false },
});
</script>

<template>
  <div v-if="cargando" class="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
    <div v-for="n in 5" :key="n" class="h-28 animate-pulse rounded-2xl border border-[#4a2870]/45 bg-[#221433]/90" />
  </div>

  <div v-else class="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
    <TarjetaEstadistica
      titulo="Total"
      :valor="stats.total"
      descripcion="Órdenes registradas"
    />
    <TarjetaEstadistica
      titulo="Reparación"
      :valor="stats.enReparacion"
      descripcion="En proceso activo"
      barra="bg-amber-500"
      etiqueta="text-amber-400"
      tono="text-amber-400"
      hover="transition-colors hover:border-amber-500/40"
    />
    <TarjetaEstadistica
      titulo="En espera"
      :valor="stats.esperandoRepuesto + stats.cambioAceite"
      descripcion="Repuesto o aceite"
      barra="bg-sky-500"
      etiqueta="text-sky-400"
      tono="text-sky-400"
      hover="transition-colors hover:border-sky-500/40"
    />
    <TarjetaEstadistica
      titulo="Terminadas"
      :valor="stats.terminadas"
      descripcion="Listas para entrega"
      barra="bg-green-500"
      etiqueta="text-green-400"
      tono="text-green-400"
      hover="transition-colors hover:border-green-500/40"
    />
    <TarjetaEstadistica
      titulo="Canceladas"
      :valor="stats.canceladas"
      descripcion="Sin completar"
      barra="bg-red-500"
      etiqueta="text-red-400"
      tono="text-red-400"
      hover="transition-colors hover:border-red-500/40"
      ancho="col-span-2 sm:col-span-1"
    />
  </div>
</template>
