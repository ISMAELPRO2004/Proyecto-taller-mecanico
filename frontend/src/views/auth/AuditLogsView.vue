<script setup>
import { ref, onMounted } from 'vue';
import api from '../../api/axios.js';

const logs = ref([]);

const fetchLogs = async () => {
  try {
    const { data } = await api.get('/usuarios/logs');
    logs.value = data;
  } catch (error) {
    console.error("No se pudieron cargar los logs");
  }
};

onMounted(fetchLogs);
</script>

<template>
  <div class="p-8">
    <h2 class="text-2xl font-bold mb-6">Historial de Acciones (Auditoría)</h2>
    <div class="overflow-x-auto bg-base-100 rounded-box shadow-xl">
      <table class="table table-zebra w-full">
        <thead>
          <tr class="bg-red-600 text-white">
            <th>Fecha</th>
            <th>Usuario</th>
            <th>Acción</th>
            <th>Rol</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in logs" :key="log.id">
            <td>{{ new Date(log.fecha).toLocaleString() }}</td>
            <td class="font-bold">{{ log.usuario.username }}</td>
            <td>{{ log.accion }}</td>
            <td><div class="badge badge-outline">{{ log.usuario.rol }}</div></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>