<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../../stores/auth.js';
import { useRouter } from 'vue-router';

const username = ref('');
const password = ref('');
const auth = useAuthStore();
const router = useRouter();

const handleLogin = async () => {
  const success = await auth.login(username.value, password.value);
  if (success) {
    router.push('/home');
  } else {
    alert('Credenciales incorrectas');
  }
};
</script>

<template>
  <div class="hero min-h-screen bg-base-200">
    <div class="hero-content flex-col">
      <div class="text-center lg:text-left mb-4">
        <h1 class="text-5xl font-bold text-red-600">Mecánica LYER</h1>
        <p class="py-2">Acceso al sistema de gestión interno.</p>
      </div>
      <div class="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
        <form @submit.prevent="handleLogin" class="card-body">
          <div class="form-control">
            <label class="label"><span class="label-text">Usuario</span></label>
            <input v-model="username" type="text" placeholder="admin" class="input input-bordered" required />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">Contraseña</span></label>
            <input v-model="password" type="password" placeholder="******" class="input input-bordered" required />
          </div>
          <div class="form-control mt-6">
            <button class="btn btn-primary bg-red-600 border-none hover:bg-red-700">Ingresar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>