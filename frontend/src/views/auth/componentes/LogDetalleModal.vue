<script setup>
import { X, Activity, User, Monitor, Info } from 'lucide-vue-next';
import { fechaHora } from '../../../utils/fecha.js';
import { useDetalleLog } from '../composables/useDetalleLog.js';
import LogGrupo from './log/LogGrupo.vue';
import LogDetalle from './log/LogDetalle.vue';
import LogFoto from './log/LogFoto.vue';
import LogFicha from './log/LogFicha.vue';

const props = defineProps({ isOpen: Boolean, log: Object });
const emit = defineEmits(['close']);

const {
  data, tituloItem, rolLabel, etiquetaOperacionFoto,
  vistaAnterior, vistaNueva, vistaAmpliada, cargandoFotos,
  datosCreacion, datosEliminacion, camposCabecera, listas,
  campoLabel, formatVal, accionConfig,
} = useDetalleLog(props);

const ficha = (tipo) => tipo === 'CREACION' || tipo === 'ELIMINACION' || tipo === 'EDICION';
</script>

<template>
  <div :class="['modal modal-bottom sm:modal-middle', { 'modal-open': isOpen }]">
    <div class="modal-box max-w-3xl p-0 border-t-8 border-lyer-green rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden">
      <div class="p-4 md:p-6 bg-slate-50 border-b flex justify-between items-center">
        <div class="flex items-center gap-3 min-w-0">
          <div class="bg-lyer-green/10 p-2 rounded-xl text-lyer-green shrink-0">
            <Activity class="w-5 h-5" />
          </div>
          <div class="min-w-0">
            <h3 class="font-black text-slate-800 uppercase tracking-tighter truncate">
              {{ log?.accion || 'Detalle de Auditoría' }}
            </h3>
            <p v-if="tituloItem" class="text-[10px] font-black text-lyer-green truncate mt-0.5">
              {{ tituloItem }}
            </p>
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              {{ log ? fechaHora(log.fecha) : '' }}
            </p>
          </div>
        </div>
        <button @click="emit('close')" class="btn btn-sm btn-circle btn-ghost text-slate-400 shrink-0"><X /></button>
      </div>

      <div class="max-h-[70vh] overflow-y-auto bg-white custom-scroll">
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

        <div class="p-8">
          <LogGrupo
            v-if="data?.tipo === 'GRUPO'"
            :contexto="data.contexto"
            :secciones="data.secciones"
            :clave="log?.id"
          />
          <LogDetalle
            v-else-if="data?.tipo === 'DETALLE'"
            :modo="data.modo"
            :filas="data.filas"
          />
          <LogFoto
            v-else-if="data?.tipo === 'FOTO'"
            :operacion="data.operacion"
            :etiqueta="etiquetaOperacionFoto(data.operacion)"
            :imagen="data.imagen"
            :tipo-foto="data.tipoFoto"
            :cargando="cargandoFotos"
            :vista-anterior="vistaAnterior"
            :vista-nueva="vistaNueva"
            @ampliar="vistaAmpliada = $event"
          />
          <LogFicha
            v-else-if="ficha(data?.tipo)"
            :tipo="data.tipo"
            :creacion="datosCreacion"
            :eliminacion="datosEliminacion"
            :cabecera="camposCabecera"
            :listas="listas"
            :campo-label="campoLabel"
            :format-val="formatVal"
            :accion-config="accionConfig"
          />
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
    <Teleport to="body">
      <div v-if="vistaAmpliada" class="fixed inset-0 z-[2000] bg-black/80 flex items-center justify-center p-4 cursor-zoom-out"
        @click="vistaAmpliada = ''">
        <img :src="vistaAmpliada" alt="Foto ampliada" class="max-w-full max-h-[90vh] rounded-xl object-contain shadow-2xl" />
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.custom-scroll::-webkit-scrollbar { width: 5px; }
.custom-scroll::-webkit-scrollbar-track { background: transparent; }
.custom-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
</style>
