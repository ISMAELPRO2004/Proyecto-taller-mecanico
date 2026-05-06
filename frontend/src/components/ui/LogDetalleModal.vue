<script setup>
import { computed } from 'vue';
import { 
  X, PlusCircle, Trash2, RefreshCcw, ArrowRight,
  Package, Wrench, ExternalLink, Activity, Info,
  User, Monitor
} from 'lucide-vue-next';

const props = defineProps({ isOpen: Boolean, log: Object });
const emit = defineEmits(['close']);

const data = computed(() => {
  if (!props.log?.detalles) return null;
  try {
    return typeof props.log.detalles === 'string'
      ? JSON.parse(props.log.detalles)
      : props.log.detalles;
  } catch { return null; }
});

// ── Helpers ───────────────────────────────────────────────────────────────────
const ESTADO_LABELS = {
  EN_REPARACION: 'En Reparación', TERMINADO: 'Terminado',
  CANCELADO: 'Cancelado', CAMBIO_ACEITE: 'Cambio de Aceite',
  ESPERANDO_REPUESTO: 'Esperando Repuesto',
};
const estadoLabel = (val) => ESTADO_LABELS[val] || val || '—';
const ROL_LABELS  = {
  ADMIN: 'Administrador', RESPONSABLE: 'Responsable', USUARIO_GENERAL: 'Usuario General'
};
const rolLabel = (val) => ROL_LABELS[val] || val || '—';

const CAMPO_LABELS = {
  clienteNombre: 'Cliente', clienteCelular: 'Celular',
  trabajoSolicitado: 'Trabajo Solicitado', placa: 'Placa',
  marca: 'Marca', modelo: 'Modelo', horometro: 'Horómetro',
  kilometraje: 'Kilometraje', totalFinal: 'Total Final',
  estado: 'Estado', responsable: 'Responsable',
  nombreCompleto: 'Nombre Completo', username: 'Usuario',
  rol: 'Rol', activo: 'Estado de Cuenta',
  descripcion: 'Descripción', precioBase: 'Precio Base',
};
const campoLabel = (key) => CAMPO_LABELS[key] || key;

const formatFecha = (val) => {
  if (!val) return '—';
  try { return new Date(val).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' }); }
  catch { return String(val); }
};

const formatVal = (key, val) => {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'object') return '—';
  if (key === 'estado')  return estadoLabel(val);
  if (key === 'rol')     return rolLabel(val);
  if (key === 'activo')  return val ? 'Activo' : 'Inactivo';
  if (['totalFinal', 'precioBase', 'monto'].includes(key))
    return `S/ ${parseFloat(val).toFixed(2)}`;
  if (['actualizadoAt', 'fechaCreacion', 'creadoAt'].includes(key))
    return formatFecha(val);
  return String(val);
};

const accionConfig = (accion) => {
  if (accion === 'AÑADIDO')   return { color: 'text-emerald-500', bg: 'bg-emerald-50',  border: 'border-emerald-100' };
  if (accion === 'ELIMINADO') return { color: 'text-red-400',     bg: 'bg-red-50',      border: 'border-red-100'     };
  return                             { color: 'text-amber-500',   bg: 'bg-amber-50/60', border: 'border-amber-100'   };
};

// ── Tipo de acción ────────────────────────────────────────────────────────────
const tipoAccion = computed(() => {
  const a = props.log?.accion || '';
  if (a.includes('MATERIAL'))  return 'material';
  if (a.includes('SERVICIO'))  return 'servicio';
  if (a.includes('TERCERO'))   return 'tercero';
  if (a.includes('ORDEN'))     return 'orden';
  if (a.includes('USUARIO'))   return 'usuario';
  return 'otro';
});

const labelTipo = computed(() => ({
  material: 'Material', servicio: 'Servicio', tercero: 'Tercero',
  orden: 'Orden', usuario: 'Usuario', otro: 'Registro'
})[tipoAccion.value]);

// ── Título contextual del ítem afectado ───────────────────────────────────────
// Muestra el nombre/número del ítem en el header para contexto inmediato
const tituloItem = computed(() => {
  if (!data.value) return null;
  const d = data.value;

  // Edición — nombre del ítem guardado por el backend
  if (d.tipo === 'EDICION' && d.nombreItem) return d.nombreItem;

  // Creación de orden — número de orden desde el log
  if (d.tipo === 'CREACION' && props.log?.orden?.numeroOrden)
    return props.log.orden.numeroOrden;

  // Creación de catálogo — descripcion
  if (d.tipo === 'CREACION' && d.datos?.descripcion)
    return d.datos.descripcion;

  // Creación de usuario — nombreCompleto o username
  if (d.tipo === 'CREACION' && d.datos?.nombreCompleto)
    return d.datos.nombreCompleto;

  // Eliminación
  if (d.tipo === 'ELIMINACION' && d.datos_borrados?.descripcion)
    return d.datos_borrados.descripcion;
  if (d.tipo === 'ELIMINACION' && d.datos_borrados?.clienteNombre)
    return `Orden de ${d.datos_borrados.clienteNombre}`;

  return null;
});

// ── Campos por tipo de creación ───────────────────────────────────────────────
const CAMPOS_CATALOGO  = ['descripcion', 'precioBase', 'actualizadoAt'];
const CAMPOS_ORDEN     = ['clienteNombre', 'clienteCelular', 'trabajoSolicitado',
                          'placa', 'marca', 'modelo', 'horometro', 'kilometraje',
                          'estado', 'responsable'];
const CAMPOS_USUARIO   = ['nombreCompleto', 'username', 'rol'];

const datosCreacion = computed(() => {
  if (data.value?.tipo !== 'CREACION')
    return { campos: [], materiales: [], servicios: [], terceros: [], total: null };

  const datos = data.value.datos || {};
  const tipo  = tipoAccion.value;

  // Seleccionar qué campos mostrar según tipo
  let lista = tipo === 'orden'
    ? CAMPOS_ORDEN
    : tipo === 'usuario'
      ? CAMPOS_USUARIO
      : CAMPOS_CATALOGO;

  const campos = lista
    .filter(k => datos[k] !== undefined && datos[k] !== null && datos[k] !== '')
    .map(k => {
      let label = campoLabel(k);
      if (k === 'descripcion') label = `Nombre del ${labelTipo.value}`;
      if (k === 'actualizadoAt') label = 'Fecha de Registro';
      return [label, formatVal(k, datos[k])];
    });

  if (tipo !== 'orden') return { campos, materiales: [], servicios: [], terceros: [], total: null };

  const materiales = (datos.materiales || []).map(m => ({
    descripcion: m.descripcion || '—',
    cantidad: m.cantidad,
    subtotal: parseFloat(m.cantidad || 0) * parseFloat(m.precioAlMomento ?? m.precioAplicado ?? 0),
  }));
  const servicios = (datos.servicios || []).map(s => ({
    descripcion: s.descripcion || '—', monto: parseFloat(s.monto || 0),
  }));
  const terceros = (datos.terceros || []).map(t => ({
    descripcion: t.descripcion || '—', monto: parseFloat(t.monto || 0),
  }));
  const total = parseFloat(datos.totalFinal || 0) ||
    materiales.reduce((a, m) => a + m.subtotal, 0) +
    servicios.reduce((a, s)  => a + s.monto,    0) +
    terceros.reduce((a, t)   => a + t.monto,     0);

  return { campos, materiales, servicios, terceros, total };
});

// ── Eliminación ───────────────────────────────────────────────────────────────
const datosEliminacion = computed(() => {
  if (data.value?.tipo !== 'ELIMINACION')
    return { campos: [], materiales: [], servicios: [], terceros: [], total: null };

  const datos = data.value.datos_borrados || {};
  const tipo  = tipoAccion.value;

  let lista = tipo === 'orden'
    ? CAMPOS_ORDEN
    : tipo === 'usuario'
      ? CAMPOS_USUARIO
      : CAMPOS_CATALOGO;

  const campos = lista
    .filter(k => datos[k] !== undefined && datos[k] !== null && datos[k] !== '')
    .map(k => {
      let label = campoLabel(k);
      if (k === 'descripcion') label = `Nombre del ${labelTipo.value}`;
      if (k === 'actualizadoAt') label = 'Última Modificación';
      return [label, formatVal(k, datos[k])];
    });

  if (tipo !== 'orden')
    return { campos, materiales: [], servicios: [], terceros: [], total: null };

  const materiales = (datos.materiales || []).map(m => ({
    descripcion: m.material?.descripcion || m.descripcion || '—',
    cantidad: m.cantidad,
    subtotal: parseFloat(m.cantidad || 0) * parseFloat(m.precioAplicado || 0),
  }));
  const servicios = (datos.servicios || []).map(s => ({
    descripcion: s.descripcion || '—', monto: parseFloat(s.monto || 0),
  }));
  const terceros = (datos.terceros || []).map(t => ({
    descripcion: t.descripcion || '—', monto: parseFloat(t.monto || 0),
  }));

  return { campos, materiales, servicios, terceros, total: parseFloat(datos.totalFinal || 0) };
});

// ── Edición ───────────────────────────────────────────────────────────────────
const camposCabecera = computed(() => {
  if (data.value?.tipo !== 'EDICION') return [];
  if (data.value.cambios?.cabecera)
    return Object.entries(data.value.cambios.cabecera);
  if (data.value.cambios)
    return Object.entries(data.value.cambios)
      .filter(([, v]) => v && typeof v === 'object' && 'de' in v);
  return [];
});

const listas = computed(() => {
  if (data.value?.tipo !== 'EDICION') return [];
  const c = data.value.cambios || {};
  const res = [];
  if (c.materiales?.length) res.push({ nombre: 'Repuestos', icono: 'package', items: c.materiales });
  if (c.servicios?.length)  res.push({ nombre: 'Servicios', icono: 'wrench',  items: c.servicios  });
  if (c.terceros?.length)   res.push({ nombre: 'Terceros',  icono: 'external', items: c.terceros  });
  return res;
});
</script>

<template>
  <div :class="['modal modal-bottom sm:modal-middle', { 'modal-open': isOpen }]">
    <div class="modal-box max-w-3xl p-0 border-t-8 border-lyer-green rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden">

      <!-- Header -->
      <div class="p-4 md:p-6 bg-slate-50 border-b flex justify-between items-center">
        <div class="flex items-center gap-3 min-w-0">
          <div class="bg-lyer-green/10 p-2 rounded-xl text-lyer-green shrink-0">
            <Activity class="w-5 h-5" />
          </div>
          <div class="min-w-0">
            <h3 class="font-black text-slate-800 uppercase tracking-tighter truncate">
              {{ log?.accion || 'Detalle de Auditoría' }}
            </h3>
            <!-- Título contextual del ítem afectado -->
            <p v-if="tituloItem" class="text-[10px] font-black text-lyer-green truncate mt-0.5">
              {{ tituloItem }}
            </p>
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              {{ log ? new Date(log.fecha).toLocaleString('es-PE') : '' }}
            </p>
          </div>
        </div>
        <button @click="emit('close')" class="btn btn-sm btn-circle btn-ghost text-slate-400 shrink-0"><X /></button>
      </div>

      <div class="max-h-[70vh] overflow-y-auto bg-white custom-scroll">

        <!-- Meta -->
        <div v-if="log" class="px-8 pt-5 pb-4 flex flex-wrap gap-3 border-b border-slate-50">
          <div class="flex items-center gap-2 text-xs text-slate-500">
            <User class="w-3.5 h-3.5 text-lyer-green" />
            <span class="font-black text-slate-700">{{ log.usuario?.nombreCompleto || 'Sistema' }}</span>
            <span class="text-slate-300">·</span>
            <span class="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-bold">{{ rolLabel(log.usuario?.rol) }}</span>
          </div>
          <div v-if="log.ipCliente" class="flex items-center gap-2 text-[10px] text-slate-400">
            <Monitor class="w-3 h-3" /> {{ log.ipCliente }}
          </div>
          <div v-if="log.orden" class="flex items-center gap-2 text-[10px]">
            <span class="bg-lyer-green/10 text-lyer-green px-2 py-0.5 rounded-full font-black">
              {{ log.orden.numeroOrden }}
            </span>
            <span class="text-slate-400">{{ log.orden.clienteNombre }}</span>
          </div>
        </div>

        <div class="p-8 space-y-6">

          <!-- ── CREACIÓN ────────────────────────────────────────────────── -->
          <template v-if="data?.tipo === 'CREACION'">
            <div class="flex items-center gap-2 text-emerald-600">
              <PlusCircle class="w-4 h-4" />
              <span class="text-[10px] font-black uppercase tracking-widest">Datos Registrados</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div v-for="[label, val] in datosCreacion.campos" :key="label"
                class="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                <span class="block text-[8px] font-black text-emerald-700 uppercase opacity-60 mb-1">{{ label }}</span>
                <span class="text-xs font-bold text-slate-700">{{ val }}</span>
              </div>
            </div>

            <template v-if="datosCreacion.materiales.length">
              <div class="flex items-center gap-2 text-slate-400">
                <Package class="w-4 h-4" />
                <span class="text-[9px] font-black uppercase tracking-widest">Repuestos</span>
              </div>
              <div class="rounded-2xl border border-slate-100 overflow-hidden">
                <table class="table table-compact w-full text-xs">
                  <thead class="bg-slate-50 text-slate-400 text-[9px] uppercase">
                    <tr><th class="pl-4 py-3">Descripción</th><th class="text-center">Cant.</th><th class="text-right pr-4">Subtotal</th></tr>
                  </thead>
                  <tbody>
                    <tr v-for="(m, i) in datosCreacion.materiales" :key="i" class="border-t border-slate-50">
                      <td class="pl-4 py-2 font-medium">{{ m.descripcion }}</td>
                      <td class="text-center font-bold">{{ m.cantidad }}</td>
                      <td class="text-right pr-4 font-black">S/ {{ m.subtotal.toFixed(2) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>

            <template v-if="datosCreacion.servicios.length">
              <div class="flex items-center gap-2 text-slate-400">
                <Wrench class="w-4 h-4" />
                <span class="text-[9px] font-black uppercase tracking-widest">Servicios</span>
              </div>
              <div class="rounded-2xl border border-slate-100 overflow-hidden">
                <table class="table table-compact w-full text-xs">
                  <tbody>
                    <tr v-for="(s, i) in datosCreacion.servicios" :key="i" class="border-t border-slate-50 first:border-0">
                      <td class="pl-4 py-2 font-medium">{{ s.descripcion }}</td>
                      <td class="text-right pr-4 font-black">S/ {{ s.monto.toFixed(2) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>

            <template v-if="datosCreacion.terceros.length">
              <div class="flex items-center gap-2 text-slate-400">
                <ExternalLink class="w-4 h-4" />
                <span class="text-[9px] font-black uppercase tracking-widest">Terceros</span>
              </div>
              <div class="rounded-2xl border border-slate-100 overflow-hidden">
                <table class="table table-compact w-full text-xs">
                  <tbody>
                    <tr v-for="(t, i) in datosCreacion.terceros" :key="i" class="border-t border-slate-50 first:border-0">
                      <td class="pl-4 py-2 font-medium italic text-blue-800">{{ t.descripcion }}</td>
                      <td class="text-right pr-4 font-black text-blue-700">S/ {{ t.monto.toFixed(2) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>

            <div v-if="datosCreacion.total !== null"
              class="bg-slate-900 text-white p-5 rounded-2xl flex justify-between items-center">
              <span class="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Total de la Orden</span>
              <span class="text-xl font-black text-emerald-400">S/ {{ datosCreacion.total.toFixed(2) }}</span>
            </div>
          </template>

          <!-- ── ELIMINACIÓN ─────────────────────────────────────────────── -->
          <template v-else-if="data?.tipo === 'ELIMINACION'">
            <div class="flex items-center gap-2 text-red-500">
              <Trash2 class="w-4 h-4" />
              <span class="text-[10px] font-black uppercase tracking-widest">Registro Eliminado</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div v-for="[label, val] in datosEliminacion.campos" :key="label"
                class="p-4 bg-red-50/50 rounded-2xl border border-red-100">
                <span class="block text-[8px] font-black text-red-500 uppercase opacity-70 mb-1">{{ label }}</span>
                <span class="text-xs font-bold text-red-800">{{ val }}</span>
              </div>
            </div>

            <template v-if="datosEliminacion.materiales.length">
              <div class="flex items-center gap-2 text-red-400">
                <Package class="w-4 h-4" />
                <span class="text-[9px] font-black uppercase tracking-widest">Repuestos incluidos</span>
              </div>
              <div class="rounded-2xl border border-red-100 overflow-hidden">
                <table class="table table-compact w-full text-xs">
                  <tbody>
                    <tr v-for="(m, i) in datosEliminacion.materiales" :key="i" class="border-t border-red-50 first:border-0">
                      <td class="pl-4 py-2 font-medium text-red-800">{{ m.descripcion }}</td>
                      <td class="text-center text-red-500 font-bold">x{{ m.cantidad }}</td>
                      <td class="text-right pr-4 font-black text-red-700">S/ {{ m.subtotal.toFixed(2) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>

            <template v-if="datosEliminacion.servicios.length || datosEliminacion.terceros.length">
              <div class="flex items-center gap-2 text-red-400">
                <Wrench class="w-4 h-4" />
                <span class="text-[9px] font-black uppercase tracking-widest">Servicios incluidos</span>
              </div>
              <div class="rounded-2xl border border-red-100 overflow-hidden">
                <table class="table table-compact w-full text-xs">
                  <tbody>
                    <tr v-for="(s, i) in datosEliminacion.servicios" :key="'s'+i" class="border-t border-red-50 first:border-0">
                      <td class="pl-4 py-2 font-medium text-red-800">{{ s.descripcion }}</td>
                      <td class="text-right pr-4 font-black text-red-700">S/ {{ s.monto.toFixed(2) }}</td>
                    </tr>
                    <tr v-for="(t, i) in datosEliminacion.terceros" :key="'t'+i" class="border-t border-red-50">
                      <td class="pl-4 py-2 font-medium italic text-red-700">{{ t.descripcion }}</td>
                      <td class="text-right pr-4 font-black text-red-600">S/ {{ t.monto.toFixed(2) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>

            <div v-if="datosEliminacion.total"
              class="bg-red-900 text-white p-5 rounded-2xl flex justify-between items-center">
              <span class="text-[10px] font-black text-red-300 uppercase tracking-widest">Total eliminado</span>
              <span class="text-xl font-black text-red-300">S/ {{ datosEliminacion.total.toFixed(2) }}</span>
            </div>
          </template>

          <!-- ── EDICIÓN ─────────────────────────────────────────────────── -->
          <template v-else-if="data?.tipo === 'EDICION'">
            <div v-if="camposCabecera.length" class="space-y-3">
              <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Campos Modificados</p>
              <div v-for="[key, val] in camposCabecera" :key="key"
                class="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span class="text-[9px] font-black text-slate-400 uppercase w-32 shrink-0">{{ campoLabel(key) }}</span>
                <div class="flex items-center gap-3 text-xs font-bold overflow-hidden">
                  <span class="opacity-40 line-through truncate max-w-[100px]">{{ formatVal(key, val.de) }}</span>
                  <ArrowRight class="w-3 h-3 text-lyer-green shrink-0" />
                  <span class="text-lyer-green truncate max-w-[120px]">{{ formatVal(key, val.a) }}</span>
                </div>
              </div>
            </div>

            <div v-for="lista in listas" :key="lista.nombre" class="space-y-3">
              <div class="flex items-center gap-2 text-slate-400">
                <Package v-if="lista.icono === 'package'" class="w-4 h-4" />
                <Wrench  v-else-if="lista.icono === 'wrench'" class="w-4 h-4" />
                <ExternalLink v-else class="w-4 h-4" />
                <span class="text-[9px] font-black uppercase tracking-widest">{{ lista.nombre }}</span>
              </div>
              <div v-for="(item, i) in lista.items" :key="i"
                :class="['p-4 rounded-2xl border', accionConfig(item.accion).bg, accionConfig(item.accion).border]">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex items-center gap-2">
                    <PlusCircle  v-if="item.accion === 'AÑADIDO'"    :class="['w-4 h-4 shrink-0', accionConfig(item.accion).color]" />
                    <Trash2      v-else-if="item.accion === 'ELIMINADO'" :class="['w-4 h-4 shrink-0', accionConfig(item.accion).color]" />
                    <RefreshCcw  v-else :class="['w-4 h-4 shrink-0', accionConfig(item.accion).color]" />
                    <span class="text-[11px] font-black text-slate-700 uppercase">{{ item.descripcion }}</span>
                  </div>
                  <span :class="['text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0', accionConfig(item.accion).bg, accionConfig(item.accion).color]">
                    {{ item.accion }}
                  </span>
                </div>
                <div v-if="item.accion === 'MODIFICADO'" class="mt-3 pl-6 space-y-1">
                  <div v-for="campo in ['cantidad', 'precio', 'monto']" :key="campo">
                    <div v-if="item[campo]" class="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                      <span class="capitalize text-slate-400 w-16">{{ campo }}:</span>
                      <span class="opacity-40 line-through">{{ item[campo].de }}</span>
                      <ArrowRight class="w-3 h-3 text-lyer-green" />
                      <span class="text-lyer-green">{{ item[campo].a }}</span>
                    </div>
                  </div>
                </div>
                <div v-if="item.accion === 'AÑADIDO' && item.datos" class="mt-2 pl-6 flex gap-4 text-[10px] text-slate-500 font-bold">
                  <span v-if="item.datos.cantidad">Cant: {{ item.datos.cantidad }}</span>
                  <span v-if="item.datos.precio">S/ {{ item.datos.precio }}</span>
                  <span v-if="item.datos.monto">S/ {{ item.datos.monto }}</span>
                </div>
              </div>
            </div>

            <div v-if="!camposCabecera.length && !listas.length"
              class="text-center py-8 text-slate-300 text-xs font-bold">
              Sin cambios registrados
            </div>
          </template>

          <!-- Sin detalles -->
          <div v-else class="text-center py-16 space-y-4">
            <div class="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
              <Info class="w-10 h-10 text-slate-200" />
            </div>
            <p class="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Registro Básico</p>
            <p class="text-[10px] text-slate-300 italic">Esta acción no generó detalles adicionales.</p>
          </div>

        </div>
      </div>

      <div class="p-6 bg-slate-50 border-t flex justify-end">
        <button @click="emit('close')"
          class="btn bg-lyer-green text-white border-none px-12 rounded-2xl font-black uppercase text-xs shadow-lg hover:scale-105 transition-all">
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scroll::-webkit-scrollbar { width: 5px; }
.custom-scroll::-webkit-scrollbar-track { background: transparent; }
.custom-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
</style>