<script setup>
import fondoLogin from '../../../assets/fondo_login.jpg';
</script>

<template>
  <section class="relative hidden flex-1 flex-col justify-center overflow-hidden bg-slate-950 p-12 lg:flex xl:p-16">
    <div class="absolute inset-0">
      <img
        :src="fondoLogin"
        alt=""
        class="h-full w-full scale-105 object-cover object-center contrast-110 saturate-[0.85]"
      />
      <div class="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/50" />
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-lyer-ink/30" />
      <div class="grid-pattern absolute inset-0 opacity-60" />
    </div>

    <div class="relative z-10 max-w-xl">
      <h2 class="font-display text-4xl font-extrabold leading-tight tracking-tight text-white xl:text-5xl">
        Bienvenido al sistema
        <br />
        <span class="bg-gradient-to-r from-lyer-cyan via-lyer-soft to-lyer-accent bg-clip-text text-transparent">
          de la mecánica LYER
        </span>
      </h2>
      <p class="mt-6 text-lg leading-relaxed text-slate-300">
        Que tenga un buen día.
      </p>
    </div>
  </section>
</template>

<style scoped>
.grid-pattern {
  background-size: 32px 32px;
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
}
</style>
