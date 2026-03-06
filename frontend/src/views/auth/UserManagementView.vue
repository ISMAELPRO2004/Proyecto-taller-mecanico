<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import api from '../../api/axios.js';
import { notify } from '../../utils/alerts.js';
import LogDetalleModal from '../../components/ui/LogDetalleModal.vue';
import { 
  Users, History, ShieldCheck, UserPlus, 
  Search, Trash2, Edit3, Clock, 
  ChevronLeft, ChevronRight, Eye, X, Key, ListOrdered 
} from 'lucide-vue-next';

// --- ESTADOS ---
const tabActiva = ref('usuarios'); // usuarios | logs
const usuarios = ref([]);
const logs = ref([]);
const logSeleccionado = ref(null);
const modalLogOpen = ref(false); // Modal para detalles de auditoría
const loading = ref(false);
const busqueda = ref('');

// --- PAGINACIÓN ---
const paginaActual = ref(1);
const itemsPorPagina = ref(10);
const opcionesItems = [5, 10, 20, 50];

// --- MODAL USUARIO ---
const modalOpen = ref(false);
const editando = ref(false);
const form = ref({ id: null, nombreCompleto: '', username: '', password: '', rol: 'RESPONSABLE' });

const cargarDatos = async () => {
  loading.value = true;
  try {
    const endpoint = tabActiva.value === 'usuarios' ? '/usuarios' : '/usuarios/logs';
    const { data } = await api.get(endpoint);
    if (tabActiva.value === 'usuarios') usuarios.value = data;
    else logs.value = data;
  } catch (e) {
    notify.error("Error", "No se pudo obtener la información del servidor.");
  } finally {
    loading.value = false;
  }
};

// --- LÓGICA DE FILTRADO Y PAGINACIÓN (LOGS) ---
const logsFiltrados = computed(() => {
  return logs.value.filter(l => 
    l.accion.toLowerCase().includes(busqueda.value.toLowerCase()) ||
    l.usuario?.nombreCompleto?.toLowerCase().includes(busqueda.value.toLowerCase())
  );
});

const totalPaginas = computed(() => Math.ceil(logsFiltrados.value.length / itemsPorPagina.value) || 1);

const logsPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * itemsPorPagina.value;
  return logsFiltrados.value.slice(inicio, inicio + itemsPorPagina.value);
});

// Función para limpiar URLs innecesarias en la tabla
const limpiarAccion = (accion) => {
  return accion.split(' - URL:')[0];
};

const verDetalleLog = (log) => {
  logSeleccionado.value = log;
  modalLogOpen.value = true;
};

watch([tabActiva, busqueda, itemsPorPagina], () => paginaActual.value = 1);

// --- ACCIONES USUARIOS ---
const guardarUsuario = async () => {
  try {
    if (editando.value) {
      await api.put(`/usuarios/${form.value.id}`, form.value);
      notify.success("¡Hecho!", "Perfil actualizado.");
    } else {
      await api.post('/auth/register', form.value);
      notify.success("¡Registrado!", "Nuevo acceso creado.");
    }
    modalOpen.value = false;
    cargarDatos();
  } catch (e) { notify.error("Error", "No se pudo procesar la solicitud."); }
};

const eliminarUsuario = async (id) => {
  const ok = await notify.confirm("¿Revocar acceso?", "El usuario ya no podrá ingresar al sistema.");
  if (!ok) return;
  try {
    await api.delete(`/usuarios/${id}`);
    notify.success("Eliminado", "Acceso revocado.");
    cargarDatos();
  } catch (e) { notify.error("Error", "Operación no permitida."); }
};

onMounted(cargarDatos);
</script>

<template>
  <div class="space-y-6 animate-fade-in pb-10">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div class="flex items-center gap-3">
        <div class="bg-lyer-green p-3 rounded-2xl text-white shadow-lg shadow-emerald-900/20">
          <ShieldCheck class="w-6 h-6" />
        </div>
        <div>
          <h2 class="text-2xl font-black text-slate-800 tracking-tight uppercase italic">Control de Seguridad</h2>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mecánica LYER Motors</p>
        </div>
      </div>
      <button v-if="tabActiva === 'usuarios'" @click="editando = false; modalOpen = true" 
        class="btn bg-lyer-green text-white border-none px-8 rounded-xl shadow-md transition-all hover:scale-105">
        <UserPlus class="w-5 h-5 mr-1" /> Nuevo Acceso
      </button>
    </div>

    <div class="tabs tabs-boxed bg-slate-100 p-1 inline-flex rounded-2xl border border-slate-200">
      <button @click="tabActiva = 'usuarios'; cargarDatos()" 
        :class="['tab tab-lg px-8 font-black transition-all rounded-xl', tabActiva === 'usuarios' ? 'bg-white text-lyer-green shadow-sm' : 'text-slate-400']">
        <Users class="w-4 h-4 mr-2" /> Usuarios
      </button>
      <button @click="tabActiva = 'logs'; cargarDatos()" 
        :class="['tab tab-lg px-8 font-black transition-all rounded-xl', tabActiva === 'logs' ? 'bg-white text-lyer-green shadow-sm' : 'text-slate-400']">
        <History class="w-4 h-4 mr-2" /> Historial de Auditoría
      </button>
    </div>

    <div v-if="tabActiva === 'usuarios'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="u in usuarios" :key="u.id" 
        class="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
        <div class="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
          <Users class="w-24 h-24" />
        </div>
        
        <div class="flex items-center gap-4 relative z-10">
          <div class="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-lyer-green font-black text-xl border border-emerald-100">
            {{ u.username.charAt(0).toUpperCase() }}
          </div>
          <div>
            <h4 class="font-black text-slate-800 leading-tight uppercase tracking-tighter">{{ u.nombreCompleto }}</h4>
            <span :class="['badge badge-sm font-black border-none mt-1 shadow-sm', u.rol === 'ADMIN' ? 'bg-lyer-green text-white' : 'bg-lyer-accent text-emerald-950']">
              {{ u.rol }}
            </span>
          </div>
        </div>

        <div class="mt-8 flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div class="text-[10px] font-bold text-slate-400">
            <p class="tracking-widest">ID USUARIO:</p>
            <p class="text-slate-700 font-black uppercase text-xs">{{ u.username }}</p>
          </div>
          <div class="flex gap-1">
            <button @click="editando = true; form = { ...u }; modalOpen = true" class="btn btn-square btn-ghost btn-sm text-lyer-green hover:bg-emerald-100">
              <Edit3 class="w-4 h-4" />
            </button>
            <button @click="eliminarUsuario(u.id)" class="btn btn-square btn-ghost btn-sm text-red-400 hover:bg-red-50">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
      <div class="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <div class="relative w-full max-w-md">
          <Search class="absolute left-4 top-3 w-4 h-4 text-slate-400" />
          <input v-model="busqueda" type="text" placeholder="Buscar actividad o responsable..." 
            class="input input-bordered w-full pl-12 bg-white border-slate-200 focus:border-lyer-accent rounded-2xl text-sm font-medium shadow-inner" />
        </div>
      </div>
      
      <div class="overflow-x-auto min-h-[500px]">
        <table class="table w-full border-separate border-spacing-0">
          <thead class="bg-slate-50 text-slate-400 uppercase text-[9px] font-black tracking-[0.2em] border-b">
            <tr>
              <th class="py-5 pl-8">Timestamp</th>
              <th>Operador</th>
              <th>Actividad Realizada</th>
              <th class="text-center pr-8 w-24">Detalles</th>
            </tr>
          </thead>
          <tbody class="text-slate-600">
            <tr v-for="l in logsPaginados" :key="l.id" class="hover:bg-emerald-50/30 transition-colors h-[75px] border-b border-slate-50 group">
              <td class="pl-8 text-[11px] font-bold py-4">
                <div class="flex items-center gap-2">
                  <Clock class="w-3.5 h-3.5 text-slate-300" />
                  {{ new Date(l.fecha).toLocaleString() }}
                </div>
              </td>
              <td class="font-black text-slate-800 text-xs italic">{{ l.usuario?.nombreCompleto || 'Sistema Automático' }}</td>
              <td>
                <span class="px-3 py-1.5 bg-white rounded-lg text-[10px] font-black text-lyer-green border border-slate-200 uppercase tracking-tighter shadow-sm">
                  {{ limpiarAccion(l.accion) }}
                </span>
              </td>
              <td class="text-center pr-8">
                <button @click="verDetalleLog(l)" class="btn btn-square btn-ghost btn-sm text-lyer-green hover:bg-lyer-green hover:text-white rounded-xl transition-all shadow-sm">
                  <Eye class="w-5 h-5" />
                </button>
              </td>
            </tr>
            <tr v-for="n in (itemsPorPagina - logsPaginados.length)" :key="'g-'+n" class="h-[75px] opacity-0 pointer-events-none">
              <td colspan="4"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="p-6 bg-slate-50/50 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
            <ListOrdered class="w-4 h-4" /> Ver:
            <select v-model="itemsPorPagina" class="select select-ghost select-xs font-black text-lyer-green focus:bg-transparent">
              <option v-for="opt in opcionesItems" :key="opt" :value="opt">{{ opt }} registros</option>
            </select>
          </div>
          <div class="h-4 w-[1px] bg-slate-200"></div>
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total: {{ logsFiltrados.length }}</span>
        </div>
        <div class="join border border-slate-200 bg-white rounded-xl overflow-hidden shadow-sm">
          <button @click="paginaActual--" :disabled="paginaActual === 1" class="join-item btn btn-sm bg-white border-none disabled:text-slate-100 disabled:bg-slate-50"><ChevronLeft class="w-4 h-4" /></button>
          <button v-for="p in totalPaginas" :key="p" @click="paginaActual = p" 
            :class="['join-item btn btn-sm border-none font-black px-4', paginaActual === p ? 'bg-lyer-green text-white' : 'bg-white text-slate-400 hover:bg-slate-50']">{{ p }}</button>
          <button @click="paginaActual++" :disabled="paginaActual === totalPaginas" class="join-item btn btn-sm bg-white border-none disabled:text-slate-100 disabled:bg-slate-50"><ChevronRight class="w-4 h-4" /></button>
        </div>
      </div>
    </div>

    <div :class="['modal modal-bottom sm:modal-middle', { 'modal-open': modalOpen }]">
      <div class="modal-box p-0 overflow-hidden border-t-8 border-lyer-green rounded-[3rem] shadow-2xl">
        <div class="p-8 bg-slate-50 border-b flex justify-between items-center">
          <h3 class="font-black text-xl text-slate-800 uppercase italic tracking-tighter">{{ editando ? 'Editar Perfil Técnico' : 'Nuevo Acceso al Sistema' }}</h3>
          <button @click="modalOpen = false" class="btn btn-circle btn-ghost btn-sm text-slate-300 hover:text-red-500"><X class="w-6 h-6" /></button>
        </div>
        <div class="p-10 space-y-6">
          <div class="form-control">
            <label class="label"><span class="label-text font-black text-slate-400 uppercase text-[9px] tracking-widest">Nombre y Apellido</span></label>
            <input v-model="form.nombreCompleto" type="text" class="input input-bordered w-full bg-slate-50 rounded-2xl font-bold border-slate-100 focus:border-lyer-accent" />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-control">
              <label class="label"><span class="label-text font-black text-slate-400 uppercase text-[9px] tracking-widest">Username</span></label>
              <input v-model="form.username" type="text" class="input input-bordered w-full bg-slate-50 rounded-2xl font-bold border-slate-100 focus:border-lyer-accent" />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text font-black text-slate-400 uppercase text-[9px] tracking-widest">Privilegios</span></label>
              <select v-model="form.rol" class="select select-bordered w-full bg-slate-50 rounded-2xl font-bold border-slate-100 focus:border-lyer-accent">
                <option value="ADMIN">ADMINISTRADOR (TODO)</option>
                <option value="RESPONSABLE">RESPONSABLE TALLER</option>
              </select>
            </div>
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text font-black text-slate-400 uppercase text-[9px] tracking-widest">Contraseña de Acceso</span></label>
            <div class="relative">
              <Key class="absolute left-4 top-3.5 w-4 h-4 text-slate-300" />
              <input v-model="form.password" type="password" placeholder="••••••••" class="input input-bordered w-full pl-12 bg-slate-50 rounded-2xl font-bold border-slate-100 focus:border-lyer-accent" />
            </div>
            <p v-if="editando" class="text-[10px] text-slate-400 italic mt-3 bg-amber-50 p-2 rounded-lg text-center font-medium">Nota: Dejar en blanco para no cambiar la contraseña actual.</p>
          </div>
        </div>
        <div class="p-8 bg-slate-50 border-t flex justify-end gap-3">
          <button @click="modalOpen = false" class="btn btn-ghost font-black text-slate-400 uppercase text-xs">Descartar</button>
          <button @click="guardarUsuario" class="btn bg-lyer-green text-white border-none px-10 rounded-[1.5rem] shadow-xl hover:bg-emerald-900 transition-all hover:scale-105 active:scale-95 font-black uppercase text-xs">
            {{ editando ? 'Actualizar Datos' : 'Crear Usuario' }}
          </button>
        </div>
      </div>
    </div>

    <LogDetalleModal 
      :isOpen="modalLogOpen" 
      :log="logSeleccionado" 
      @close="modalLogOpen = false" 
    />
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>