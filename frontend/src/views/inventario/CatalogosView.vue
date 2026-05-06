<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { catalogoService, endpoints } from '../../services/catalogoService.js';
import { notify } from '../../utils/alerts.js';
import {
  Package, Wrench, Truck, Search, Plus,
  Edit3, Trash2, ListOrdered, ChevronLeft,
  ChevronRight, RefreshCcw, Layers, X
} from 'lucide-vue-next';

// --- ESTADOS ---
const tabActiva = ref('materiales'); // materiales | servicios | terceros
const lista = ref([]);
const loading = ref(false);
const busqueda = ref('');

// --- PAGINACIÓN ---
const paginaActual = ref(1);
const itemsPorPagina = ref(10);
const opcionesItems = [5, 10, 20];

// --- MODAL ---
const modalOpen = ref(false);
const editando = ref(false);
const form = ref({ id: null, descripcion: '', precioBase: 0 });

const cargarDatos = async () => {
  loading.value = true;
  try {
    const data = await catalogoService[
      tabActiva.value === 'materiales' ? 'listarMateriales' :
      tabActiva.value === 'servicios' ? 'listarServicios' : 'listarTerceros'
    ]();
    lista.value = Array.isArray(data) ? data : [];
  } catch (e) {
    notify.error("Error", "No se pudieron sincronizar los datos");
  } finally {
    loading.value = false;
  }
};

// --- LÓGICA DE FILTRADO Y PAGINACIÓN ---
const listaFiltrada = computed(() => {
  return lista.value.filter(item =>
    item.descripcion.toLowerCase().includes(busqueda.value.toLowerCase())
  );
});

const totalPaginas = computed(() => Math.ceil(listaFiltrada.value.length / itemsPorPagina.value) || 1);

const listaPaginada = computed(() => {
  const inicio = (paginaActual.value - 1) * itemsPorPagina.value;
  return listaFiltrada.value.slice(inicio, inicio + itemsPorPagina.value);
});

const filasVacias = computed(() => {
  const faltantes = itemsPorPagina.value - listaPaginada.value.length;
  return faltantes > 0 ? faltantes : 0;
});

const nombreTabActiva = computed(() => {
  const nombres = {
    materiales: 'Material',
    servicios: 'Servicio',
    terceros: 'Tercero'
  };
  return nombres[tabActiva.value] || '';
});

// Watchers para resetear página
watch([tabActiva, busqueda, itemsPorPagina], () => {
  paginaActual.value = 1;
});

// --- ACCIONES CRUD ---
const guardar = async () => {
  if (!form.value.descripcion || form.value.precioBase <= 0) {
    return notify.error("Campos incompletos", "Por favor revisa la descripción y el precio.");
  }
  try {
    if (editando.value) {
      await catalogoService.actualizar(endpoints[tabActiva.value], form.value.id, form.value);
      notify.success("Actualizado", "El ítem se actualizó correctamente.");
    } else {
      await catalogoService.crear(endpoints[tabActiva.value], form.value);
      notify.success("Registrado", "Nuevo ítem añadido al catálogo.");
    }
    cerrarModal();
    cargarDatos();
  } catch (e) { notify.error("Error al guardar"); }
};

const eliminar = async (id) => {
  const confirmado = await notify.confirm("¿Eliminar ítem?", "Si este ítem está en uso en órdenes antiguas, no podrá eliminarse.");
  if (!confirmado) return;
  try {
    await catalogoService.eliminar(endpoints[tabActiva.value], id);
    notify.success("Eliminado", "Ítem removido del catálogo.");
    cargarDatos();
  } catch (e) { notify.error("Error", "No se puede eliminar: el ítem está vinculado a órdenes existentes."); }
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
  <div class="space-y-6 animate-fade-in">
    <!-- Encabezado con botones full-width en móvil -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-1">
      <div class="flex items-center gap-3">
        <div class="bg-lyer-green p-3 rounded-2xl text-white shadow-lg">
          <Layers class="w-6 h-6" />
        </div>
        <div>
          <h2 class="text-xl md:text-2xl font-black text-slate-800 uppercase">Catálogos</h2>
          <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Precios Maestros</p>
        </div>
      </div>
      <button @click="abrirModal()"
        class="btn btn-sm md:btn-md bg-lyer-green text-white border-none rounded-xl w-full md:w-auto">
        <Plus class="w-4 h-4 mr-1" /> Nuevo {{ nombreTabActiva }}
      </button>
    </div>

    <div class="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
      <div class="flex flex-col lg:flex-row justify-between items-center gap-4">
        <div class="w-full lg:w-auto overflow-x-auto custom-scroll-sm pb-1">
          <div class="tabs tabs-boxed bg-slate-100 p-1 flex flex-nowrap min-w-max">
            <button v-for="(label, key) in { materiales: 'Repuestos', servicios: 'Servicios', terceros: 'Terceros' }"
              :key="key" @click="tabActiva = key; cargarDatos()" :class="['tab tab-md md:tab-lg px-6 font-bold transition-all whitespace-nowrap',
                tabActiva === key ? 'bg-white text-lyer-green shadow-sm' : 'text-slate-400']">
              {{ label }}
            </button>
          </div>
        </div>
        <!-- Buscador -->
        <div class="relative w-full lg:w-96">
          <input v-model="busqueda" type="text" placeholder="Buscar..."
            class="input input-bordered w-full bg-slate-50 border-slate-100 rounded-xl text-sm" />
        </div>
      </div>

      <div class="rounded-2xl border border-slate-100 overflow-hidden">
        <table class="table w-full border-separate border-spacing-0">
          <thead class="bg-slate-50/50 text-slate-400 uppercase text-[9px] font-black tracking-[0.2em] border-b">
            <tr>
              <th class="py-5 pl-8">Descripción del Ítem</th>
              <th class="w-48 text-right">Precio Base</th>
              <th class="text-center w-40 pr-8">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-slate-600">
            <tr v-for="item in listaPaginada" :key="item.id" class="hover:bg-emerald-50/30 transition-colors h-[70px]">
              <td class="pl-8">
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-slate-100 rounded-lg group-hover:bg-white transition-colors">
                    <Package v-if="tabActiva === 'materiales'" class="w-4 h-4 text-slate-400" />
                    <Wrench v-else-if="tabActiva === 'servicios'" class="w-4 h-4 text-slate-400" />
                    <Truck v-else class="w-4 h-4 text-slate-400" />
                  </div>
                  <span class="font-bold text-slate-700 capitalize">{{ item.descripcion }}</span>
                </div>
              </td>
              <td class="text-right font-black text-lyer-green text-lg">
                <span class="text-[10px] font-medium text-slate-400 mr-1">S/</span>{{
                  parseFloat(item.precioBase).toFixed(2) }}
              </td>
              <td class="text-center pr-8">
                <div class="flex justify-center gap-2">
                  <button @click="abrirModal(item)"
                    class="btn btn-square btn-ghost btn-sm text-lyer-green hover:bg-lyer-green hover:text-white rounded-lg transition-all">
                    <Edit3 class="w-4 h-4" />
                  </button>
                  <button @click="eliminar(item.id)"
                    class="btn btn-square btn-ghost btn-sm text-slate-300 hover:text-red-500 rounded-lg">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-for="n in filasVacias" :key="'ghost-' + n" class="h-[70px] opacity-0 pointer-events-none">
              <td colspan="3"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-50">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
            <ListOrdered class="w-4 h-4" /> Mostrar:
            <select v-model="itemsPorPagina"
              class="select select-ghost select-xs font-black text-lyer-green focus:bg-transparent">
              <option v-for="opt in opcionesItems" :key="opt" :value="opt">{{ opt }} filas</option>
            </select>
          </div>
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Total: {{ listaFiltrada.length }} Registros
          </span>
        </div>

        <div class="join shadow-sm border border-slate-200 bg-white rounded-xl overflow-hidden">
          <button @click="paginaActual--" :disabled="paginaActual === 1"
            class="join-item btn btn-sm bg-white border-none disabled:text-slate-200">
            <ChevronLeft class="w-4 h-4" />
          </button>
          <button v-for="p in totalPaginas" :key="p" @click="paginaActual = p"
            :class="['join-item btn btn-sm border-none font-black px-4', paginaActual === p ? 'bg-lyer-green text-white' : 'bg-white text-slate-400']">
            {{ p }}
          </button>
          <button @click="paginaActual++" :disabled="paginaActual === totalPaginas"
            class="join-item btn btn-sm bg-white border-none disabled:text-slate-200">
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <div :class="['modal modal-bottom sm:modal-middle', { 'modal-open': modalOpen }]">
      <div class="modal-box p-0 overflow-hidden border-t-8 border-lyer-green rounded-3xl shadow-2xl">
        <div class="p-6 bg-slate-50 border-b flex justify-between items-center">
          <h3 class="font-black text-lg text-slate-800 uppercase italic">
            {{ editando ? 'Editar' : 'Nuevo' }} {{ nombreTabActiva.toLowerCase() }}
          </h3>
          <button @click="cerrarModal" class="btn btn-circle btn-ghost btn-sm text-slate-400">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="p-8 space-y-6">
          <div class="form-control">
            <label class="label"><span class="label-text font-black text-slate-400 uppercase text-[10px]">Descripción
                del Ítem</span></label>
            <input v-model="form.descripcion" type="text" placeholder="Ej: Aceite de Motor 15W40"
              class="input input-bordered w-full bg-slate-50 border-slate-200 focus:border-lyer-accent rounded-xl font-bold" />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text font-black text-slate-400 uppercase text-[10px]">Precio
                Sugerido (S/)</span></label>
            <div class="relative">
              <input v-model="form.precioBase" type="number" step="0.01"
                class="input input-bordered w-full bg-slate-50 border-slate-200 focus:border-lyer-accent rounded-xl font-black" />
            </div>
            <label class="label"><span class="label-text-alt opacity-50 italic">Este precio aparecerá por defecto en las
                nuevas órdenes.</span></label>
          </div>
        </div>

        <div class="p-6 bg-slate-50 border-t flex justify-end gap-3">
          <button @click="cerrarModal" class="btn btn-ghost font-bold text-slate-400">Cancelar</button>
          <button @click="guardar"
            class="btn bg-lyer-green text-white border-none px-8 rounded-xl shadow-lg hover:bg-emerald-900 transition-all">
            {{ editando ? 'Guardar Cambios' : 'Registrar Ítem' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>