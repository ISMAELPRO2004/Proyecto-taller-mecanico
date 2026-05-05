<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../../stores/auth.js';
import { useRouter } from 'vue-router';
import { User, Lock, ArrowRight, Settings } from 'lucide-vue-next';
import { notify } from '../../utils/alerts.js';
import fondoLogin from '../../assets/fondo_login.jpg';

const username = ref('');
const password = ref('');
const cargando = ref(false);
const auth = useAuthStore();
const router = useRouter();

const handleLogin = async () => {
  cargando.value = true;
  const success = await auth.login(username.value, password.value);
  if (success) {
    notify.success("¡Bienvenido!", "Acceso concedido al sistema.");
    router.push('/home');
  } else {
    notify.error("Error", "Credenciales incorrectas. Intente de nuevo.");
  }
  cargando.value = false;
};
</script>

<template>
  <div class="flex min-h-screen bg-slate-900 overflow-hidden font-sans">
    
    <div class="w-full lg:w-[500px] bg-slate-900 relative z-10 flex flex-col justify-center p-6 sm:p-10 lg:p-16 xl:p-20 border-white/5 shadow-2xl">
      
      <div class="absolute top-[-10%] left-[-10%] w-64 h-64 bg-lyer-green/20 blur-[120px] rounded-full"></div>
      
      <div class="relative mb-12">
        <div class="flex items-center gap-3 mb-4">
          <div class="bg-lyer-green p-3 rounded-2xl shadow-lg shadow-emerald-900/40">
            <Settings class="w-8 h-8 text-white animate-spin-slow" />
          </div>
          <div>
            <h1 class="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">
              LYER <span class="text-lyer-green">MOTORS</span>
            </h1>
            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">Gestión de Taller Pesado</p>
          </div>
        </div>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6 relative">
        <div class="space-y-2">
          <h2 class="text-xl font-bold text-white uppercase tracking-tight">Iniciar Sesión</h2>
          <p class="text-xs text-slate-400 font-medium">Ingrese sus credenciales autorizadas para continuar.</p>
        </div>

        <div class="space-y-4 pt-4">
          <div class="form-control">
            <div class="relative group">
              <User class="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-lyer-green transition-colors" />
              <input v-model="username" type="text" placeholder="Usuario" 
                class="input input-bordered w-full pl-12 h-14 bg-slate-800/50 border-slate-700 text-white rounded-2xl focus:border-lyer-green focus:ring-0 transition-all font-bold" required />
            </div>
          </div>

          <div class="form-control">
            <div class="relative group">
              <Lock class="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-lyer-green transition-colors" />
              <input v-model="password" type="password" placeholder="Contraseña" 
                class="input input-bordered w-full pl-12 h-14 bg-slate-800/50 border-slate-700 text-white rounded-2xl focus:border-lyer-green focus:ring-0 transition-all font-bold" required />
            </div>
          </div>
        </div>

        <div class="pt-4">
          <button :disabled="cargando" 
            class="btn btn-lg w-full bg-lyer-green hover:bg-emerald-500 text-white border-none rounded-2xl shadow-xl shadow-emerald-900/20 group transition-all h-14">
            <span v-if="!cargando" class="flex items-center gap-2 font-black uppercase text-sm tracking-widest">
              Entrar al Sistema <ArrowRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <span v-else class="loading loading-spinner"></span>
          </button>
        </div>
      </form>
    </div>

    <div class="hidden lg:block relative flex-1">
      <div class="absolute inset-0 bg-cover bg-center" :style="`background-image: url('${fondoLogin}')`">
        <div class="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/40 to-transparent"></div>
        
        <div class="absolute bottom-20 left-20 text-white max-w-md animate-fade-in">
          <div class="h-1 w-20 bg-lyer-green mb-6"></div>
          <h3 class="text-4xl font-black uppercase italic tracking-tighter leading-tight mb-4">
            Mantenimiento <br/> de Alto <span class="text-lyer-green">Rendimiento</span>
          </h3>
          <p class="text-slate-300 text-sm font-medium leading-relaxed">
            Optimiza tu flota con herramientas de precisión. LYER Motors: Potencia y control en cada pieza.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-spin-slow {
  animation: spin 8s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-fade-in {
  animation: fadeIn 1s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Efecto de foco en inputs */
input:focus {
  background-color: rgba(15, 23, 42, 0.8) !important;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}
</style>