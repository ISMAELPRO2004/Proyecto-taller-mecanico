<script setup>
import { computed } from 'vue';
import { 
  X, ArrowRight, Package, Wrench, Trash2, 
  PlusCircle, RefreshCcw, ExternalLink, Activity, AlertCircle 
} from 'lucide-vue-next';

const props = defineProps({ 
  isOpen: Boolean, 
  log: Object 
});

const emit = defineEmits(['close']);

// Procesamos el JSON de detalles que contiene la comparación profunda
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
    'EN_REPARACION': 'En Reparación',
    'TERMINADO': 'Terminado / Cerrado',
    'CANCELADO': 'Cancelado',
    'CAMBIO_ACEITE': 'Cambio de Aceite',
    'ESPERANDO_REPUESTO': 'Esperando Repuesto'
  };
  return map[estado] || estado;
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
            <h3 class="font-black text-slate-800 uppercase italic tracking-tighter">Auditoría de Actividad</h3>
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Mecánica LYER Motors</p>
          </div>
        </div>
        <button @click="emit('close')" class="btn btn-sm btn-circle btn-ghost text-slate-400"><X /></button>
      </div>

      <div class="max-h-[70vh] overflow-y-auto p-8 space-y-10 bg-white custom-scroll">
        
        <div v-if="tieneCambios" class="space-y-10 animate-fade-in">
          
          <div v-if="data.estado || data.totalFinal" class="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div v-if="data.estado" class="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col gap-2">
               <span class="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Estado de la Orden</span>
               <div class="flex items-center gap-2 text-xs font-bold text-slate-600">
                 <span class="opacity-40 italic">{{ getEstadoLabel(data.estado.de) }}</span> 
                 <ArrowRight class="w-3 h-3 text-lyer-green"/> 
                 <span class="text-lyer-green font-black uppercase">{{ getEstadoLabel(data.estado.a) }}</span>
               </div>
             </div>

             <div v-if="data.totalFinal" class="p-5 bg-slate-900 rounded-2xl border border-slate-800 shadow-lg flex flex-col gap-2">
               <span class="text-[9px] font-black text-emerald-400 uppercase tracking-widest opacity-60">Inversión Actualizada</span>
               <div class="flex items-center gap-3 text-sm font-black text-white tabular-nums">
                 <span class="opacity-30 line-through text-xs font-medium italic">S/ {{ parseFloat(data.totalFinal.de).toFixed(2) }}</span> 
                 <ArrowRight class="w-3 h-3 text-emerald-500"/> 
                 <span class="text-emerald-400">S/ {{ parseFloat(data.totalFinal.a).toFixed(2) }}</span>
               </div>
             </div>
          </div>

          <div v-if="data.materiales?.length" class="space-y-4">
            <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2">
              <Package class="w-4 h-4"/> Repuestos y Suministros
            </h4>
            <div class="space-y-2">
              <div v-for="(m, i) in data.materiales" :key="i" 
                class="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-between gap-4 group hover:bg-slate-50 transition-colors">
                
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <div :class="['p-2 rounded-xl shadow-sm', 
                    m.accion === 'MODIFICADO' ? 'bg-amber-100 text-amber-600' : 
                    (m.accion === 'AÑADIDO' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600')]">
                    <PlusCircle v-if="m.accion === 'AÑADIDO'" class="w-4 h-4" />
                    <Trash2 v-if="m.accion === 'ELIMINADO'" class="w-4 h-4" />
                    <RefreshCcw v-if="m.accion === 'MODIFICADO'" class="w-4 h-4" />
                  </div>
                  <div class="flex flex-col min-w-0">
                    <span class="text-[11px] font-black text-slate-700 uppercase truncate">{{ m.item }}</span>
                    <span class="text-[8px] font-bold text-slate-400 tracking-wider">{{ m.accion }}</span>
                  </div>
                </div>
                
                <div v-if="m.accion === 'MODIFICADO'" class="text-right flex flex-col items-end">
                   <div class="flex items-center gap-2">
                     <span class="text-[8px] font-black text-slate-300 uppercase tracking-tighter">Anterior:</span>
                     <p class="text-[10px] font-bold text-slate-400 line-through italic">{{ m.de }}</p>
                   </div>
                   <div class="flex items-center gap-2">
                     <span class="text-[8px] font-black text-lyer-green uppercase tracking-tighter">Actual:</span>
                     <p class="text-[11px] font-black text-lyer-green">{{ m.a }}</p>
                   </div>
                </div>
                
                <div v-else-if="m.accion === 'AÑADIDO'" class="text-right">
                  <p class="text-[11px] font-black text-lyer-green">S/ {{ parseFloat(m.valor || 0).toFixed(2) }}</p>
                </div>
              </div>
            </div>
          </div>

          <div v-if="data.servicios?.length" class="space-y-4">
            <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2">
              <Wrench class="w-4 h-4"/> Mano de Obra
            </h4>
            <div class="space-y-2">
              <div v-for="(s, i) in data.servicios" :key="i" class="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-between gap-4">
                <div class="flex items-center gap-3">
                  <div :class="['p-2 rounded-xl', s.accion === 'MODIFICADO' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600']">
                    <RefreshCcw v-if="s.accion === 'MODIFICADO'" class="w-4 h-4" />
                    <PlusCircle v-else class="w-4 h-4" />
                  </div>
                  <span class="text-[11px] font-black text-slate-700 uppercase">{{ s.item }}</span>
                </div>
                <div v-if="s.accion === 'MODIFICADO'" class="text-right">
                   <div class="flex items-center gap-2 text-[10px]">
                     <span class="text-slate-400 line-through">S/ {{ parseFloat(s.de).toFixed(2) }}</span> 
                     <ArrowRight class="w-2 h-2 text-slate-300" />
                     <span class="font-black text-lyer-green">S/ {{ parseFloat(s.a).toFixed(2) }}</span>
                   </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="data.terceros?.length" class="space-y-4">
            <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2">
              <ExternalLink class="w-4 h-4"/> Servicios Externos (Terceros)
            </h4>
            <div v-for="(t, i) in data.terceros" :key="i" class="p-4 bg-blue-50/30 rounded-2xl border border-blue-100 flex items-center justify-between">
              <div class="flex flex-col">
                <span class="text-[11px] font-bold text-blue-900 uppercase italic tracking-tight">{{ t.item }}</span>
                <span class="text-[8px] font-black text-blue-400 uppercase">{{ t.accion }}</span>
              </div>
              <span v-if="t.valor" class="text-[11px] font-black text-blue-600">S/ {{ parseFloat(t.valor).toFixed(2) }}</span>
            </div>
          </div>

        </div>

        <div v-else class="text-center py-16 space-y-4">
          <div class="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto border border-slate-100">
             <AlertCircle class="w-10 h-10 text-slate-200" />
          </div>
          <div class="max-w-xs mx-auto">
            <p class="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Registro Base</p>
            <p class="text-[10px] text-slate-300 italic font-medium">No se detectaron cambios estructurales o diferencias de inversión en esta versión.</p>
          </div>
        </div>
      </div>
      
      <div class="p-6 bg-slate-50 border-t flex justify-end">
        <button @click="emit('close')" class="btn bg-lyer-green text-white border-none px-12 rounded-2xl font-black uppercase text-xs shadow-lg hover:bg-emerald-900 transition-all hover:scale-105 active:scale-95">
          Cerrar Registro
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Scrollbar Minimalista para Mecánica LYER */
.custom-scroll::-webkit-scrollbar { width: 5px; }
.custom-scroll::-webkit-scrollbar-track { background: transparent; }
.custom-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
.custom-scroll::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }

/* Animación de entrada suave */
.animate-fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>