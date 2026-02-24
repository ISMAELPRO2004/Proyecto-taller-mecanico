<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../../api/axios.js';
import { useRouter } from 'vue-router';

const router = useRouter();
const catalogo = ref([]); 
const usuarios = ref([]); 
const catServicios = ref([]);
const catTerceros = ref([]);

const form = ref({
  numeroOrden: '',
  clienteNombre: '',
  clienteCelular: '',
  trabajoSolicitado: '',
  placa: '',
  marca: '',
  modelo: '',
  horometro: 0,
  kilometraje: 0,
  responsableId: '',
  materiales: [], 
  servicios: [],   
  terceros: []     
});

onMounted(async () => {
  try {
    const [resMat, resUser, resServ, resTer] = await Promise.all([
      api.get('/inventario'),
      api.get('/usuarios'),
      api.get('/servicios'),
      api.get('/terceros')
    ]);

    catalogo.value = resMat.data;
    usuarios.value = resUser.data.filter(u => ['ADMIN', 'RESPONSABLE'].includes(u.rol));
    catServicios.value = resServ.data;
    catTerceros.value = resTer.data;
  } catch (e) {
    console.error("Error cargando datos iniciales:", e);
  }
});

// --- Lógica de Vehículo ---
const buscarVehiculo = async () => {
  if (form.value.placa.length < 3) return;
  try {
    const { data } = await api.get(`/vehiculos/${form.value.placa}`);
    form.value.marca = data.marca;
    form.value.modelo = data.modelo;
    form.value.horometro = data.horometro;
    form.value.kilometraje = data.kilometraje;
  } catch (error) {
    console.log("Vehículo nuevo detectado");
  }
};

// --- Funciones Dinámicas ---
const agregarMaterial = (mat) => {
  form.value.materiales.push({ 
    id: mat.id, 
    descripcion: mat.descripcion, 
    cantidad: 1, 
    precioAlMomento: mat.precioBase 
  });
};

const agregarServicio = () => form.value.servicios.push({ descripcion: '', monto: 0 });
const agregarTercero = () => form.value.terceros.push({ descripcion: '', monto: 0 });
const eliminarFila = (lista, index) => form.value[lista].splice(index, 1);

// --- Cálculos ---
const subtotalMateriales = computed(() => 
  form.value.materiales.reduce((acc, m) => acc + (m.cantidad * m.precioAlMomento), 0)
);

const subtotalServicios = computed(() => 
  form.value.servicios.reduce((acc, s) => acc + parseFloat(s.monto || 0), 0)
);

const subtotalTerceros = computed(() => 
  form.value.terceros.reduce((acc, t) => acc + parseFloat(t.monto || 0), 0)
);

const totalGeneral = computed(() => 
  subtotalMateriales.value + subtotalServicios.value + subtotalTerceros.value
);

const enviarOrden = async () => {
  try {
    await api.post('/ordenes', form.value);
    alert('Orden registrada con éxito');
    router.push('/home');
  } catch (error) {
    alert('Error al guardar: ' + error.response?.data?.message);
  }
};
</script>

<template>
  <div class="p-4 md:p-8 bg-base-200 min-h-screen">
    <div class="max-w-5xl mx-auto bg-base-100 shadow-2xl rounded-xl border-t-8 border-red-600">
      <div class="p-6">
        <h1 class="text-3xl font-black text-gray-800 mb-6 flex items-center gap-2">
          <span class="text-red-600">LYER</span> - NUEVA ORDEN DE TRABAJO
        </h1>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-gray-50 p-4 rounded-lg">
          <div class="form-control">
            <label class="label font-bold text-gray-700">N° de Orden</label>
            <input v-model="form.numeroOrden" type="text" class="input input-bordered border-red-200" placeholder="Ej: OT-123" />
          </div>
          <div class="form-control">
            <label class="label font-bold text-gray-700">Cliente</label>
            <input v-model="form.clienteNombre" type="text" class="input input-bordered" placeholder="Nombre completo" />
          </div>
          <div class="form-control">
            <label class="label font-bold text-gray-700">Celular</label>
            <input v-model="form.clienteCelular" type="text" class="input input-bordered" placeholder="999 999 999" />
          </div>
        </div>

        <div class="form-control mb-8 bg-white p-4 rounded-lg border border-gray-200">
          <label class="label"><span class="label-text font-bold text-gray-700">Trabajo Solicitado / Diagnóstico Inicial</span></label>
            <textarea 
              v-model="form.trabajoSolicitado" 
              class="textarea textarea-bordered h-24 focus:border-red-500" 
              placeholder="Describa el problema o el servicio pedido por el cliente..."
            ></textarea>
        </div>

        <div class="bg-red-50 p-4 rounded-lg mb-8 border border-red-100">
          <h3 class="font-bold text-red-800 mb-3 uppercase text-sm">Datos del Vehículo</h3>
          <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            <input v-model="form.placa" @blur="buscarVehiculo" placeholder="PLACA" class="input input-sm input-bordered font-bold uppercase" />
            <input v-model="form.marca" placeholder="MARCA" class="input input-sm input-bordered" />
            <input v-model="form.modelo" placeholder="MODELO" class="input input-sm input-bordered" />
            <input v-model="form.horometro" type="number" placeholder="HORÓMETRO" class="input input-sm input-bordered" />
            <input v-model="form.kilometraje" type="number" placeholder="KILOMETRAJE" class="input input-sm input-bordered" />
          </div>
        </div>

        <div class="mb-8">
          <div class="flex justify-between items-center mb-2">
            <h3 class="font-bold uppercase text-sm text-gray-700">Repuestos y Materiales</h3>
            <div class="dropdown dropdown-end">
              <label tabindex="0" class="btn btn-xs btn-outline btn-primary">+ Agregar del Catálogo</label>
              <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-64 z-50">
                <li v-for="m in catalogo" :key="m.id">
                  <a @click="agregarMaterial(m)">{{ m.descripcion }} (S/{{ m.precioBase }})</a>
                </li>
              </ul>
            </div>
          </div>
          <table class="table table-compact w-full border">
            <thead class="bg-gray-100">
              <tr><th>Cant.</th><th>Descripción</th><th>Precio</th><th>Subtotal</th><th></th></tr>
            </thead>
            <tbody>
              <tr v-for="(m, i) in form.materiales" :key="i">
                <td><input v-model="m.cantidad" type="number" class="input input-xs w-16 border" /></td>
                <td class="text-xs">{{ m.descripcion }}</td>
                <td>S/ {{ m.precioAlMomento }}</td>
                <td class="font-bold">S/ {{ (m.cantidad * m.precioAlMomento).toFixed(2) }}</td>
                <td><button @click="eliminarFila('materiales', i)" class="text-red-600 font-bold text-lg">✕</button></td>
              </tr>
            </tbody>
          </table>
          <div class="text-right mt-2 text-sm font-bold text-gray-500">Subtotal Materiales: S/ {{ subtotalMateriales.toFixed(2) }}</div>
        </div>

        <div class="mb-8">
          <div class="flex justify-between items-center mb-2">
            <h3 class="font-bold uppercase text-sm text-gray-700">Mano de Obra (Servicio)</h3>
            <button @click="agregarServicio" class="btn btn-xs btn-outline">+ Agregar Fila</button>
          </div>
          <table class="table table-compact w-full border">
            <thead><tr class="bg-gray-100"><th>Descripción del Trabajo</th><th class="w-32">Monto</th><th class="w-10"></th></tr></thead>
            <tbody>
              <tr v-for="(s, i) in form.servicios" :key="i">
                <td><input v-model="s.descripcion" placeholder="Descripción del trabajo..." class="input input-xs w-full input-ghost" /></td>
                <td><input v-model="s.monto" type="number" class="input input-xs w-full border" /></td>
                <td><button @click="eliminarFila('servicios', i)" class="text-red-600 font-bold text-lg">✕</button></td>
              </tr>
            </tbody>
          </table>
          <div class="text-right mt-2 text-sm font-bold text-gray-500">Subtotal Servicios: S/ {{ subtotalServicios.toFixed(2) }}</div>
        </div>

        <div class="mb-8">
          <div class="flex justify-between items-center mb-2">
            <h3 class="font-bold uppercase text-sm text-gray-700">Trabajos Terceros</h3>
            <button @click="agregarTercero" class="btn btn-xs btn-outline">+ Agregar Tercero</button>
          </div>
          <table class="table table-compact w-full border">
            <thead><tr class="bg-gray-100"><th>Descripción del Servicio Externo</th><th class="w-32">Monto</th><th class="w-10"></th></tr></thead>
            <tbody>
              <tr v-for="(t, i) in form.terceros" :key="i">
                <td><input v-model="t.descripcion" placeholder="Ej: Soldadura de tolva..." class="input input-xs w-full input-ghost" /></td>
                <td><input v-model="t.monto" type="number" class="input input-xs w-full border" /></td>
                <td><button @click="eliminarFila('terceros', i)" class="text-red-600 font-bold text-lg">✕</button></td>
              </tr>
            </tbody>
          </table>
          <div class="text-right mt-2 text-sm font-bold text-gray-500">Subtotal Terceros: S/ {{ subtotalTerceros.toFixed(2) }}</div>
        </div>

        <div class="mt-10 p-6 bg-gray-800 text-white rounded-xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div class="flex flex-col">
            <span class="text-xs uppercase opacity-70 mb-1">Responsable de Orden</span>
            <select v-model="form.responsableId" class="select select-sm select-bordered bg-gray-700 text-white border-none w-64">
              <option value="">Seleccione al responsable...</option>
              <option v-for="u in usuarios" :key="u.id" :value="u.id">{{ u.nombreCompleto || u.username }}</option>
            </select>
          </div>
          <div class="text-center md:text-right">
            <p class="text-sm opacity-70 uppercase tracking-widest">Total General</p>
            <h2 class="text-5xl font-black text-red-500">S/ {{ totalGeneral.toFixed(2) }}</h2>
          </div>
          <button @click="enviarOrden" class="btn btn-lg bg-red-600 border-none hover:bg-red-700 px-12 text-white shadow-lg">
            REGISTRAR ORDEN
          </button>
        </div>
      </div>
    </div>
  </div>
</template>