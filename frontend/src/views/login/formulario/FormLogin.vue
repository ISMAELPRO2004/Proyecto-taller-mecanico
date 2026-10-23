<script setup>
import { User, Lock, ArrowRight, Eye, EyeOff } from 'lucide-vue-next';

defineProps({
  username: { type: String, default: '' },
  password: { type: String, default: '' },
  verClave: { type: Boolean, default: false },
  cargando: { type: Boolean, default: false },
});

defineEmits(['update:username', 'update:password', 'update:verClave', 'submit']);
</script>

<template>
  <form class="space-y-4" @submit.prevent="$emit('submit')">
    <div>
      <label class="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-slate-300 sm:text-xs" for="username">
        Usuario
      </label>
      <div class="relative rounded-xl border border-slate-800 bg-slate-900/80 transition-all focus-within:border-lyer-cyan focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-lyer-cyan/25">
        <User class="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          id="username"
          :value="username"
          type="text"
          autocomplete="username"
          required
          placeholder="Usuario del taller"
          class="block w-full border-0 bg-transparent py-3.5 pl-11 pr-4 text-base font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-0"
          @input="$emit('update:username', $event.target.value)"
        />
      </div>
    </div>

    <div>
      <label class="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-slate-300 sm:text-xs" for="password">
        Contraseña
      </label>
      <div class="relative rounded-xl border border-slate-800 bg-slate-900/80 transition-all focus-within:border-lyer-cyan focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-lyer-cyan/25">
        <Lock class="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          id="password"
          :value="password"
          :type="verClave ? 'text' : 'password'"
          autocomplete="current-password"
          required
          placeholder="Ingrese su clave"
          class="block w-full border-0 bg-transparent py-3.5 pl-11 pr-12 text-base font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-0"
          @input="$emit('update:password', $event.target.value)"
        />
        <button
          type="button"
          class="absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400 hover:text-white"
          :class="verClave ? 'text-lyer-cyan' : ''"
          :aria-label="verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'"
          @click="$emit('update:verClave', !verClave)"
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
        <span class="flex min-h-12 w-full items-center justify-center gap-3 rounded-[10px] bg-slate-950/25 px-6 py-3.5 font-display text-sm font-bold uppercase tracking-wider text-white sm:text-base">
          <span v-if="cargando" class="loading loading-spinner loading-sm" />
          <template v-else>
            Entrar al sistema
            <ArrowRight class="h-5 w-5" />
          </template>
        </span>
      </button>
    </div>
  </form>
</template>
