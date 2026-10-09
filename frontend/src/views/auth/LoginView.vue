<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../../stores/auth.js';
import { useRouter } from 'vue-router';
import { User, Lock, ArrowRight, Eye, EyeOff } from 'lucide-vue-next';
import { notify } from '../../utils/alerts.js';
import fondoLogin from '../../assets/fondo_login.jpg';
import logoEmpresa from '../../assets/logoEmpresa.png';

const username = ref('');
const password = ref('');
const verClave = ref(false);
const cargando = ref(false);
const auth = useAuthStore();
const router = useRouter();

const handleLogin = async () => {
  cargando.value = true;
  const success = await auth.login(username.value, password.value);
  if (success) {
    notify.success('¡Bienvenido!', 'Acceso concedido al sistema.');
    router.push('/home');
  } else {
    notify.error('Error', 'Credenciales incorrectas. Intente de nuevo.');
  }
  cargando.value = false;
};
</script>

<template>
  <div class="login-shell relative min-h-dvh lg:h-screen lg:overflow-hidden flex flex-col lg:flex-row bg-[#080d1a] text-slate-100" data-theme="lyer">
    <div class="absolute inset-0 lg:hidden" aria-hidden="true">
      <img :src="fondoLogin" alt="" class="h-full w-full object-cover object-center saturate-[0.85] contrast-110" />
      <div class="absolute inset-0 bg-slate-950/78" />
      <div class="absolute inset-0 bg-gradient-to-b from-slate-950/35 via-slate-950/72 to-slate-950/92" />
      <div class="absolute inset-0 grid-pattern opacity-50" />
    </div>

    <main class="relative z-20 w-full lg:w-[48%] xl:w-[44%] min-h-dvh lg:min-h-0 lg:h-full flex flex-col justify-center p-6 sm:p-10 lg:p-12 xl:p-14 bg-transparent lg:bg-slate-950/95 border-slate-800/80 lg:border-r">
      <div class="absolute -top-24 -left-24 w-72 h-72 sm:w-80 sm:h-80 bg-lyer-green/20 rounded-full blur-3xl pointer-events-none" />

      <div class="relative z-10 w-full max-w-xl mx-auto lg:mx-0 py-8">
        <div class="mb-7 flex flex-col items-center text-center lg:items-start lg:text-left">
          <img
            :src="logoEmpresa"
            alt="Taller Mecánica LYER"
            class="h-28 sm:h-32 lg:h-36 xl:h-44 w-auto max-w-[300px] sm:max-w-[340px] lg:max-w-[420px] object-contain drop-shadow-md"
          />
          <div class="mt-6 lg:mt-8">
            <p class="text-[10px] sm:text-xs uppercase tracking-[0.18em] sm:tracking-widest text-lyer-cyan/90 font-medium">
              Sistema de gestión integral de taller
            </p>
            <h1 class="mt-3 font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Iniciar sesión
              <span class="text-lyer-cyan">.</span>
            </h1>
            <p class="mt-2 text-sm text-slate-400 leading-relaxed">
              Ingrese sus credenciales para acceder al sistema del taller.
            </p>
          </div>
        </div>

        <form class="space-y-4" @submit.prevent="handleLogin">
          <div>
            <label class="block text-[11px] sm:text-xs uppercase tracking-wider text-slate-300 font-medium mb-1.5" for="username">
              Usuario
            </label>
            <div class="relative rounded-xl border border-slate-800 bg-slate-900/80 transition-all focus-within:border-lyer-cyan focus-within:ring-2 focus-within:ring-lyer-cyan/25 focus-within:bg-slate-900">
              <User class="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                id="username"
                v-model="username"
                type="text"
                autocomplete="username"
                required
                placeholder="Usuario del taller"
                class="block w-full pl-11 pr-4 py-3.5 bg-transparent border-0 text-white placeholder-slate-500 text-base font-medium focus:ring-0 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label class="block text-[11px] sm:text-xs uppercase tracking-wider text-slate-300 font-medium mb-1.5" for="password">
              Contraseña
            </label>
            <div class="relative rounded-xl border border-slate-800 bg-slate-900/80 transition-all focus-within:border-lyer-cyan focus-within:ring-2 focus-within:ring-lyer-cyan/25 focus-within:bg-slate-900">
              <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                id="password"
                v-model="password"
                :type="verClave ? 'text' : 'password'"
                autocomplete="current-password"
                required
                placeholder="Ingrese su clave"
                class="block w-full pl-11 pr-12 py-3.5 bg-transparent border-0 text-white placeholder-slate-500 text-base font-medium focus:ring-0 focus:outline-none"
              />
              <button
                type="button"
                class="absolute right-0 inset-y-0 px-3.5 flex items-center text-slate-400 hover:text-white"
                :class="verClave ? 'text-lyer-cyan' : ''"
                :aria-label="verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                @click="verClave = !verClave"
              >
                <EyeOff v-if="verClave" class="h-5 w-5" />
                <Eye v-else class="h-5 w-5" />
              </button>
            </div>
          </div>

          <div class="pt-3">
            <button
              type="submit"
              :disabled="cargando"
              class="w-full rounded-xl bg-gradient-to-r from-lyer-green via-[#7040b0] to-lyer-accent p-0.5 shadow-[0_0_25px_-5px_rgba(128,255,255,0.35)] transition-transform duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:hover:scale-100"
            >
              <span class="flex items-center justify-center gap-3 w-full min-h-12 py-3.5 px-6 rounded-[10px] bg-slate-950/25 text-white font-display font-bold tracking-wider uppercase text-sm sm:text-base">
                <span v-if="cargando" class="loading loading-spinner loading-sm" />
                <template v-else>
                  Entrar al sistema
                  <ArrowRight class="w-5 h-5" />
                </template>
              </span>
            </button>
          </div>
        </form>
      </div>
    </main>

    <section class="hidden lg:flex flex-1 relative flex-col justify-center p-12 xl:p-16 overflow-hidden bg-slate-950">
      <div class="absolute inset-0">
        <img
          :src="fondoLogin"
          alt=""
          class="w-full h-full object-cover object-center saturate-[0.85] contrast-110 scale-105"
        />
        <div class="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/50" />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-lyer-ink/30" />
        <div class="absolute inset-0 grid-pattern opacity-60" />
      </div>

      <div class="relative z-10 max-w-xl">
        <h2 class="font-display text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Bienvenido al sistema
          <br />
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-lyer-cyan via-lyer-soft to-lyer-accent">
            de la mecánica LYER
          </span>
        </h2>
        <p class="mt-6 text-slate-300 text-lg leading-relaxed">
          Que tenga un buen día.
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.login-shell {
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
}

.font-display {
  font-family: "Space Grotesk", Inter, ui-sans-serif, system-ui, sans-serif;
}

.grid-pattern {
  background-size: 32px 32px;
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
}
</style>
