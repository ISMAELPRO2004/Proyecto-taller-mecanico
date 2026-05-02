<script setup>
import { computed } from 'vue';
import { 
  X, PlusCircle, Trash2, RefreshCcw, ArrowRight,
  Package, Wrench, ExternalLink, Activity, Info,
  User, Monitor
} from 'lucide-vue-next';

const props = defineProps({ 
  isOpen: Boolean, 
  log: Object 
});
const emit = defineEmits(['close']);

// El campo detalles ya viene como objeto Json desde Prisma,
// no necesita JSON.parse. Pero por compatibilidad lo manejamos igual.
const data = computed(() => {
  if (!props.log?.detalles) return null;
  try { 
    return typeof props.log.detalles === 'string' 
      ? JSON.parse(props.log.detalles) 
      : props.log.detalles;
  } catch { return null; }
});

// ── Helpers ──────────────────────────────────────────────────────────────────

const ESTADO_LABELS = {
  EN_REPARACION:     'En Reparación',
  TERMINADO:         'Terminado',
  CANCELADO:         'Cancelado',
  CAMBIO_ACEITE:     'Cambio de Aceite',
  ESPERANDO_REPUESTO:'Esperando Repuesto',
};
const estadoLabel = (val) => ESTADO_LABELS[val] || val || '—';

const ROL_LABELS = {
  ADMIN:          'Administrador',
  RESPONSABLE:    'Responsable',
  USUARIO_GENERAL:'Usuario General',
};
const rolLabel = (val) => ROL_LABELS[val] || val || '—';

const CAMPO_LABELS = {
  clienteNombre:    'Cliente',
  clienteCelular:   'Celular Cliente',
  trabajoSolicitado:'Trabajo Solicitado',
  placa:            'Placa',
  marca:            'Marca',
  modelo:           'Modelo',
  horometro:        'Horómetro',
  kilometraje:      'Kilometraje',
  totalFinal:       'Total Final',
  estado:           'Estado',
  responsable:      'Responsable',
  responsableId:    'Responsable',
  nombreCompleto:   'Nombre Completo',
  username:         'Usuario',
  rol:              'Rol',
  activo:           'Estado de Cuenta',
  descripcion:      'Descripción',
  precioBase:       'Precio Base',
};
const campoLabel = (key) => CAMPO_LABELS[key] || key;

// Formatea un valor para mostrarlo legible
const formatVal = (key, val, log = null) => {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'object') return '—';
  if (key === 'estado')    return estadoLabel(val);
  if (key === 'rol')       return rolLabel(val);
  if (key === 'activo')    return val ? 'Activo' : 'Inactivo';
  if (key === 'totalFinal' || key === 'precioBase')
    return `S/ ${parseFloat(val).toFixed(2)}`;
  return String(val);
};

// Icono y color por acción de lista (AÑADIDO / MODIFICADO / ELIMINADO)
const accionConfig = (accion) => {
  if (accion === 'AÑADIDO')    return { color: 'text-emerald-500', bg: 'bg-emerald-50',  border: 'border-emerald-100' };
  if (accion === 'ELIMINADO')  return { color: 'text-red-400',     bg: 'bg-red-50',      border: 'border-red-100'     };
  return                              { color: 'text-amber-500',   bg: 'bg-amber-50/60', border: 'border-amber-100'   };
};

// ── Secciones computadas del nuevo formato ───────────────────────────────────

// Campos de cabecera simples { de, a }
const camposCabecera = computed(() => {
  if (!data.value) return [];

  // EDICION de orden → data.cambios.cabecera
  if (data.value.tipo === 'EDICION' && data.value.cambios?.cabecera) {
    return Object.entries(data.value.cambios.cabecera);
  }
  // EDICION simple (usuarios, catálogos) → data.cambios directo
  if (data.value.tipo === 'EDICION' && data.value.cambios) {
    const entries = Object.entries(data.value.cambios)
      .filter(([, v]) => v && typeof v === 'object' && 'de' in v);
    return entries;
  }
  return [];
});

// Listas de items (materiales / servicios / terceros)
const listas = computed(() => {
  if (data.value?.tipo !== 'EDICION') return [];
  const cambios = data.value.cambios || {};
  const resultado = [];
  if (cambios.materiales?.length) resultado.push({ nombre: 'Repuestos',  icono: 'package',  items: cambios.materiales });
  if (cambios.servicios?.length)  resultado.push({ nombre: 'Servicios',  icono: 'wrench',   items: cambios.servicios  });
  if (cambios.terceros?.length)   resultado.push({ nombre: 'Terceros',   icono: 'external', items: cambios.terceros   });
  return resultado;
});

// Datos de creación — aplanamos objetos anidados para no mostrar [object Object]
const datosCreacion = computed(() => {
  if (data.value?.tipo !== 'CREACION') return [];
  const IGNORAR = ['materiales', 'servicios', 'terceros', 'responsableId', 'creadorId'];
  return Object.entries(data.value.datos || {})
    .filter(([k]) => !IGNORAR.includes(k))
    .map(([k, v]) => [k, formatVal(k, v)]);
});
</script>

<template>
  <div :class="['modal modal-bottom sm:modal-middle', { 'modal-open': isOpen }]">
    <div class="modal-box max-w-2xl p-0 border-t-8 border-lyer-green rounded-[2.5rem] shadow-2xl overflow-hidden">
      
      <!-- Header -->
      <div class="p-6 bg-slate-50 border-b flex justify-between items-center">
        <div class="flex items-center gap-3">
          <div class="bg-lyer-green/10 p-2 rounded-xl text-lyer-green">
            <Activity class="w-5 h-5" />
          </div>
          <div>
            <h3 class="font-black text-slate-800 uppercase tracking-tighter">
              {{ log?.accion || 'Detalle de Auditoría' }}
            </h3>
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              {{ log ? new Date(log.fecha).toLocaleString('es-PE') : '' }}
            </p>
          </div>
        </div>
        <button @click="emit('close')" class="btn btn-sm btn-circle btn-ghost text-slate-400">
          <X />
        </button>
      </div>

      <div class="max-h-[70vh] overflow-y-auto bg-white custom-scroll">

        <!-- Meta: quién, desde dónde -->
        <div v-if="log" class="px-8 pt-6 pb-4 flex flex-wrap gap-4 border-b border-slate-50">
          <div class="flex items-center gap-2 text-xs text-slate-500">
            <User class="w-3.5 h-3.5 text-lyer-green" />
            <span class="font-black text-slate-700">{{ log.usuario?.nombreCompleto || 'Sistema' }}</span>
            <span class="text-slate-300">·</span>
            <span class="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-bold">
              {{ log.usuario?.rol || '' }}
            </span>
          </div>
          <div v-if="log.ipCliente" class="flex items-center gap-2 text-[10px] text-slate-400">
            <Monitor class="w-3 h-3" />
            {{ log.ipCliente }}
          </div>
          <div v-if="log.orden" class="flex items-center gap-2 text-[10px] text-slate-400">
            <span class="bg-lyer-green/10 text-lyer-green px-2 py-0.5 rounded-full font-black">
              {{ log.orden.numeroOrden }}
            </span>
            <span>{{ log.orden.clienteNombre }}</span>
          </div>
        </div>

        <div class="p-8 space-y-8">

          <!-- CREACIÓN -->
          <template v-if="data?.tipo === 'CREACION'">
            <div class="flex items-center gap-2 text-emerald-600 mb-4">
              <PlusCircle class="w-4 h-4" />
              <span class="text-[10px] font-black uppercase tracking-widest">Datos Registrados</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div v-for="[key, val] in datosCreacion" :key="key"
                class="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                <span class="block text-[8px] font-black text-emerald-700 uppercase opacity-60 mb-1">
                  {{ campoLabel(key) }}
                </span>
                <span class="text-xs font-bold text-slate-700">{{ val }}</span>
              </div>
            </div>
          </template>

          <!-- ELIMINACIÓN -->
          <template v-else-if="data?.tipo === 'ELIMINACION'">
            <div class="flex items-center gap-2 text-red-500 mb-4">
              <Trash2 class="w-4 h-4" />
              <span class="text-[10px] font-black uppercase tracking-widest">Registro Eliminado</span>
            </div>
            <div class="bg-red-50 rounded-2xl p-6 border border-red-100 space-y-2">
              <div v-for="[key, val] in Object.entries(data.datos_borrados || {}).filter(([k]) => !['materiales','servicios','terceros'].includes(k))" 
                :key="key"
                class="flex justify-between text-xs py-1 border-b border-red-100 last:border-0">
                <span class="font-black text-red-400 uppercase text-[9px]">{{ campoLabel(key) }}</span>
                <span class="font-bold text-red-700">{{ formatVal(key, val) }}</span>
              </div>
            </div>
          </template>

          <!-- EDICIÓN -->
          <template v-else-if="data?.tipo === 'EDICION'">

            <!-- Campos de cabecera -->
            <div v-if="camposCabecera.length" class="space-y-3">
              <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">
                Campos Modificados
              </p>
              <div v-for="[key, val] in camposCabecera" :key="key"
                class="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span class="text-[9px] font-black text-slate-400 uppercase w-32 shrink-0">
                  {{ campoLabel(key) }}
                </span>
                <div class="flex items-center gap-3 text-xs font-bold overflow-hidden">
                  <span class="opacity-40 line-through truncate max-w-[100px]">
                    {{ formatVal(key, val.de) }}
                  </span>
                  <ArrowRight class="w-3 h-3 text-lyer-green shrink-0" />
                  <span class="text-lyer-green truncate max-w-[120px]">
                    {{ formatVal(key, val.a) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Listas: materiales / servicios / terceros -->
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
                    <PlusCircle  v-if="item.accion === 'AÑADIDO'"   :class="['w-4 h-4 shrink-0', accionConfig(item.accion).color]" />
                    <Trash2      v-else-if="item.accion === 'ELIMINADO'" :class="['w-4 h-4 shrink-0', accionConfig(item.accion).color]" />
                    <RefreshCcw  v-else :class="['w-4 h-4 shrink-0', accionConfig(item.accion).color]" />
                    <span class="text-[11px] font-black text-slate-700 uppercase">
                      {{ item.descripcion }}
                    </span>
                  </div>
                  <span :class="['text-[9px] font-black uppercase px-2 py-0.5 rounded-full', accionConfig(item.accion).bg, accionConfig(item.accion).color]">
                    {{ item.accion }}
                  </span>
                </div>

                <!-- Detalle de cambio si fue MODIFICADO -->
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

                <!-- Datos del item añadido -->
                <div v-if="item.accion === 'AÑADIDO' && item.datos" class="mt-2 pl-6 flex gap-4 text-[10px] text-slate-500 font-bold">
                  <span v-if="item.datos.cantidad">Cant: {{ item.datos.cantidad }}</span>
                  <span v-if="item.datos.precio">S/ {{ item.datos.precio }}</span>
                  <span v-if="item.datos.monto">S/ {{ item.datos.monto }}</span>
                </div>
              </div>
            </div>

            <!-- Sin cambios detectados (no debería pasar con el nuevo logger) -->
            <div v-if="!camposCabecera.length && !listas.length"
              class="text-center py-8 text-slate-300 text-xs font-bold">
              Sin cambios registrados
            </div>
          </template>

          <!-- Sin detalles (log básico sin data) -->
          <div v-else class="text-center py-16 space-y-4">
            <div class="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
              <Info class="w-10 h-10 text-slate-200" />
            </div>
            <p class="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Registro Básico</p>
            <p class="text-[10px] text-slate-300 italic">Esta acción no generó detalles adicionales.</p>
          </div>

        </div>
      </div>

      <!-- Footer -->
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