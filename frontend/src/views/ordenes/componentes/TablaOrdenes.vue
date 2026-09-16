<script setup>
import StatusBadge from '../../../components/ui/StatusBadge.vue';
import { puedeEditar, puedeEliminar, puedeCerrar, puedeAceptar } from '../composables/usePermisosOrden.js';
import { nombreClienteOrden, marcaVehiculoOrden, modeloVehiculoOrden } from '../../../utils/ordenDisplay.js';
import {
  Eye, Trash2, Edit3, Lock, Printer, CheckCircle2
} from 'lucide-vue-next';

defineProps({
  ordenes: { type: Array, required: true },
  cargando: { type: Boolean, default: false },
  filasVacias: { type: Number, default: 0 },
  imprimiendoId: { type: [Number, String, null], default: null },
});

defineEmits(['verDetalle', 'imprimir', 'editar', 'cerrar', 'eliminar', 'aceptar']);
</script>

<template>
  <div class="md:hidden divide-y divide-slate-50">
    <div v-if="cargando" class="py-16 text-center">
      <span class="loading loading-ring loading-md text-lyer-green" />
    </div>
    <div v-for="o in ordenes" :key="'m-' + o.id"
      :class="['p-4 space-y-3 hover:bg-emerald-50/20 transition-colors', o.estaCerrada ? 'bg-slate-50/50' : '']">
      <div class="min-w-0">
        <div class="flex items-center gap-1.5 mb-1">
          <Lock v-if="o.estaCerrada" class="w-3 h-3 text-slate-400 shrink-0" />
          <span class="font-black text-lyer-green italic text-sm">{{ o.numeroOrden }}</span>
          <span class="text-[9px] text-slate-400">· {{ new Date(o.fechaCreacion).toLocaleDateString('es-PE') }}</span>
        </div>
        <p class="font-black text-slate-800 uppercase text-sm">{{ o.placa }}
          <span class="text-[10px] font-medium text-slate-400 normal-case">
            · {{ marcaVehiculoOrden(o) }} {{ modeloVehiculoOrden(o) }}
          </span>
        </p>
        <p class="text-xs text-slate-500 font-medium mt-0.5">{{ nombreClienteOrden(o) }}</p>
        <div class="flex items-center gap-2 mt-2 flex-wrap">
          <StatusBadge :estado="o.estado" :cerrada="o.estaCerrada" />
          <span class="font-black text-slate-700 text-sm">S/ {{ parseFloat(o.totalFinal || 0).toFixed(2) }}</span>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <button @click="$emit('verDetalle', o.id)"
          class="btn btn-sm h-11 min-h-11 bg-emerald-50 text-lyer-green border border-emerald-100 hover:bg-lyer-green hover:text-white rounded-xl font-bold gap-1.5 px-2">
          <Eye class="w-4 h-4 shrink-0" />
          <span class="text-xs">Ver</span>
        </button>
        <button @click="$emit('imprimir', o)" :disabled="imprimiendoId === o.id"
          class="btn btn-sm h-11 min-h-11 bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-700 hover:text-white rounded-xl font-bold gap-1.5 px-2 disabled:opacity-50">
          <span v-if="imprimiendoId === o.id" class="loading loading-spinner loading-xs" />
          <Printer v-else class="w-4 h-4 shrink-0" />
          <span class="text-xs">Imprimir</span>
        </button>
        <button v-if="puedeAceptar(o)" @click="$emit('aceptar', o)"
          class="btn btn-sm h-11 min-h-11 bg-sky-50 text-sky-700 border border-sky-100 hover:bg-sky-600 hover:text-white rounded-xl font-bold gap-1.5 px-2">
          <CheckCircle2 class="w-4 h-4 shrink-0" />
          <span class="text-xs">Aceptar</span>
        </button>
        <button v-if="puedeEditar(o)" @click="$emit('editar', o)"
          class="btn btn-sm h-11 min-h-11 bg-emerald-50 text-lyer-green border border-emerald-100 hover:bg-lyer-green hover:text-white rounded-xl font-bold gap-1.5 px-2">
          <Edit3 class="w-4 h-4 shrink-0" />
          <span class="text-xs">Editar</span>
        </button>
        <button v-if="puedeCerrar(o)" @click="$emit('cerrar', o)"
          class="btn btn-sm h-11 min-h-11 bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-500 hover:text-white rounded-xl font-bold gap-1.5 px-2">
          <Lock class="w-4 h-4 shrink-0" />
          <span class="text-xs">Cerrar</span>
        </button>
        <button v-if="puedeEliminar(o)" @click="$emit('eliminar', o)"
          class="btn btn-sm h-11 min-h-11 bg-red-50 text-red-500 border border-red-100 hover:bg-red-500 hover:text-white rounded-xl font-bold gap-1.5 px-2">
          <Trash2 class="w-4 h-4 shrink-0" />
          <span class="text-xs">Borrar</span>
        </button>
      </div>
    </div>
    <div v-if="!cargando && ordenes.length === 0"
      class="py-16 text-center text-slate-300 text-sm font-bold">
      No hay órdenes.
    </div>
  </div>

  <div class="hidden md:block overflow-x-auto min-h-[400px]">
    <table class="table w-full border-separate border-spacing-0">
      <thead class="bg-slate-50/50 text-slate-400 uppercase text-[9px] font-black tracking-[0.2em] border-b">
        <tr>
          <th class="py-5 pl-8">Fecha</th>
          <th>Orden #</th>
          <th>Vehículo / Placa</th>
          <th>Cliente</th>
          <th>Estado</th>
          <th class="text-right">Inversión</th>
          <th class="text-center pr-8">Acciones</th>
        </tr>
      </thead>
      <tbody class="text-slate-600">
        <tr v-for="o in ordenes" :key="o.id"
          :class="['hover:bg-emerald-50/30 transition-colors h-[75px]', o.estaCerrada ? 'bg-slate-50/50' : '']">
          <td class="pl-8 text-xs">{{ new Date(o.fechaCreacion).toLocaleDateString('es-PE') }}</td>
          <td>
            <div class="flex items-center gap-1">
              <Lock v-if="o.estaCerrada" class="w-3 h-3 text-slate-400 shrink-0" />
              <span class="font-black text-lyer-green italic">{{ o.numeroOrden }}</span>
            </div>
          </td>
          <td>
            <div class="flex flex-col">
              <span class="font-black text-slate-800 uppercase text-sm">{{ o.placa }}</span>
              <span class="text-[10px] font-bold opacity-40 uppercase">
                {{ marcaVehiculoOrden(o) }} {{ modeloVehiculoOrden(o) }}
              </span>
            </div>
          </td>
          <td class="text-sm font-bold">{{ nombreClienteOrden(o) }}</td>
          <td>
            <StatusBadge :estado="o.estado" :cerrada="o.estaCerrada" size="md" />
          </td>
          <td class="text-right font-black text-slate-800">
            S/ {{ parseFloat(o.totalFinal || 0).toFixed(2) }}
          </td>
          <td class="text-center pr-8">
            <div class="flex justify-center gap-1">
              <button @click="$emit('verDetalle', o.id)" title="Ver detalle"
                class="btn btn-square btn-ghost btn-sm text-lyer-green hover:bg-lyer-green hover:text-white rounded-lg">
                <Eye class="w-5 h-5" />
              </button>
              <button @click="$emit('imprimir', o)" :disabled="imprimiendoId === o.id" title="Imprimir PDF"
                class="btn btn-square btn-ghost btn-sm text-slate-500 hover:bg-slate-700 hover:text-white rounded-lg disabled:opacity-40">
                <span v-if="imprimiendoId === o.id" class="loading loading-spinner loading-xs" />
                <Printer v-else class="w-5 h-5" />
              </button>
              <button v-if="puedeAceptar(o)" @click="$emit('aceptar', o)" title="Aceptar borrador"
                class="btn btn-square btn-ghost btn-sm text-sky-600 hover:bg-sky-600 hover:text-white rounded-lg">
                <CheckCircle2 class="w-5 h-5" />
              </button>
              <button @click="$emit('editar', o)" :disabled="!puedeEditar(o)" title="Editar"
                class="btn btn-square btn-ghost btn-sm text-lyer-green hover:bg-lyer-green hover:text-white rounded-lg disabled:opacity-20">
                <Edit3 class="w-5 h-5" />
              </button>
              <button v-if="puedeCerrar(o)" @click="$emit('cerrar', o)" title="Cerrar orden"
                class="btn btn-square btn-ghost btn-sm text-amber-500 hover:bg-amber-500 hover:text-white rounded-lg">
                <Lock class="w-4 h-4" />
              </button>
              <button @click="$emit('eliminar', o)" :disabled="!puedeEliminar(o)" title="Eliminar"
                :class="['btn btn-square btn-ghost btn-sm rounded-lg transition-all',
                  puedeEliminar(o) ? 'text-red-400 hover:text-red-500 hover:bg-red-50' : 'text-slate-200 opacity-20 cursor-not-allowed']">
                <Trash2 class="w-5 h-5" />
              </button>
            </div>
          </td>
        </tr>
        <tr v-for="n in filasVacias" :key="'ghost-' + n" class="h-[75px] opacity-0 pointer-events-none">
          <td colspan="7"></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

