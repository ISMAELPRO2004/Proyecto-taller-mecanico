<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import api from '../../api/axios.js';
import { notify } from '../../utils/alerts.js';
import LogDetalleModal from '../../components/ui/LogDetalleModal.vue';
import { 
  Users, History, ShieldCheck, UserPlus, Search,
  Edit3, Clock, ChevronLeft, ChevronRight, Eye,
  X, Key, ListOrdered, ToggleLeft, ToggleRight, Trash2
} from 'lucide-vue-next';

// ── ESTADO GENERAL ────────────────────────────────────────────────────────────
const tabActiva      = ref('usuarios');
const loading        = ref(false);

// ── USUARIOS ──────────────────────────────────────────────────────────────────
const usuarios       = ref([]);
const modalOpen      = ref(false);
const editando       = ref(false);
const form           = ref({
  id: null, nombreCompleto: '', username: '', password: '', rol: 'RESPONSABLE'
});

// ── LOGS ──────────────────────────────────────────────────────────────────────
const logs           = ref([]);
const logSeleccionado = ref(null);
const modalLogOpen   = ref(false);

// Filtros del lado del servidor
const busqueda       = ref('');
const filtroUsuarioId = ref('');

// Paginación sincronizada con el backend
const paginaActual   = ref(1);
const itemsPorPagina = ref(10);
const totalLogs      = ref(0);
const totalPaginas   = ref(1);
const opcionesItems  = [10, 20, 50];

// ── CARGA DE DATOS ────────────────────────────────────────────────────────────
const cargarUsuarios = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/usuarios');
    usuarios.value = data;
  } catch {
    notify.error('Error', 'No se pudo cargar la lista de usuarios.');
  } finally {
    loading.value = false;
  }
};

const cargarLogs = async () => {
  loading.value = true;
  try {
    // Construir params solo con los que tengan valor
    const params = {
      page:  paginaActual.value,
      limit: itemsPorPagina.value,
    };
    if (busqueda.value.trim())      params.accion     = busqueda.value.trim();
    if (filtroUsuarioId.value)      params.usuarioId  = filtroUsuarioId.value;

    const { data } = await api.get('/usuarios/logs', { params });

    logs.value        = data.data;
    totalLogs.value   = data.total;
    totalPaginas.value = data.totalPages;
  } catch {
    notify.error('Error', 'No se pudo cargar el historial de auditoría.');
  } finally {
    loading.value = false;
  }
};

const cargarDatos = () => {
  if (tabActiva.value === 'usuarios') cargarUsuarios();
  else cargarLogs();
};

// Resetear página al cambiar filtros
watch([busqueda, filtroUsuarioId, itemsPorPagina], () => {
  paginaActual.value = 1;
  if (tabActiva.value === 'logs') cargarLogs();
});

watch(tabActiva, () => {
  paginaActual.value = 1;
  busqueda.value     = '';
  cargarDatos();
});

// Al cambiar de página recargar
watch(paginaActual, () => {
  if (tabActiva.value === 'logs') cargarLogs();
});

onMounted(cargarDatos);

// ── USUARIOS: ACCIONES ────────────────────────────────────────────────────────
const abrirCrear = () => {
  editando.value = false;
  form.value = { id: null, nombreCompleto: '', username: '', password: '', rol: 'RESPONSABLE' };
  modalOpen.value = true;
};

const abrirEditar = (u) => {
  editando.value = true;
  // No traemos password al form — el backend lo ignora si viene vacío
  form.value = { id: u.id, nombreCompleto: u.nombreCompleto, username: u.username, password: '', rol: u.rol };
  modalOpen.value = true;
};

const guardarUsuario = async () => {
  try {
    if (editando.value) {
      // ← Corregido: era /auth/register, ahora usa el endpoint correcto
      await api.put(`/usuarios/${form.value.id}`, form.value);
      notify.success('¡Actualizado!', 'Perfil modificado correctamente.');
    } else {
      // ← Corregido: era /auth/register, ahora usa POST /usuarios
      await api.post('/usuarios', form.value);
      notify.success('¡Creado!', 'Nuevo usuario registrado.');
    }
    modalOpen.value = false;
    cargarUsuarios();
  } catch (e) {
    notify.error('Error', e.response?.data?.error || 'No se pudo procesar la solicitud.');
  }
};

const toggleUsuario = async (u) => {
  const accion = u.activo ? 'desactivar' : 'activar';
  const ok = await notify.confirm(
    `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} usuario?`,
    `El usuario ${u.nombreCompleto} ${u.activo ? 'ya no podrá' : 'podrá nuevamente'} ingresar al sistema.`
  );
  if (!ok) return;
  try {
    // ← Corregido: era DELETE, ahora usa PATCH /usuarios/:id/toggle-activo
    await api.patch(`/usuarios/${u.id}/toggle-activo`);
    notify.success('¡Listo!', `Usuario ${accion === 'desactivar' ? 'desactivado' : 'activado'}.`);
    cargarUsuarios();
  } catch {
    notify.error('Error', 'Operación no permitida.');
  }
};

// ── LOGS: ACCIONES ────────────────────────────────────────────────────────────
const verDetalleLog = (log) => {
  logSeleccionado.value = log;
  modalLogOpen.value = true;
};

// Páginas visibles en el paginador (máximo 5 botones)
const paginasVisibles = computed(() => {
  const total = totalPaginas.value;
  const actual = paginaActual.value;
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (actual <= 3) return [1, 2, 3, 4, 5];
  if (actual >= total - 2) return [total-4, total-3, total-2, total-1, total];
  return [actual-2, actual-1, actual, actual+1, actual+2];
});

const eliminarUsuario = async (u) => {
  const ok = await notify.confirm(
    '¿Eliminar usuario permanentemente?',
    `${u.nombreCompleto} será borrado del sistema. Esta acción no se puede deshacer.`
  );
  if (!ok) return;
  try {
    await api.delete(`/usuarios/${u.id}`);
    notify.success('Eliminado', 'Usuario borrado del sistema.');
    cargarUsuarios();
  } catch (e) {
    notify.error('Error', e.response?.data?.error || 'No se pudo eliminar. Puede tener registros asociados.');
  }
};
</script>

<template>
  <div class="space-y-6 animate-fade-in pb-10">

    <!-- Encabezado -->
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
      <button v-if="tabActiva === 'usuarios'" @click="abrirCrear"
        class="btn bg-lyer-green text-white border-none px-8 rounded-xl shadow-md transition-all hover:scale-105">
        <UserPlus class="w-5 h-5 mr-1" /> Nuevo Acceso
      </button>
    </div>

    <!-- Tabs -->
    <div class="tabs tabs-boxed bg-slate-100 p-1 inline-flex rounded-2xl border border-slate-200">
      <button @click="tabActiva = 'usuarios'"
        :class="['tab tab-lg px-8 font-black transition-all rounded-xl', tabActiva === 'usuarios' ? 'bg-white text-lyer-green shadow-sm' : 'text-slate-400']">
        <Users class="w-4 h-4 mr-2" /> Usuarios
      </button>
      <button @click="tabActiva = 'logs'"
        :class="['tab tab-lg px-8 font-black transition-all rounded-xl', tabActiva === 'logs' ? 'bg-white text-lyer-green shadow-sm' : 'text-slate-400']">
        <History class="w-4 h-4 mr-2" /> Historial de Auditoría
      </button>
    </div>

    <!-- ── TAB USUARIOS ── -->
    <div v-if="tabActiva === 'usuarios'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-if="loading" class="col-span-3 py-20 text-center">
        <span class="loading loading-ring loading-lg text-lyer-green"></span>
      </div>
      <template v-else>
        <div v-for="u in usuarios" :key="u.id"
          class="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
          :class="{ 'opacity-50': !u.activo }">
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
              <!-- Badge activo/inactivo -->
              <span :class="['badge badge-sm font-black border-none mt-1 ml-1 shadow-sm', u.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-500']">
                {{ u.activo ? 'ACTIVO' : 'INACTIVO' }}
              </span>
            </div>
          </div>
          <div class="mt-8 flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div class="text-[10px] font-bold text-slate-400">
              <p class="tracking-widest">ID USUARIO:</p>
              <p class="text-slate-700 font-black uppercase text-xs">{{ u.username }}</p>
            </div>
            <div class="flex gap-1">
              <button @click="abrirEditar(u)"
                class="btn btn-square btn-ghost btn-sm text-lyer-green hover:bg-emerald-100">
                <Edit3 class="w-4 h-4" />
              </button>
              <!-- ← Reemplaza el botón de eliminar por toggle activo/inactivo -->
              <button @click="toggleUsuario(u)"
                :class="['btn btn-square btn-ghost btn-sm transition-colors', u.activo ? 'text-red-400 hover:bg-red-50' : 'text-emerald-500 hover:bg-emerald-50']">
                <ToggleLeft  v-if="u.activo"  class="w-4 h-4" />
                <ToggleRight v-else           class="w-4 h-4" />
              </button>

              <button @click="eliminarUsuario(u)"
                class="btn btn-square btn-ghost btn-sm text-red-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                title="Eliminar permanentemente">
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- ── TAB LOGS ── -->
    <div v-else class="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">

      <!-- Barra de filtros -->
      <div class="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-wrap gap-4 items-center">
        <div class="relative flex-1 min-w-[200px]">
          <Search class="absolute left-4 top-3 w-4 h-4 text-slate-400" />
          <input v-model="busqueda" type="text" placeholder="Buscar por acción..."
            class="input input-bordered w-full pl-12 bg-white border-slate-200 focus:border-lyer-accent rounded-2xl text-sm font-medium shadow-inner" />
        </div>
        <!-- Filtro por usuario -->
        <select v-model="filtroUsuarioId"
          class="select select-bordered bg-white border-slate-200 rounded-2xl text-sm font-bold focus:border-lyer-accent min-w-[160px]">
          <option value="">Todos los usuarios</option>
          <option v-for="u in usuarios" :key="u.id" :value="u.id">{{ u.nombreCompleto }}</option>
        </select>
      </div>

      <!-- Tabla -->
      <div class="overflow-x-auto min-h-[500px]">
        <div v-if="loading" class="py-20 text-center">
          <span class="loading loading-ring loading-lg text-lyer-green"></span>
        </div>
        <table v-else class="table w-full border-separate border-spacing-0">
          <thead class="bg-slate-50 text-slate-400 uppercase text-[9px] font-black tracking-[0.2em] border-b">
            <tr>
              <th class="py-5 pl-8">Timestamp</th>
              <th>Operador</th>
              <th>Acción</th>
              <th>Orden</th>
              <th class="text-center pr-8 w-24">Detalle</th>
            </tr>
          </thead>
          <tbody class="text-slate-600">
            <tr v-for="l in logs" :key="l.id"
              class="hover:bg-emerald-50/30 transition-colors border-b border-slate-50 group">
              <td class="pl-8 text-[11px] font-bold py-4">
                <div class="flex items-center gap-2">
                  <Clock class="w-3.5 h-3.5 text-slate-300" />
                  {{ new Date(l.fecha).toLocaleString('es-PE') }}
                </div>
              </td>
              <td class="py-4">
                <p class="font-black text-slate-800 text-xs">{{ l.usuario?.nombreCompleto || 'Sistema' }}</p>
                <p class="text-[9px] text-slate-400 font-bold">{{ l.usuario?.rol }}</p>
              </td>
              <td class="py-4">
                <span class="px-3 py-1.5 bg-white rounded-lg text-[10px] font-black text-lyer-green border border-slate-200 uppercase tracking-tighter shadow-sm">
                  {{ l.accion }}
                </span>
              </td>
              <td class="py-4 text-[10px] font-bold text-slate-400">
                {{ l.orden?.numeroOrden || '—' }}
              </td>
              <td class="text-center pr-8 py-4">
                <button @click="verDetalleLog(l)"
                  class="btn btn-square btn-ghost btn-sm text-lyer-green hover:bg-lyer-green hover:text-white rounded-xl transition-all">
                  <Eye class="w-5 h-5" />
                </button>
              </td>
            </tr>
            <tr v-if="!logs.length && !loading">
              <td colspan="5" class="text-center py-20 text-slate-300 font-bold text-sm">
                No hay registros para los filtros aplicados.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div class="p-6 bg-slate-50/50 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
            <ListOrdered class="w-4 h-4" /> Ver:
            <select v-model="itemsPorPagina"
              class="select select-ghost select-xs font-black text-lyer-green focus:bg-transparent">
              <option v-for="opt in opcionesItems" :key="opt" :value="opt">{{ opt }} registros</option>
            </select>
          </div>
          <div class="h-4 w-[1px] bg-slate-200"></div>
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Total: {{ totalLogs }}
          </span>
        </div>
        <div class="join border border-slate-200 bg-white rounded-xl overflow-hidden shadow-sm">
          <button @click="paginaActual--" :disabled="paginaActual === 1"
            class="join-item btn btn-sm bg-white border-none disabled:text-slate-200">
            <ChevronLeft class="w-4 h-4" />
          </button>
          <button v-for="p in paginasVisibles" :key="p" @click="paginaActual = p"
            :class="['join-item btn btn-sm border-none font-black px-4', paginaActual === p ? 'bg-lyer-green text-white' : 'bg-white text-slate-400 hover:bg-slate-50']">
            {{ p }}
          </button>
          <button @click="paginaActual++" :disabled="paginaActual === totalPaginas"
            class="join-item btn btn-sm bg-white border-none disabled:text-slate-200">
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Modal crear/editar usuario -->
    <div :class="['modal modal-bottom sm:modal-middle', { 'modal-open': modalOpen }]">
      <div class="modal-box p-0 overflow-hidden border-t-8 border-lyer-green rounded-[3rem] shadow-2xl">
        <div class="p-8 bg-slate-50 border-b flex justify-between items-center">
          <h3 class="font-black text-xl text-slate-800 uppercase italic tracking-tighter">
            {{ editando ? 'Editar Perfil' : 'Nuevo Acceso al Sistema' }}
          </h3>
          <button @click="modalOpen = false" class="btn btn-circle btn-ghost btn-sm text-slate-300 hover:text-red-500">
            <X class="w-6 h-6" />
          </button>
        </div>
        <div class="p-10 space-y-6">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-black text-slate-400 uppercase text-[9px] tracking-widest">Nombre y Apellido</span>
            </label>
            <input v-model="form.nombreCompleto" type="text"
              class="input input-bordered w-full bg-slate-50 rounded-2xl font-bold border-slate-100 focus:border-lyer-accent" />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-control">
              <label class="label">
                <span class="label-text font-black text-slate-400 uppercase text-[9px] tracking-widest">Username</span>
              </label>
              <input v-model="form.username" type="text"
                class="input input-bordered w-full bg-slate-50 rounded-2xl font-bold border-slate-100 focus:border-lyer-accent" />
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text font-black text-slate-400 uppercase text-[9px] tracking-widest">Privilegios</span>
              </label>
              <select v-model="form.rol"
                class="select select-bordered w-full bg-slate-50 rounded-2xl font-bold border-slate-100 focus:border-lyer-accent">
                <option value="ADMIN">ADMINISTRADOR</option>
                <option value="RESPONSABLE">RESPONSABLE TALLER</option>
                <option value="USUARIO_GENERAL">USUARIO GENERAL</option>
              </select>
            </div>
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text font-black text-slate-400 uppercase text-[9px] tracking-widest">Contraseña</span>
            </label>
            <div class="relative">
              <Key class="absolute left-4 top-3.5 w-4 h-4 text-slate-300" />
              <input v-model="form.password" type="password" placeholder="••••••••"
                class="input input-bordered w-full pl-12 bg-slate-50 rounded-2xl font-bold border-slate-100 focus:border-lyer-accent" />
            </div>
            <p v-if="editando" class="text-[10px] text-slate-400 italic mt-3 bg-amber-50 p-2 rounded-lg text-center font-medium">
              Dejar en blanco para mantener la contraseña actual.
            </p>
          </div>
        </div>
        <div class="p-8 bg-slate-50 border-t flex justify-end gap-3">
          <button @click="modalOpen = false" class="btn btn-ghost font-black text-slate-400 uppercase text-xs">
            Cancelar
          </button>
          <button @click="guardarUsuario"
            class="btn bg-lyer-green text-white border-none px-10 rounded-[1.5rem] shadow-xl hover:bg-emerald-900 transition-all hover:scale-105 font-black uppercase text-xs">
            {{ editando ? 'Guardar Cambios' : 'Crear Usuario' }}
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
  to   { opacity: 1; transform: translateY(0); }
}
</style>