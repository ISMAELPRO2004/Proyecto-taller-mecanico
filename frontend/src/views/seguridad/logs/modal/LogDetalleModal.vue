<script setup>
import { X, Activity, User, Monitor, Info } from 'lucide-vue-next';
import { fechaHora } from '../../../../utils/fecha.js';
import { useDetalleLog } from '../composables/useDetalleLog.js';
import LogGrupo from '../categorias/grupo/LogGrupo.vue';
import LogDetalle from '../categorias/detalle/LogDetalle.vue';
import LogFoto from '../categorias/foto/LogFoto.vue';
import LogCreacion from '../categorias/creacion/LogCreacion.vue';
import LogEliminacion from '../categorias/eliminacion/LogEliminacion.vue';
import LogEdicion from '../categorias/edicion/LogEdicion.vue';

const props = defineProps({ isOpen: Boolean, log: Object });
const emit = defineEmits(['close']);

const {
  data, tituloItem, rolLabel, etiquetaOperacionFoto,
  vistaAnterior, vistaNueva, vistaAmpliada, cargandoFotos,
  datosCreacion, datosEliminacion, camposCabecera, listas,
  campoLabel, formatVal,
} = useDetalleLog(props);
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
    <div class="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-lyer-linea/60 bg-lyer-panel text-lyer-fg shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
      <div class="h-1 w-full shrink-0 bg-gradient-to-r from-lyer-green via-lyer-accent to-lyer-cyan" />
      <header class="flex shrink-0 items-start justify-between gap-3 border-b border-lyer-linea/50 bg-lyer-barra px-5 py-4 sm:px-6">
        <div class="flex min-w-0 items-start gap-3">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-lyer-cyan/30 bg-lyer-cyan/10 text-lyer-cyan">
            <Activity class="h-5 w-5" />
          </div>
          <div class="min-w-0">
            <h3 class="truncate font-display text-lg font-bold uppercase tracking-tight text-lyer-fg">
              {{ log?.accion || 'Detalle de auditoría' }}
            </h3>
            <p v-if="tituloItem" class="mt-0.5 truncate text-sm font-semibold text-lyer-cyan">{{ tituloItem }}</p>
            <p class="mt-0.5 font-mono text-[11px] uppercase tracking-widest text-lyer-muted">
              {{ log ? fechaHora(log.fecha) : '' }}
            </p>
          </div>
        </div>
        <button
          type="button"
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-lyer-linea/50 bg-lyer-fondo text-lyer-muted hover:text-lyer-fg"
          @click="emit('close')"
        >
          <X class="h-4 w-4" />
        </button>
      </header>

      <div class="max-h-[70vh] overflow-y-auto">
        <div v-if="log" class="flex flex-wrap items-center gap-3 border-b border-lyer-linea/40 px-5 py-4 sm:px-6">
          <div class="flex items-center gap-2 text-sm text-lyer-muted">
            <User class="h-4 w-4 text-lyer-cyan" />
            <span class="font-semibold text-lyer-fg">{{ log.usuario?.nombreCompleto || 'Sistema' }}</span>
            <span class="rounded-md border border-lyer-linea/50 bg-lyer-fondo px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-lyer-muted">
              {{ rolLabel(log.usuario?.rol) }}
            </span>
          </div>
          <div v-if="log.ipCliente" class="flex items-center gap-2 font-mono text-[11px] text-lyer-muted">
            <Monitor class="h-3.5 w-3.5" /> {{ log.ipCliente }}
          </div>
          <div v-if="log.orden" class="flex items-center gap-2 text-xs">
            <span class="rounded-md border border-lyer-cyan/30 bg-lyer-cyan/10 px-2 py-0.5 font-mono font-bold text-lyer-cyan">
              {{ log.orden.numeroOrden }}
            </span>
            <span class="text-lyer-muted">{{ log.orden.clienteNombre }}</span>
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
          <LogCreacion
            v-else-if="data?.tipo === 'CREACION'"
            :creacion="datosCreacion"
          />
          <LogEliminacion
            v-else-if="data?.tipo === 'ELIMINACION'"
            :eliminacion="datosEliminacion"
          />
          <LogEdicion
            v-else-if="data?.tipo === 'EDICION'"
            :cabecera="camposCabecera"
            :listas="listas"
            :campo-label="campoLabel"
            :format-val="formatVal"
          />
          <div v-else class="space-y-3 py-12 text-center">
            <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-lyer-linea/50 bg-lyer-fondo">
              <Info class="h-7 w-7 text-slate-500" />
            </div>
            <p class="font-mono text-[11px] font-bold uppercase tracking-widest text-lyer-muted">Registro básico</p>
            <p class="text-sm text-slate-500">Esta acción no generó detalles adicionales.</p>
          </div>
        </div>
      </div>

      <footer class="flex shrink-0 justify-end border-t border-lyer-linea/50 bg-lyer-barra px-5 py-4 sm:px-6">
        <button
          type="button"
          class="rounded-xl border border-lyer-accent/40 bg-lyer-boton px-6 py-2.5 text-sm font-bold text-lyer-fg hover:bg-lyer-boton"
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
