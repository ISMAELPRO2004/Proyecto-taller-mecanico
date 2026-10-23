<script setup>
import logoEmpresa from '../../../assets/logoEmpresa.png';
</script>

<template>
  <div class="mb-7 flex flex-col items-center text-center lg:items-start lg:text-left">
    <img
      :src="logoEmpresa"
      alt="Taller Mecánica LYER"
      class="h-28 w-auto max-w-[300px] object-contain drop-shadow-md sm:h-32 sm:max-w-[340px] lg:h-36 lg:max-w-[420px] xl:h-44"
    />
    <div class="mt-6 lg:mt-8">
      <p class="text-[10px] font-medium uppercase tracking-[0.18em] text-lyer-cyan/90 sm:text-xs sm:tracking-widest">
        Sistema de gestión integral de taller
      </p>
      <h1 class="mt-3 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
        Iniciar sesión
        <span class="text-lyer-cyan">.</span>
      </h1>
      <p class="mt-2 text-sm leading-relaxed text-slate-400">
        Ingrese sus credenciales para acceder al sistema del taller.
      </p>
    </div>
  </div>
</template>
