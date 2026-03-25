<script setup>
import { computed } from 'vue';
import { 
  X, ArrowRight, Package, Wrench, Trash2, 
  PlusCircle, RefreshCcw, ExternalLink, Activity, AlertCircle, 
  Database, User, UserCheck, FileText, Info
} from 'lucide-vue-next';

const props = defineProps({ 
  isOpen: Boolean, 
  log: Object 
});

const emit = defineEmits(['close']);

// Procesamos el JSON de detalles que ahora es polimórfico
const data = computed(() => {
  if (!props.log?.detalles) return null;
  try { 
    return typeof props.log.detalles === 'string' 
      ? JSON.parse(props.log.detalles) 
      : props.log.detalles; 
  } catch (e) { return null; }
});

const tieneCambios = computed(() => data.value && Object.keys(data.value).length > 0);

// Helper para estados legibles
const getEstadoLabel = (estado) => {
  const map = {
    'EN_REPARACION': 'En Reparación', 'TERMINADO': 'Terminado / Cerrado',
    'CANCELADO': 'Cancelado', 'CAMBIO_ACEITE': 'Cambio de Aceite',
    'ESPERANDO_REPUESTO': 'Esperando Repuesto'
  };
  return map[estado] || estado;
};

// Formateador para nombres de campos técnicos
const formatKey = (key) => {
  const labels = {
    nombreCompleto: 'Nombre', username: 'Usuario', rol: 'Permisos',
    descripcion: 'Descripción', precioBase: 'Precio Base', 
    totalFinal: 'Inversión Total', estado: 'Estado Fase'
  };
  return labels[key] || key.toUpperCase();
};
</script>

<template>
  <div :class="['modal modal-bottom sm:modal-middle', { 'modal-open': isOpen }]">
    <div class="modal-box max-w-3xl p-0 border-t-8 border-lyer-green rounded-[2.5rem] shadow-2xl overflow-hidden">
      
      <div class="p-6 bg-slate-50 border-b flex justify-between items-center">
        <div class="flex items-center gap-3">
          <div class="bg-lyer-green/10 p-2 rounded-xl text-lyer-green">
            <Activity class="w-5 h-5" />
          </div>
          <div>
            <h3 class="font-black text-slate-800 uppercase italic tracking-tighter">Visor de Auditoría</h3>
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Snapshot del Sistema</p>
          </div>
        </div>
        <button @click="emit('close')" class="btn btn-sm btn-circle btn-ghost text-slate-400"><X /></button>
      </div>

      <div class="max-h-[70vh] overflow-y-auto p-8 space-y-10 bg-white custom-scroll">
        
        <div v-if="tieneCambios" class="space-y-8 animate-fade-in">
          
          <div v-if="data.tipo === 'CREACION'" class="space-y-4">
            <div class="flex items-center gap-2 text-emerald-600">
              <PlusCircle class="w-5 h-5" />
              <span class="text-[10px] font-black uppercase tracking-widest">Nuevos Datos Registrados</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div v-for="(val, key) in data.datos" :key="key" 
                class="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex flex-col">
                <span class="text-[8px] font-black text-emerald-700 uppercase opacity-60">{{ formatKey(key) }}</span>
                <span class="text-xs font-bold text-slate-700">{{ val }}</span>
              </div>
            </div>
          </div>

          <div v-else-if="data.tipo === 'ELIMINACION'" class="space-y-4">
            <div class="flex items-center gap-2 text-red-500">
              <Trash2 class="w-5 h-5" />
              <span class="text-[10px] font-black uppercase tracking-widest">Registro Removido del Sistema</span>
            </div>
            <div class="bg-red-50 rounded-2xl p-6 border border-red-100 italic text-xs text-red-800">
              <pre class="whitespace-pre-wrap font-mono">{{ JSON.stringify(data.datos_borrados, null, 2) }}</pre>
            </div>
          </div>

          <div v-else class="space-y-10">
            <div v-if="data.tipo === 'EDICION' && data.cambios" class="grid grid-cols-1 gap-3">
              <div v-for="(val, key) in data.cambios" :key="key" 
                class="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <span class="text-[9px] font-black text-slate-400 uppercase w-24">{{ formatKey(key) }}</span>
                <div class="flex items-center gap-3 text-xs font-bold">
                  <span class="opacity-40 line-through">{{ val.de }}</span>
                  <ArrowRight class="w-3 h-3 text-lyer-green" />
                  <span class="text-lyer-green">{{ val.a }}</span>
                </div>
              </div>
            </div>

            <template v-if="!data.tipo || data.materiales || data.servicios">
              <div v-if="data.estado || data.totalFinal" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-if="data.estado" class="p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <span class="text-[9px] font-black text-emerald-700 uppercase">Fase</span>
                  <div class="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <span class="opacity-40">{{ getEstadoLabel(data.estado.de) }}</span>
                    <ArrowRight class="w-3 h-3 text-lyer-green"/>
                    <span class="text-lyer-green uppercase">{{ getEstadoLabel(data.estado.a) }}</span>
                  </div>
                </div>
                <div v-if="data.totalFinal" class="p-5 bg-slate-900 rounded-2xl border border-slate-800 shadow-lg text-white">
                  <span class="text-[9px] font-black text-emerald-400 uppercase">Inversión</span>
                  <div class="flex items-center gap-2 text-sm font-black">
                    <span class="opacity-30 line-through">S/ {{ parseFloat(data.totalFinal.de).toFixed(2) }}</span>
                    <ArrowRight class="w-3 h-3 text-emerald-500"/>
                    <span class="text-emerald-400">S/ {{ parseFloat(data.totalFinal.a).toFixed(2) }}</span>
                  </div>
                </div>
              </div>

              <div v-if="data.materiales?.length" class="space-y-3">
                <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Package class="w-4 h-4"/> Repuestos</h4>
                <div v-for="(m, i) in data.materiales" :key="i" class="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <RefreshCcw v-if="m.accion === 'MODIFICADO'" class="w-4 h-4 text-amber-500" />
                    <PlusCircle v-else class="w-4 h-4 text-emerald-500" />
                    <span class="text-[11px] font-black text-slate-700 uppercase">{{ m.item }}</span>
                  </div>
                  <div v-if="m.accion === 'MODIFICADO'" class="text-right text-[10px] font-bold">
                    <span class="opacity-40 line-through mr-2">{{ m.de }}</span>
                    <span class="text-lyer-green">{{ m.a }}</span>
                  </div>
                </div>
              </div>
            </template>
          </div>

        </div>

        <div v-else class="text-center py-16 space-y-4">
          <div class="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
             <Info class="w-10 h-10 text-slate-200" />
          </div>
          <p class="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Registro Básico</p>
          <p class="text-[10px] text-slate-300 italic">No hay detalles procesados para esta acción.</p>
        </div>
      </div>
      
      <div class="p-6 bg-slate-50 border-t flex justify-end">
        <button @click="emit('close')" class="btn bg-lyer-green text-white border-none px-12 rounded-2xl font-black uppercase text-xs shadow-lg hover:scale-105 transition-all">
          Cerrar Registro
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