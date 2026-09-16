<script setup>
import { Car } from 'lucide-vue-next';
</script>

<template>
  <div class="bg-lyer-green text-white p-4 sm:p-5 rounded-2xl shadow-lg relative overflow-hidden group flex items-center gap-4">
    <div class="relative z-10 min-w-0 flex-1">
      <h4 class="text-base sm:text-lg font-black leading-tight">¿Nueva Entrada?</h4>
      <p class="text-emerald-100 text-xs mt-0.5 leading-relaxed hidden sm:block">
        Registra un nuevo vehículo y genera su orden de trabajo.
      </p>
    </div>
    <button
      @click="$router.push('/ordenes/nueva')"
      class="relative z-10 btn btn-sm sm:btn-md bg-white text-lyer-green border-none hover:bg-emerald-50 shrink-0 font-bold text-xs sm:text-sm"
    >
      + Crear Orden
    </button>
    <Car class="absolute -bottom-4 -right-4 w-24 h-24 sm:w-28 sm:h-28 opacity-10 group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
  </div>
</template>
