<script setup>
import { ref, onMounted } from 'vue';
import api from '../api/axios.js';
import { notify } from '../utils/alerts.js';

const tabActiva = ref('materiales'); // materiales | servicios | terceros
const lista = ref([]);
const loading = ref(false);

// Estado para Modales
const modalOpen = ref(false);
const editando = ref(false);
const form = ref({ id: null, descripcion: '', precioBase: 0 });

const endpoints = {
  materiales: '/inventario',
  servicios: '/servicios',
  terceros: '/terceros'
};

const cargarDatos = async () => {
  loading.ref = true;
  try {
    const { data } = await api.get(endpoints[tabActiva.value]);
    lista.value = data;
  } catch (e) { console.error("Error al cargar"); }
  finally { loading.ref = false; }
};

const guardar = async () => {
  try {
    if (editando.value) {
      await api.put(`${endpoints[tabActiva.value]}/${form.value.id}`, form.value);
    } else {
      await api.post(endpoints[tabActiva.value], form.value);
    }
    cerrarModal();
    cargarDatos();
  } catch (e) { notify.error("Error al guardar"); }
};

const eliminar = async (id) => {
  if (!await notify.confirm("¿Estás seguro de eliminar este ítem?")) return;
  try {
    await api.delete(`${endpoints[tabActiva.value]}/${id}`);
    cargarDatos();
  } catch (e) { notify.error("No se puede eliminar: está en uso en una orden."); }
};

const abrirModal = (item = null) => {
  if (item) {
    editando.value = true;
    form.value = { ...item };
  } else {
    editando.value = false;
    form.value = { id: null, descripcion: '', precioBase: 0 };
  }
  modalOpen.value = true;
};

const cerrarModal = () => { modalOpen.value = false; };

onMounted(cargarDatos);
</script>

<template>
  <div class="p-8">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-slate-800">Administración de Catálogos</h2>
      <button @click="abrirModal()" class="btn bg-red-600 border-none text-white hover:bg-red-700">
        + Nuevo {{ tabActiva.slice(0, -1) }}
      </button>
    </div>

    <div class="tabs tabs-lifted mb-6">
      <button v-for="t in ['materiales', 'servicios', 'terceros']" :key="t"
        @click="tabActiva = t; cargarDatos()"
        :class="['tab tab-lg uppercase font-bold', tabActiva === t ? 'tab-active [--tab-bg:white] text-red-600' : 'text-slate-400']">
        {{ t }}
      </button>
    </div>

    <div class="bg-white rounded-b-xl shadow-xl overflow-hidden border border-slate-200">
      <table class="table w-full">
        <thead class="bg-slate-50">
          <tr>
            <th class="text-slate-600">Descripción</th>
            <th class="text-slate-600">Precio Base (S/)</th>
            <th class="text-slate-600 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in lista" :key="item.id" class="hover:bg-slate-50">
            <td class="font-medium text-slate-700">{{ item.descripcion }}</td>
            <td class="text-green-700 font-bold">S/ {{ parseFloat(item.precioBase).toFixed(2) }}</td>
            <td class="flex justify-center gap-2">
              <button @click="abrirModal(item)" class="btn btn-square btn-ghost btn-sm text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </button>
              <button @click="eliminar(item.id)" class="btn btn-square btn-ghost btn-sm text-red-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div :class="['modal', { 'modal-open': modalOpen }]">
      <div class="modal-box border-t-4 border-red-600">
        <h3 class="font-bold text-lg mb-4">{{ editando ? 'Editar' : 'Nuevo' }} {{ tabActiva }}</h3>
        <div class="form-control w-full">
          <label class="label"><span class="label-text font-bold">Descripción</span></label>
          <input v-model="form.descripcion" type="text" class="input input-bordered w-full" />
        </div>
        <div class="form-control w-full mt-4">
          <label class="label"><span class="label-text font-bold">Precio Base (S/)</span></label>
          <input v-model="form.precioBase" type="number" step="0.01" class="input input-bordered w-full" />
        </div>
        <div class="modal-action">
          <button @click="guardar" class="btn bg-red-600 text-white border-none">Guardar</button>
          <button @click="cerrarModal" class="btn btn-ghost">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>