<template>
  <section class="relative overflow-hidden rounded-2xl border border-lyer-accent/25 bg-gradient-to-r from-lyer-green via-[#301050] to-lyer-ink p-6 shadow-xl sm:p-7">
    <div class="mesh-pattern pointer-events-none absolute inset-0 opacity-40" />
    <div class="pointer-events-none absolute -bottom-10 -right-10 h-72 w-72 rounded-full bg-lyer-accent/10 blur-3xl" />
    <div class="relative z-10 flex flex-col justify-between gap-5 md:flex-row md:items-center">
      <div class="max-w-2xl space-y-1.5">
        <h2 class="font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
          ¿Nueva entrada?
        </h2>
        <p class="text-sm leading-relaxed text-lyer-soft/90">
          Registra un vehículo y genera su orden de trabajo.
        </p>
      </div>
      <button
        class="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 font-display text-sm font-bold tracking-wide text-slate-900 shadow-lg transition-transform hover:bg-lyer-soft active:scale-95"
        @click="$router.push('/ordenes/nueva')"
      >
        <span class="text-base font-black leading-none text-lyer-green">+</span>
        Crear orden
      </button>
    </div>
  </section>
</template>
