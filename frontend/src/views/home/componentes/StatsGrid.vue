<script setup>
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
    <article class="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#4a2870]/45 bg-[#221433]/90 p-4 shadow-md sm:p-5">
      <div class="absolute bottom-0 left-0 h-1 w-full bg-slate-400" />
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total</p>
        <h3 class="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">{{ stats.total }}</h3>
      </div>
      <p class="mt-3 truncate text-xs text-slate-400">Órdenes registradas</p>
    </article>

    <article class="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#4a2870]/45 bg-[#221433]/90 p-4 shadow-md transition-colors hover:border-amber-500/40 sm:p-5">
      <div class="absolute bottom-0 left-0 h-1 w-full bg-amber-500" />
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-wider text-amber-400">Reparación</p>
        <h3 class="mt-2 font-display text-3xl font-bold tracking-tight text-amber-400 sm:text-4xl">{{ stats.enReparacion }}</h3>
      </div>
      <p class="mt-3 truncate text-xs text-slate-400">En proceso activo</p>
    </article>

    <article class="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#4a2870]/45 bg-[#221433]/90 p-4 shadow-md transition-colors hover:border-sky-500/40 sm:p-5">
      <div class="absolute bottom-0 left-0 h-1 w-full bg-sky-500" />
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-wider text-sky-400">En espera</p>
        <h3 class="mt-2 font-display text-3xl font-bold tracking-tight text-sky-400 sm:text-4xl">
          {{ stats.esperandoRepuesto + stats.cambioAceite }}
        </h3>
      </div>
      <p class="mt-3 truncate text-xs text-slate-400">Repuesto o aceite</p>
    </article>

    <article class="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#4a2870]/45 bg-[#221433]/90 p-4 shadow-md transition-colors hover:border-green-500/40 sm:p-5">
      <div class="absolute bottom-0 left-0 h-1 w-full bg-green-500" />
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-wider text-green-400">Terminadas</p>
        <h3 class="mt-2 font-display text-3xl font-bold tracking-tight text-green-400 sm:text-4xl">{{ stats.terminadas }}</h3>
      </div>
      <p class="mt-3 truncate text-xs text-slate-400">Listas para entrega</p>
    </article>

    <article class="relative col-span-2 flex flex-col justify-between overflow-hidden rounded-2xl border border-[#4a2870]/45 bg-[#221433]/90 p-4 shadow-md transition-colors hover:border-red-500/40 sm:col-span-1 sm:p-5">
      <div class="absolute bottom-0 left-0 h-1 w-full bg-red-500" />
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-wider text-red-400">Canceladas</p>
        <h3 class="mt-2 font-display text-3xl font-bold tracking-tight text-red-400 sm:text-4xl">{{ stats.canceladas }}</h3>
      </div>
      <p class="mt-3 truncate text-xs text-slate-400">Sin completar</p>
    </article>
  </div>
</template>
