<script setup>
import { ref, onMounted } from 'vue';
import api from '../../api/axios.js';
import { useAuthStore } from '../../stores/auth.js';

const materiales = ref([]);
const auth = useAuthStore();

// Estados para Edición
const materialSeleccionado = ref(null);
const nuevoPrecio = ref(0);

// Estados para Nuevo Registro
const formNuevo = ref({ descripcion: '', precioBase: 0 });

const fetchMateriales = async () => {
  try {
    const { data } = await api.get('/inventario');
    materiales.value = data;
  } catch (error) {
    console.error("Error al cargar materiales");
  }
};

// --- Lógica para Editar Precio ---
const abrirModalPrecio = (m) => {
  materialSeleccionado.value = m;
  nuevoPrecio.value = m.precioBase;
  document.getElementById('modal_editar_precio').showModal();
};

const guardarEdicionPrecio = async () => {
  try {
    await api.put(`/inventario/${materialSeleccionado.value.id}`, { precioBase: nuevoPrecio.value });
    await fetchMateriales();
    document.getElementById('modal_editar_precio').close();
  } catch (error) {
    alert("Error al actualizar el precio");
  }
};

// --- Lógica para Registrar Nuevo Material ---
const abrirModalNuevo = () => {
  formNuevo.value = { descripcion: '', precioBase: 0 };
  document.getElementById('modal_nuevo_material').showModal();
};

const guardarNuevoMaterial = async () => {
  try {
    await api.post('/inventario', formNuevo.value);
    await fetchMateriales();
    document.getElementById('modal_nuevo_material').close();
  } catch (error) {
    alert("Error al registrar el material. Verifique que los datos sean correctos.");
  }
};

onMounted(fetchMateriales);
</script>

<template>
  <div class="p-8">
    <div class="flex justify-between items-center mb-8">
      <h2 class="text-2xl font-bold border-b-4 border-red-600">Gestión de Inventario</h2>
      <button 
        v-if="auth.usuario?.rol === 'ADMIN'" 
        @click="abrirModalNuevo"
        class="btn btn-md bg-red-600 text-white border-none hover:bg-red-700 shadow-md"
      >
        + Registrar Nuevo Material
      </button>
    </div>

    <div class="overflow-x-auto shadow-2xl rounded-xl">
      <table class="table table-zebra w-full bg-base-100">
        <thead class="bg-gray-800 text-white text-sm">
          <tr>
            <th>Descripción del Insumo</th>
            <th>Precio Base (S/)</th>
            <th>Última Actualización</th>
            <th v-if="auth.usuario?.rol === 'ADMIN'" class="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in materiales" :key="m.id" class="hover">
            <td class="font-semibold text-gray-700">{{ m.descripcion }}</td>
            <td class="text-green-700 font-bold">S/ {{ parseFloat(m.precioBase).toFixed(2) }}</td>
            <td class="text-gray-500">{{ new Date(m.actualizadoAt).toLocaleDateString() }}</td>
            <td v-if="auth.usuario?.rol === 'ADMIN'" class="text-center">
              <button @click="abrirModalPrecio(m)" class="btn btn-xs btn-outline btn-error">Editar Precio</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <dialog id="modal_nuevo_material" class="modal">
      <div class="modal-box border-t-8 border-red-600">
        <h3 class="font-bold text-xl mb-4">Añadir al Catálogo</h3>
        <div class="space-y-4">
          <div class="form-control">
            <label class="label"><span class="label-text font-bold">Descripción</span></label>
            <input v-model="formNuevo.descripcion" type="text" placeholder="Ej: Filtro de aire Volvo FM" class="input input-bordered w-full" />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text font-bold">Precio Inicial (S/)</span></label>
            <input v-model="formNuevo.precioBase" type="number" step="0.01" class="input input-bordered w-full" />
          </div>
        </div>
        <div class="modal-action">
          <button @click="guardarNuevoMaterial" class="btn bg-red-600 text-white border-none hover:bg-red-800">Guardar Material</button>
          <form method="dialog"><button class="btn btn-ghost">Cancelar</button></form>
        </div>
      </div>
    </dialog>

    <dialog id="modal_editar_precio" class="modal">
      <div class="modal-box border-t-8 border-blue-600">
        <h3 class="font-bold text-xl mb-4">Actualizar Precio</h3>
        <p class="text-sm text-gray-600 mb-4">Modificando: <span class="font-bold">{{ materialSeleccionado?.descripcion }}</span></p>
        <div class="form-control">
          <label class="label"><span class="label-text font-bold">Nuevo Precio (S/)</span></label>
          <input v-model="nuevoPrecio" type="number" step="0.01" class="input input-bordered w-full" />
        </div>
        <div class="modal-action">
          <button @click="guardarEdicionPrecio" class="btn btn-info text-white border-none">Actualizar</button>
          <form method="dialog"><button class="btn btn-ghost">Cancelar</button></form>
        </div>
      </div>
    </dialog>
  </div>
</template>