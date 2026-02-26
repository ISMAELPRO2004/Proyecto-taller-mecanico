<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../../api/axios.js';
import { useRouter } from 'vue-router';
import { notify } from '../../utils/alerts.js';

const router = useRouter();

// Listas de catálogos cargadas desde el backend
const catMateriales = ref([]);
const catServicios = ref([]);
const catTerceros = ref([]);
const usuarios = ref([]);

const form = ref({
  clienteNombre: '',
  clienteCelular: '',
  trabajoSolicitado: '',
  placa: '',
  marca: '',
  modelo: '',
  horometro: 0,
  kilometraje: 0,
  responsableId: '',
  materiales: [], // { materialId, descripcion, cantidad, precioAlMomento }
  servicios: [],   // { servicioId, descripcion, monto }
  terceros: []     // { terceroId, descripcion, monto }
});

onMounted(async () => {
  try {
    const [resMat, resUser, resServ, resTerc] = await Promise.all([
      api.get('/inventario'),
      api.get('/usuarios'),
      api.get('/servicios'),
      api.get('/terceros')
    ]);
    catMateriales.value = resMat.data;
    usuarios.value = resUser.data.filter(u => ['ADMIN', 'RESPONSABLE'].includes(u.rol));
    catServicios.value = resServ.data;
    catTerceros.value = resTerc.data;
  } catch (e) {
    console.error("Error al sincronizar catálogos:", e);
  }
});

// --- Lógica de Búsqueda de Vehículo ---
const buscarVehiculo = async () => {
  if (form.value.placa.length < 3) return;
  try {
    const { data } = await api.get(`/vehiculos/${form.value.placa}`);
    form.value.marca = data.marca;
    form.value.modelo = data.modelo;
    form.value.horometro = data.horometro;
    form.value.kilometraje = data.kilometraje;
  } catch (e) { console.log("Vehículo nuevo"); }
};

// --- Funciones para Agregar desde Catálogos Maestros ---
const agregarMaterial = (m) => {
  form.value.materiales.push({ 
    materialId: m.id, 
    descripcion: m.descripcion, 
    cantidad: 1, 
    precioAlMomento: m.precioBase 
  });
};

const agregarServicio = (s) => {
  form.value.servicios.push({ 
    servicioId: s.id, 
    descripcion: s.descripcion, 
    monto: s.precioBase 
  });
};

const agregarTercero = (t) => {
  form.value.terceros.push({ 
    terceroId: t.id, 
    descripcion: t.descripcion, 
    monto: t.precioBase 
  });
};

const eliminarFila = (lista, index) => form.value[lista].splice(index, 1);

// --- Cálculos en Tiempo Real ---
const total = computed(() => {
  const m = form.value.materiales.reduce((acc, i) => acc + (i.cantidad * i.precioAlMomento), 0);
  const s = form.value.servicios.reduce((acc, i) => acc + parseFloat(i.monto), 0);
  const t = form.value.terceros.reduce((acc, i) => acc + parseFloat(i.monto), 0);
  return m + s + t;
});

const registrarOrden = async () => {
  try {
    await api.post('/ordenes', form.value);
    await notify.success('¡Orden Creada!', `La OT para ${form.value.clienteNombre} se guardó con éxito.`);;
    router.push('/home');
  } catch (e) {
    notify.error('Error al guardar', e.response?.data?.message || 'Hubo un problema técnico.');
  }
};
</script>

<template>
  <div class="p-4 md:p-8 bg-slate-100 min-h-screen text-slate-800">
    <div class="max-w-6xl mx-auto bg-white shadow-2xl rounded-xl border-t-8 border-red-600 p-6">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-black italic"><span class="text-red-600">LYER</span> - NUEVA ORDEN</h1>
        <div class="text-right">
          <p class="text-xs font-bold text-slate-400">FECHA DE REGISTRO</p>
          <p class="font-mono">{{ new Date().toLocaleDateString() }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div class="space-y-4">
          <h3 class="font-bold border-b-2 border-red-600 inline-block pr-4">DATOS DEL CLIENTE</h3>
          <input v-model="form.clienteNombre" placeholder="Nombre completo del cliente" class="input input-bordered w-full" />
          <input v-model="form.clienteCelular" placeholder="Celular" class="input input-bordered w-full" />
          <textarea v-model="form.trabajoSolicitado" placeholder="Diagnóstico inicial / Trabajo solicitado" class="textarea textarea-bordered w-full h-24"></textarea>
        </div>
        <div class="bg-red-50 p-6 rounded-xl border border-red-100 space-y-4">
          <h3 class="font-bold text-red-700">DATOS DEL VEHÍCULO</h3>
          <div class="grid grid-cols-2 gap-4">
            <input v-model="form.placa" @blur="buscarVehiculo" placeholder="PLACA" class="input input-sm input-bordered font-bold uppercase" />
            <input v-model="form.marca" placeholder="MARCA" class="input input-sm input-bordered" />
            <input v-model="form.modelo" placeholder="MODELO" class="input input-sm input-bordered" />
            <input v-model="form.horometro" type="number" placeholder="HORÓMETRO" class="input input-sm input-bordered" />
            <input v-model="form.kilometraje" type="number" placeholder="KILOMETRAJE" class="input input-sm input-bordered col-span-2" />
          </div>
        </div>
      </div>

      <div class="space-y-8">
        <div class="overflow-x-auto">
          <div class="flex justify-between items-center mb-2">
            <h4 class="font-bold text-sm uppercase">1. Repuestos y Materiales</h4>
            <div class="dropdown dropdown-end">
              <label tabindex="0" class="btn btn-xs bg-red-600 text-white border-none">+ Catálogo</label>
              <ul tabindex="0" class="dropdown-content menu p-2 shadow-xl bg-base-100 rounded-box w-64 z-50 border">
                <li v-for="m in catMateriales" :key="m.id"><a @click="agregarMaterial(m)">{{ m.descripcion }} (S/{{ m.precioBase }})</a></li>
              </ul>
            </div>
          </div>
          <table class="table table-compact w-full border">
            <thead class="bg-slate-800 text-white"><tr><th>Cant.</th><th>Descripción</th><th>Unit.</th><th>Subtotal</th><th></th></tr></thead>
            <tbody>
              <tr v-for="(m, i) in form.materiales" :key="i">
                <td class="w-20"><input v-model="m.cantidad" type="number" class="input input-xs w-full border" /></td>
                <td class="text-xs">{{ m.descripcion }}</td>
                <td>S/ {{ m.precioAlMomento }}</td>
                <td class="font-bold">S/ {{ (m.cantidad * m.precioAlMomento).toFixed(2) }}</td>
                <td><button @click="eliminarFila('materiales', i)" class="text-red-600 font-bold">✕</button></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div class="flex justify-between items-center mb-2">
              <h4 class="font-bold text-sm uppercase">2. Mano de Obra</h4>
              <div class="dropdown dropdown-end">
                <label tabindex="0" class="btn btn-xs btn-outline">+ Catálogo</label>
                <ul tabindex="0" class="dropdown-content menu p-2 shadow-xl bg-base-100 rounded-box w-64 z-50 border">
                  <li v-for="s in catServicios" :key="s.id"><a @click="agregarServicio(s)">{{ s.descripcion }} (S/{{ s.precioBase }})</a></li>
                </ul>
              </div>
            </div>
            <table class="table table-compact w-full border">
              <tbody>
                <tr v-for="(s, i) in form.servicios" :key="i">
                  <td class="text-xs">{{ s.descripcion }}</td>
                  <td class="w-24 font-bold text-right">S/ {{ s.monto }}</td>
                  <td class="w-10"><button @click="eliminarFila('servicios', i)" class="text-red-500">✕</button></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <div class="flex justify-between items-center mb-2">
              <h4 class="font-bold text-sm uppercase">3. Trabajos Terceros</h4>
              <div class="dropdown dropdown-end">
                <label tabindex="0" class="btn btn-xs btn-outline">+ Catálogo</label>
                <ul tabindex="0" class="dropdown-content menu p-2 shadow-xl bg-base-100 rounded-box w-64 z-50 border">
                  <li v-for="t in catTerceros" :key="t.id"><a @click="agregarTercero(t)">{{ t.descripcion }} (S/{{ t.precioBase }})</a></li>
                </ul>
              </div>
            </div>
            <table class="table table-compact w-full border">
              <tbody>
                <tr v-for="(t, i) in form.terceros" :key="i">
                  <td class="text-xs">{{ t.descripcion }}</td>
                  <td class="w-24 font-bold text-right">S/ {{ t.monto }}</td>
                  <td class="w-10"><button @click="eliminarFila('terceros', i)" class="text-red-500">✕</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="mt-12 p-8 bg-slate-900 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div class="form-control w-full md:w-64">
          <label class="label"><span class="label-text text-white opacity-60">RESPONSABLE DE ORDEN</span></label>
          <select v-model="form.responsableId" class="select select-bordered bg-slate-800 text-white border-none">
            <option value="">Seleccione...</option>
            <option v-for="u in usuarios" :key="u.id" :value="u.id">{{ u.nombreCompleto || u.username }}</option>
          </select>
        </div>
        <div class="text-center md:text-right">
          <p class="text-white opacity-60 text-sm uppercase tracking-widest">Inversión Total</p>
          <h2 class="text-6xl font-black text-red-500">S/ {{ total.toFixed(2) }}</h2>
        </div>
        <button @click="registrarOrden" class="btn btn-lg bg-red-600 hover:bg-red-700 border-none px-12 text-white shadow-2xl animate-pulse">
          GUARDAR ORDEN
        </button>
      </div>
    </div>
  </div>
</template>