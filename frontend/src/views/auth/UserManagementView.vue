<script setup>
import { ref } from 'vue';
import api from '../../api/axios.js';

const form = ref({ 
  username: '', 
  password: '', 
  nombreCompleto: '', 
  rol: 'RESPONSABLE' 
});

const mensaje = ref({ texto: '', tipo: '' });

const registrar = async () => {
  try {
    // Los roles disponibles son ADMIN, RESPONSABLE y USUARIO_GENERAL
    await api.post('/usuarios', form.value);
    mensaje.value = { 
      texto: 'Usuario creado exitosamente. La acción ha sido registrada en auditoría.', 
      tipo: 'alert-success' 
    };
    // Limpiar el formulario tras el éxito
    form.value = { username: '', password: '', nombreCompleto: '', rol: 'RESPONSABLE' };
  } catch (error) {
    mensaje.value = { 
      texto: error.response?.data?.message || 'Error al crear el usuario', 
      tipo: 'alert-error' 
    };
  }
};
</script>

<template>
  <div class="p-8 max-w-2xl mx-auto">
    <div v-if="mensaje.texto" :class="['alert mb-6 shadow-lg', mensaje.tipo]">
      <span>{{ mensaje.texto }}</span>
    </div>

    <div class="card bg-base-100 shadow-xl border-t-4 border-red-600">
      <div class="card-body">
        <h2 class="card-title text-2xl mb-4 text-gray-800">Registrar Personal del Taller</h2>
        <form @submit.prevent="registrar" class="space-y-4">
          
          <div class="form-control">
            <label class="label"><span class="label-text font-semibold">Nombre Completo</span></label>
            <input v-model="form.nombreCompleto" type="text" placeholder="Ej: Juan Pérez" class="input input-bordered focus:border-red-600" required />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label"><span class="label-text font-semibold">Usuario (Login)</span></label>
              <input v-model="form.username" type="text" placeholder="mecanico_01" class="input input-bordered focus:border-red-600" required />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text font-semibold">Contraseña</span></label>
              <input v-model="form.password" type="password" placeholder="••••••••" class="input input-bordered focus:border-red-600" required />
            </div>
          </div>

          <div class="form-control">
            <label class="label"><span class="label-text font-semibold">Rol Asignado</span></label>
            <select v-model="form.rol" class="select select-bordered w-full focus:border-red-600">
              <option value="RESPONSABLE">Responsable (Gestión de Órdenes)</option>
              <option value="USUARIO_GENERAL">Usuario General (Apoyo)</option>
              <option value="ADMIN">Administrador (Control Total)</option>
            </select>
            <label class="label">
              <span class="label-text-alt text-gray-500">El rol determina los permisos sobre las órdenes de trabajo.</span>
            </label>
          </div>

          <div class="card-actions mt-6">
            <button class="btn btn-primary w-full bg-red-600 hover:bg-red-700 border-none text-white">
              Guardar Usuario
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>