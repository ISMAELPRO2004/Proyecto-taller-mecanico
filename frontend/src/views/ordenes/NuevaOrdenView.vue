<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../../api/axios.js';
import { notify } from '../../utils/alerts.js';
import SelectorCatalogoModal from '../../components/ui/SelectorCatalogoModal.vue'; // Nuevo Componente
import { 
  ArrowLeft, Trash2, User, Car, 
  Package, Wrench, ExternalLink, CheckCircle, ClipboardList
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const esEdicion = computed(() => !!route.params.id);
const cargando = ref(false);
const catalogos = ref({ materiales: [], servicios: [], terceros: [], responsables: [] });

// --- ESTADO DEL MODAL DE SELECCIÓN ---
const modalSeleccion = ref({
  abierto: false,
  tipo: '', // materiales | servicios | terceros
  titulo: '',
  items: []
});

const form = ref({
  clienteNombre: '', clienteCelular: '', trabajoSolicitado: '',
  placa: '', marca: '', modelo: '', horometro: 0, kilometraje: 0,
  responsableId: '', estado: 'EN_REPARACION',
  materiales: [], servicios: [], terceros: []
});

const inicializar = async () => {
  cargando.value = true;
  try {
    const [resMat, resServ, resTerc, resUser] = await Promise.all([
      api.get('/inventario'), api.get('/servicios'), api.get('/terceros'), api.get('/usuarios')
    ]);
    catalogos.value = { 
      materiales: resMat.data, 
      servicios: resServ.data, 
      terceros: resTerc.data,
      responsables: resUser.data 
    };

    if (esEdicion.value) {
      const { data } = await api.get(`/ordenes/${route.params.id}`);
      form.value = {
        ...data,
        materiales: data.materiales.map(m => ({
          materialId: m.materialId,
          descripcion: m.material.descripcion,
          cantidad: m.cantidad,
          precioAlMomento: m.precioAplicado
        }))
      };
    }
  } catch (e) { notify.error("Error", "Sincronización fallida"); }
  finally { cargando.value = false; }
};

// --- LÓGICA DEL SELECTOR ---
const abrirSelector = (tipo) => {
  const titulos = {
    materiales: 'Seleccionar Repuestos',
    servicios: 'Seleccionar Mano de Obra',
    terceros: 'Seleccionar Trabajos Terceros'
  };

  const idsActuales = form.value[tipo].map(i => i.materialId || i.servicioId || i.terceroId);

  modalSeleccion.value = {
    abierto: true,
    tipo,
    titulo: titulos[tipo],
    items: catalogos.value[tipo],
    idsActuales
  };
};

const confirmarSeleccion = (itemsNuevos) => {
  const tipo = modalSeleccion.value.tipo;
  const idKey = tipo === 'materiales' ? 'materialId' : (tipo === 'servicios' ? 'servicioId' : 'terceroId');

  // 1. Eliminar lo que se desmarcó en el modal
  form.value[tipo] = form.value[tipo].filter(existente => 
    itemsNuevos.some(nuevo => nuevo.id === existente[idKey])
  );

  // 2. Añadir solo lo que es realmente nuevo
  itemsNuevos.forEach(itemCatalogo => {
    const yaExiste = form.value[tipo].some(existente => existente[idKey] === itemCatalogo.id);
    
    if (!yaExiste) {
      if (tipo === 'materiales') {
        form.value.materiales.push({ 
          materialId: itemCatalogo.id, 
          descripcion: itemCatalogo.descripcion, 
          cantidad: 1, 
          precioAlMomento: itemCatalogo.precioBase 
        });
      } else {
        form.value[tipo].push({ 
          [idKey]: itemCatalogo.id, 
          descripcion: itemCatalogo.descripcion, 
          monto: itemCatalogo.precioBase 
        });
      }
    }
  });

  modalSeleccion.value.abierto = false;
};

const buscarVehiculo = async () => {
  if (esEdicion.value || form.value.placa.length < 3) return;
  try {
    const { data } = await api.get(`/vehiculos/${form.value.placa}`);
    form.value.marca = data.marca; form.value.modelo = data.modelo;
    form.value.horometro = data.horometro; form.value.kilometraje = data.kilometraje;
  } catch (e) {}
};

const totalFinal = computed(() => {
  const m = form.value.materiales.reduce((acc, i) => acc + (i.cantidad * i.precioAlMomento), 0);
  const s = form.value.servicios.reduce((acc, i) => acc + parseFloat(i.monto || 0), 0);
  const t = form.value.terceros.reduce((acc, i) => acc + parseFloat(i.monto || 0), 0);
  return m + s + t;
});

const guardar = async () => {
  try {
    const action = esEdicion.value ? api.put(`/ordenes/${route.params.id}`, form.value) : api.post('/ordenes', form.value);
    await action;
    notify.success("Éxito", esEdicion.value ? "Orden actualizada" : "Orden creada");
    router.push('/ordenes');
  } catch (e) { notify.error("Error", "No se pudo procesar"); }
};

onMounted(inicializar);
</script>

<template>
  <div class="max-w-[1440px] mx-auto space-y-6 animate-fade-in pb-24 px-4">
    <header class="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex justify-between items-center">
      <div class="flex items-center gap-4">
        <button @click="router.back()" class="btn btn-circle btn-ghost"><ArrowLeft class="w-5 h-5" /></button>
        <div>
          <h2 class="text-xl font-black text-slate-800 uppercase italic tracking-tighter">
            {{ esEdicion ? 'Actualizar' : 'Nueva' }} <span class="text-lyer-green">Orden de Trabajo</span>
          </h2>
          <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Mecánica LYER Motors</p>
        </div>
      </div>
      <div v-if="esEdicion" class="flex items-center gap-3 bg-slate-50 px-5 py-2 rounded-2xl border border-slate-200">
        <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fase del Servicio:</span>
        <select v-model="form.estado" class="select select-xs select-ghost font-black text-lyer-green focus:bg-transparent">
          <option value="EN_REPARACION">EN REPARACION</option>
          <option value="CAMBIO_ACEITE">CAMBIO DE ACEITE</option>
          <option value="ESPERANDO_REPUESTO">ESPERANDO REPUESTO</option>
          <option value="TERMINADO">TERMINADO (CIERRE)</option>
          <option value="CANCELADO">CANCELADO</option>
        </select>
      </div>
    </header>

    <section class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
      <div class="flex items-center gap-2 px-2 text-lyer-green">
        <User class="w-4 h-4" />
        <span class="text-[10px] font-black uppercase tracking-widest">Información del Propietario</span>
      </div>
      <div class="flex flex-col lg:flex-row gap-4">
        <div class="lg:w-1/4">
          <input v-model="form.clienteNombre" placeholder="Nombre completo" class="input input-bordered w-full rounded-xl font-bold bg-slate-50 border-none" />
        </div>
        <div class="lg:w-48">
          <input v-model="form.clienteCelular" placeholder="Celular" class="input input-bordered w-full rounded-xl font-bold bg-slate-50 border-none" />
        </div>
        <div class="flex-1">
          <textarea v-model="form.trabajoSolicitado" placeholder="Detalle del pedido o falla reportada..." 
            class="textarea textarea-bordered w-full rounded-xl text-sm font-medium bg-slate-50 border-none min-h-[48px] h-[48px] focus:h-24 transition-all"></textarea>
        </div>
      </div>
    </section>

    <section class="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100/50 space-y-4">
      <div class="flex items-center gap-2 px-2 text-emerald-700">
        <Car class="w-4 h-4" />
        <span class="text-[10px] font-black uppercase tracking-widest">Ficha Técnica de la Unidad</span>
      </div>
      <div class="flex flex-wrap lg:flex-nowrap gap-4 items-end">
        <div class="w-full lg:w-32">
          <label class="text-[9px] font-bold text-emerald-600 block mb-1 ml-2 uppercase">Placa</label>
          <input v-model="form.placa" @blur="buscarVehiculo" class="input input-bordered w-full rounded-xl font-black text-center uppercase border-none shadow-sm" />
        </div>
        <div class="flex-1 w-full lg:w-auto">
          <label class="text-[9px] font-bold text-emerald-600 block mb-1 ml-2 uppercase">Marca de Vehículo</label>
          <input v-model="form.marca" placeholder="Ej: Volvo, Scania..." class="input input-bordered w-full rounded-xl text-sm font-bold border-none shadow-sm" />
        </div>
        <div class="flex-1 w-full lg:w-auto">
          <label class="text-[9px] font-bold text-emerald-600 block mb-1 ml-2 uppercase">Modelo / Versión</label>
          <input v-model="form.modelo" placeholder="Ej: FMX 460" class="input input-bordered w-full rounded-xl text-sm font-bold border-none shadow-sm" />
        </div>
        <div class="w-28">
          <label class="text-[9px] font-bold text-emerald-600 block mb-1 ml-2 uppercase text-center">Kilometraje</label>
          <input v-model="form.kilometraje" type="number" class="input input-bordered w-full rounded-xl text-sm font-bold border-none shadow-sm text-center" />
        </div>
        <div class="w-28">
          <label class="text-[9px] font-bold text-emerald-600 block mb-1 ml-2 uppercase text-center">Horómetro</label>
          <input v-model="form.horometro" type="number" class="input input-bordered w-full rounded-xl text-sm font-bold border-none shadow-sm text-center" />
        </div>
      </div>
    </section>

    <section class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-8 space-y-12">
      <div class="space-y-4">
        <div class="flex justify-between items-center border-b border-slate-50 pb-2">
          <div class="flex items-center gap-2 text-slate-400">
            <Package class="w-4 h-4" />
            <span class="text-[10px] font-black uppercase tracking-widest">Insumos y Repuestos</span>
          </div>
          <button type="button" @click="abrirSelector('materiales')" class="btn btn-xs bg-lyer-green text-white border-none rounded-lg px-4 shadow-sm hover:scale-105 transition-all">+ Añadir</button>
        </div>
        <div class="space-y-2">
          <div v-for="(m, i) in form.materiales" :key="i" class="flex items-center gap-4 bg-slate-50/50 p-2 pr-4 rounded-2xl border border-transparent hover:border-slate-100 group">
            <div class="w-16"><input v-model="m.cantidad" type="number" class="input input-xs w-full text-center font-black bg-white rounded-lg shadow-inner" /></div>
            <div class="flex-1 text-xs font-bold text-slate-700 uppercase">{{ m.descripcion }}</div>
            <div class="w-36 flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm">
              <span class="text-[9px] font-bold text-slate-300">P.U. S/</span>
              <input v-model="m.precioAlMomento" type="number" step="0.01" class="w-full bg-transparent font-black text-xs text-lyer-green outline-none" />
            </div>
            <div class="w-32 text-right font-black text-slate-800 tabular-nums">S/ {{ (m.cantidad * m.precioAlMomento).toFixed(2) }}</div>
            <button @click="form.materiales.splice(i, 1)" class="text-red-200 hover:text-red-500 transition-colors"><Trash2 class="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div class="flex justify-between items-center border-b border-slate-50 pb-2">
          <div class="flex items-center gap-2 text-slate-400">
            <Wrench class="w-4 h-4" />
            <span class="text-[10px] font-black uppercase tracking-widest">Servicios Mecánicos</span>
          </div>
          <button type="button" @click="abrirSelector('servicios')" class="btn btn-xs btn-outline border-slate-200 text-slate-400 rounded-lg px-4 hover:text-lyer-green hover:border-lyer-green">+ Catálogo</button>
        </div>
        <div v-for="(s, i) in form.servicios" :key="i" class="flex items-center gap-4 bg-slate-50/30 p-2 pr-4 rounded-2xl">
          <div class="flex-1 text-xs font-bold text-slate-600 pl-4 uppercase tracking-tight">{{ s.descripcion }}</div>
          <div class="w-36 flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm">
            <span class="text-[9px] font-bold text-slate-300">TOTAL S/</span>
            <input v-model="s.monto" type="number" step="0.01" class="w-full bg-transparent font-black text-xs text-slate-800 outline-none" />
          </div>
          <button @click="form.servicios.splice(i, 1)" class="text-red-200 hover:text-red-500"><Trash2 class="w-4 h-4" /></button>
        </div>
      </div>

      <div class="space-y-4">
        <div class="flex justify-between items-center border-b border-slate-50 pb-2">
          <div class="flex items-center gap-2 text-blue-400">
            <ExternalLink class="w-4 h-4" />
            <span class="text-[10px] font-black uppercase tracking-widest">Trabajos Externos (Terceros)</span>
          </div>
          <button type="button" @click="abrirSelector('terceros')" class="btn btn-xs btn-outline border-blue-100 text-blue-400 rounded-lg px-4 hover:bg-blue-50">+ Terceros</button>
        </div>
        <div v-for="(t, i) in form.terceros" :key="i" class="flex items-center gap-4 bg-blue-50/20 p-2 pr-4 rounded-2xl">
          <div class="flex-1 text-xs font-bold text-blue-900 pl-4 italic">{{ t.descripcion }}</div>
          <div class="w-36 flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-blue-100 shadow-sm">
            <span class="text-[9px] font-bold text-blue-200">TOTAL S/</span>
            <input v-model="t.monto" type="number" step="0.01" class="w-full bg-transparent font-black text-xs text-blue-700 outline-none" />
          </div>
          <button @click="form.terceros.splice(i, 1)" class="text-red-200 hover:text-red-500"><Trash2 class="w-4 h-4" /></button>
        </div>
      </div>
    </section>

    <footer class="bg-slate-900 p-8 rounded-[3rem] flex flex-col lg:flex-row justify-between items-center gap-8 shadow-2xl relative overflow-hidden">
      <div class="z-10 flex flex-col md:flex-row gap-8 items-center w-full lg:w-auto">
        <div class="flex flex-col gap-1 w-full lg:w-72">
          <label class="text-[8px] font-black text-emerald-400/50 uppercase tracking-[0.3em] ml-2">Asignar Operario Responsable</label>
          <select v-model="form.responsableId" class="select select-bordered bg-slate-800 text-white border-none rounded-2xl font-bold text-xs h-11">
            <option value="">Seleccione técnico...</option>
            <option v-for="u in catalogos.responsables" :key="u.id" :value="u.id">{{ u.nombreCompleto }}</option>
          </select>
        </div>
      </div>

      <div class="z-10 flex items-center gap-10 w-full lg:w-auto justify-between lg:justify-end">
        <div class="text-right">
          <p class="text-[8px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-1 opacity-60">Liquidación OT</p>
          <h2 class="text-4xl lg:text-5xl font-black text-white tracking-tighter tabular-nums">S/ {{ totalFinal.toFixed(2) }}</h2>
        </div>
        <button @click="guardar" class="btn btn-lg bg-lyer-accent text-emerald-950 border-none px-12 rounded-2xl shadow-xl hover:bg-white transition-all hover:scale-105">
          <CheckCircle class="w-6 h-6 mr-2" /> 
          <span class="font-black italic uppercase tracking-tighter">{{ esEdicion ? 'Actualizar' : 'Finalizar' }}</span>
        </button>
      </div>

      <div class="absolute -right-6 -bottom-6 opacity-5 rotate-12"><ClipboardList class="w-48 h-48 text-white" /></div>
    </footer>

    <SelectorCatalogoModal 
      :isOpen="modalSeleccion.abierto"
      :titulo="modalSeleccion.titulo"
      :items="modalSeleccion.items"
      :yaSeleccionadosIds="modalSeleccion.idsActuales"
      @close="modalSeleccion.abierto = false"
      @confirmar="confirmarSeleccion"
    />
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

/* Limpiar flechas de inputs numéricos */
input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
</style>