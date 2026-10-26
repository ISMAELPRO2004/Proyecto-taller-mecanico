<script setup>
import EncabezadoLogin from './encabezado/EncabezadoLogin.vue';
import FormLogin from './formulario/FormLogin.vue';
import PanelBienvenida from './bienvenida/PanelBienvenida.vue';
import { useLogin } from './composables/useLogin.js';
import fondoLogin from '../../assets/fondo_login.jpg';

const { nombreUsuario, contrasena, verClave, cargando, entrar } = useLogin();
</script>

<template>
  <div class="login-shell relative flex min-h-dvh flex-col bg-[#080d1a] text-slate-100 lg:h-screen lg:flex-row lg:overflow-hidden" data-theme="lyer">
    <div class="absolute inset-0 lg:hidden" aria-hidden="true">
      <img :src="fondoLogin" alt="" class="h-full w-full object-cover object-center contrast-110 saturate-[0.85]" />
      <div class="absolute inset-0 bg-slate-950/78" />
      <div class="absolute inset-0 bg-gradient-to-b from-slate-950/35 via-slate-950/72 to-slate-950/92" />
      <div class="grid-pattern absolute inset-0 opacity-50" />
    </div>

    <main class="relative z-20 flex min-h-dvh w-full flex-col justify-center border-slate-800/80 bg-transparent p-6 sm:p-10 lg:h-full lg:min-h-0 lg:w-[48%] lg:border-r lg:bg-slate-950/95 lg:p-12 xl:w-[44%] xl:p-14">
      <div class="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-lyer-green/20 blur-3xl sm:h-80 sm:w-80" />
      <div class="relative z-10 mx-auto w-full max-w-xl py-8 lg:mx-0">
        <EncabezadoLogin />
        <FormLogin
          v-model:nombre-usuario="nombreUsuario"
          v-model:contrasena="contrasena"
          v-model:ver-clave="verClave"
          :cargando="cargando"
          @submit="entrar"
        />
      </div>
    </main>

    <PanelBienvenida />
  </div>
</template>

<style scoped>
.login-shell {
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
}

.grid-pattern {
  background-size: 32px 32px;
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
}
</style>
