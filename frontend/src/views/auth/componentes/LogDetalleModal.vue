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
  campoLabel, formatVal,
} = useDetalleLog(props);

const ficha = (tipo) => tipo === 'CREACION' || tipo === 'ELIMINACION' || tipo === 'EDICION';
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
    <div class="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#4a2870]/60 bg-[#160a24] text-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
      <div class="h-1 w-full shrink-0 bg-gradient-to-r from-lyer-green via-lyer-accent to-lyer-cyan" />
      <header class="flex shrink-0 items-start justify-between gap-3 border-b border-[#4a2870]/50 bg-[#10041f] px-5 py-4 sm:px-6">
        <div class="flex min-w-0 items-start gap-3">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-lyer-cyan/30 bg-lyer-cyan/10 text-lyer-cyan">
            <Activity class="h-5 w-5" />
          </div>
          <div class="min-w-0">
            <h3 class="truncate font-display text-lg font-bold uppercase tracking-tight text-white">
              {{ log?.accion || 'Detalle de auditoría' }}
            </h3>
            <p v-if="tituloItem" class="mt-0.5 truncate text-sm font-semibold text-lyer-cyan">{{ tituloItem }}</p>
            <p class="mt-0.5 font-mono text-[11px] uppercase tracking-widest text-slate-400">
              {{ log ? fechaHora(log.fecha) : '' }}
            </p>
          </div>
        </div>
        <button
          type="button"
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#4a2870]/50 bg-[#140a22] text-slate-400 hover:text-white"
          @click="emit('close')"
        >
          <X class="h-4 w-4" />
        </button>
      </header>

      <div class="max-h-[70vh] overflow-y-auto">
        <div v-if="log" class="flex flex-wrap items-center gap-3 border-b border-[#4a2870]/40 px-5 py-4 sm:px-6">
          <div class="flex items-center gap-2 text-sm text-slate-300">
            <User class="h-4 w-4 text-lyer-cyan" />
            <span class="font-semibold text-white">{{ log.usuario?.nombreCompleto || 'Sistema' }}</span>
            <span class="rounded-md border border-[#4a2870]/50 bg-[#140a22] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-300">
              {{ rolLabel(log.usuario?.rol) }}
            </span>
          </div>
          <div v-if="log.ipCliente" class="flex items-center gap-2 font-mono text-[11px] text-slate-400">
            <Monitor class="h-3.5 w-3.5" /> {{ log.ipCliente }}
          </div>
          <div v-if="log.orden" class="flex items-center gap-2 text-xs">
            <span class="rounded-md border border-lyer-cyan/30 bg-lyer-cyan/10 px-2 py-0.5 font-mono font-bold text-lyer-cyan">
              {{ log.orden.numeroOrden }}
            </span>
            <span class="text-slate-300">{{ log.orden.clienteNombre }}</span>
          </div>
        </div>

        <div class="px-5 py-5 sm:px-6">
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
          />
          <div v-else class="space-y-3 py-12 text-center">
            <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#4a2870]/50 bg-[#140a22]">
              <Info class="h-7 w-7 text-slate-500" />
            </div>
            <p class="font-mono text-[11px] font-bold uppercase tracking-widest text-slate-400">Registro básico</p>
            <p class="text-sm text-slate-500">Esta acción no generó detalles adicionales.</p>
          </div>
        </div>
      </div>

      <footer class="flex shrink-0 justify-end border-t border-[#4a2870]/50 bg-[#10041f] px-5 py-4 sm:px-6">
        <button
          type="button"
          class="rounded-xl border border-lyer-accent/40 bg-[#2a0a4a] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#3a1260]"
          @click="emit('close')"
        >
          Cerrar
        </button>
      </footer>
    </div>
    <Teleport to="body">
      <div v-if="vistaAmpliada" class="fixed inset-0 z-[2000] bg-black/80 flex items-center justify-center p-4 cursor-zoom-out"
        @click="vistaAmpliada = ''">
        <img :src="vistaAmpliada" alt="Foto ampliada" class="max-w-full max-h-[90vh] rounded-xl object-contain shadow-2xl" />
      </div>
    </Teleport>
  </div>
</template>

