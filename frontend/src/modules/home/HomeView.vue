<script setup>
import { useAuthStore } from '../../stores/auth.js';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

const logout = () => {
  auth.logout();
  router.push('/login');
};
</script>

<template>
  <div class="min-h-screen bg-base-200 p-8">
    <header class="flex justify-between items-center mb-10">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Panel de Control</h1>
        <p class="text-gray-600">Bienvenido, <span class="text-red-600 font-bold">{{ auth.usuario?.nombre || auth.usuario?.username }}</span></p>
      </div>
      <button @click="logout" class="btn btn-outline btn-error">Cerrar Sesión</button>
    </header>

    <div v-if="['ADMIN', 'RESPONSABLE'].includes(auth.usuario?.rol)" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow border-l-4 border-red-600">
        <div class="card-body">
          <h2 class="card-title">📦 Órdenes de Trabajo</h2>
          <p>Registro y seguimiento de los vehículos en taller.</p>
          <div class="card-actions justify-end mt-4">
            <button @click="router.push('/ordenes/nueva')" class="btn btn-sm btn-primary bg-red-600 border-none">Entrar</button>
          </div>
        </div>
      </div>

      <div v-if="auth.usuario?.rol === 'ADMIN'" class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow border-l-4 border-blue-600">
        <div class="card-body">
          <h2 class="card-title">👥 Gestión de Personal</h2>
          <p>Control de usuarios y revisión de auditoría.</p>
          <div class="card-actions justify-end mt-4">
            <button @click="router.push('/logs')" class="btn btn-sm btn-info text-white">Ver Logs</button>
            <button @click="router.push('/usuarios/nuevo')" class="btn btn-sm btn-ghost border-gray-300">Nuevo Usuario</button>
          </div>
        </div>
      </div>

      <div v-if="['ADMIN', 'RESPONSABLE'].includes(auth.usuario?.rol)" class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow border-l-4 border-orange-600">
        <div class="card-body">
          <h2 class="card-title">⛽ Materiales y Servicios </h2>
          <p>Administra materiales, mano de obra y servicios de terceros en un solo lugar.</p>
          <div class="card-actions justify-end mt-4">
            <button @click="router.push('/catalogos')" class="btn btn-sm btn-warning">Gestionar Catálogos</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>