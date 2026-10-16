<script setup>
import { computed } from 'vue';
import { puedeEditar, puedeEliminar, puedeAceptar, puedeCancelarTerminado } from '../composables/usePermisosOrden.js';
import { nombreClienteOrden, marcaVehiculoOrden, modeloVehiculoOrden } from '../../../utils/ordenDisplay.js';
import { useAuthStore } from '../../../stores/auth.js';
import {
  Eye, Trash2, Edit3, Lock, Printer, CheckCircle2, Receipt, ReceiptText
} from 'lucide-vue-next';

import { puedeVerPrecios, recepcionPendiente, puedeImprimir, mostrarAlertaFactura } from '../../../utils/roles.js';

const auth = useAuthStore();
const ROLES_TALLER = ['ADMIN', 'SUPERVISOR', 'TECNICO'];
const ROLES_ACEPTAR = ['ADMIN', 'SUPERVISOR'];
const verPrecios = computed(() => puedeVerPrecios(auth.usuario?.rol));
const puedeVerImprimir = computed(() => puedeImprimir(auth.usuario?.rol));
const verFacturaPendiente = (o) => mostrarAlertaFactura(o, auth.usuario?.rol);

const mostrarEditar = (o) => {
  if (!puedeEditar(o)) return false;
  if (o.estado === 'EN_ESPERA') return true;
  return ROLES_TALLER.includes(auth.usuario?.rol);
};

const mostrarAceptar = (o) => puedeAceptar(o) && ROLES_ACEPTAR.includes(auth.usuario?.rol);
const esAdmin = computed(() => auth.usuario?.rol === 'ADMIN');
const mostrarEliminar = (o) => puedeEliminar(o, auth.usuario?.rol);
const mostrarCancelar = (o) => esAdmin.value && puedeCancelarTerminado(o);
const mostrarFactura = (o) => esAdmin.value && o.estado === 'CANCELADO';
const ordenBloqueada = (o) => ['TERMINADO', 'CANCELADO'].includes(o.estado);

const PILLS = {
  EN_ESPERA: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  ACEPTADO: 'border-lyer-accent/40 bg-lyer-green/40 text-lyer-soft',
  EN_REPARACION: 'border-orange-500/40 bg-orange-500/15 text-orange-300',
  CAMBIO_ACEITE: 'border-sky-500/40 bg-sky-500/15 text-sky-300',
  ESPERANDO_REPUESTO: 'border-cyan-400/40 bg-cyan-500/15 text-cyan-200',
  TERMINADO: 'border-green-500/40 bg-green-500/15 text-green-300',
  CANCELADO: 'border-rose-500/40 bg-rose-500/15 text-rose-300',
};

const pillEstado = (estado) => PILLS[estado] || 'border-slate-600 bg-slate-800 text-slate-300';
const etiquetaEstado = (estado) => ({
  EN_ESPERA: 'En espera',
  ACEPTADO: 'Aceptado',
  EN_REPARACION: 'En reparación',
  CAMBIO_ACEITE: 'Cambio de aceite',
  ESPERANDO_REPUESTO: 'Esperando repuesto',
  TERMINADO: 'Terminado',
  CANCELADO: 'Cancelado',
}[estado] || estado);

const fechaOrden = (orden) => {
  const valor = orden?.fechaCreacion;
  if (!valor) return '—';
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? '—' : fecha.toLocaleDateString('es-PE');
};

const montoOrden = (orden) => Number(orden?.totalFinal || 0).toLocaleString('es-PE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const vehiculoOrden = (orden) => [marcaVehiculoOrden(orden), modeloVehiculoOrden(orden)].filter(Boolean).join(' ');
const accionBtn = 'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#4a2870]/50 bg-[#2a1840] transition-colors disabled:opacity-40';

defineProps({
  ordenes: { type: Array, required: true },
  cargando: { type: Boolean, default: false },
  filasVacias: { type: Number, default: 0 },
  imprimiendoId: { type: [Number, String, null], default: null },
});

defineEmits(['verDetalle', 'imprimir', 'editar', 'eliminar', 'aceptar', 'factura', 'cancelar']);
</script>

<template>
  <div v-if="cargando" class="py-16 text-center">
    <span class="loading loading-ring loading-md text-lyer-accent" />
  </div>
  <div v-else-if="ordenes.length === 0" class="py-16 text-center text-sm text-slate-400">
    No hay órdenes.
  </div>

  <div v-else class="overflow-x-auto">
    <table class="w-full min-w-[980px] border-collapse text-left text-sm text-slate-200">
      <thead class="border-b border-[#4a2870]/40 bg-[#160a24] text-[11px] font-bold uppercase tracking-wider text-slate-400">
        <tr>
          <th class="whitespace-nowrap px-4 py-3.5 text-left">Fecha</th>
          <th class="whitespace-nowrap px-4 py-3.5 text-left">Orden #</th>
          <th class="px-4 py-3.5 text-left">Vehículo / placa</th>
          <th class="px-4 py-3.5 text-left">Cliente</th>
          <th class="px-4 py-3.5 text-left">Estado</th>
          <th v-if="verPrecios" class="whitespace-nowrap px-4 py-3.5 text-right">Inversión</th>
          <th class="min-w-[210px] whitespace-nowrap px-4 py-3.5 text-center">Acciones</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-[#4a2870]/35">
        <tr
          v-for="o in ordenes"
          :key="o.id"
          class="transition-colors hover:bg-white/5"
        >
          <td class="whitespace-nowrap px-4 py-3.5 font-mono text-xs text-slate-400">{{ fechaOrden(o) }}</td>
          <td class="whitespace-nowrap px-4 py-3.5">
            <div class="flex items-center gap-1.5">
              <Lock v-if="ordenBloqueada(o)" class="h-3.5 w-3.5 shrink-0 text-slate-500" />
              <span class="font-mono text-xs font-bold tracking-wide text-white">{{ o.numeroOrden }}</span>
            </div>
          </td>
          <td class="px-4 py-3.5">
            <div class="flex items-center gap-2">
              <span class="rounded-md border border-[#4a2870]/60 bg-[#140a22] px-2 py-0.5 font-mono text-xs font-bold uppercase tracking-wider text-slate-100">
                {{ o.placa }}
              </span>
              <span class="max-w-[180px] truncate text-xs font-medium uppercase text-slate-300" :title="vehiculoOrden(o)">
                {{ vehiculoOrden(o) || '—' }}
              </span>
            </div>
          </td>
          <td class="whitespace-nowrap px-4 py-3.5 font-semibold text-slate-100">{{ nombreClienteOrden(o) }}</td>
          <td class="px-4 py-3.5">
            <div class="flex flex-wrap items-center gap-1.5">
              <span :class="['rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider', pillEstado(o.estado)]">
                {{ etiquetaEstado(o.estado) }}
              </span>
              <span
                v-if="recepcionPendiente(o)"
                class="rounded-md border border-amber-500/35 bg-amber-500/15 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-amber-200"
              >Pendiente a terminar</span>
              <span
                v-if="verFacturaPendiente(o)"
                class="rounded-md border border-amber-500/35 bg-amber-500/15 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-amber-200"
              >Factura pendiente</span>
            </div>
          </td>
          <td v-if="verPrecios" class="whitespace-nowrap px-4 py-3.5 text-right font-mono text-xs font-semibold">
            <span :class="Number(o.totalFinal) > 0 ? 'font-bold text-white' : 'text-slate-400'">
              S/ {{ montoOrden(o) }}
            </span>
          </td>
          <td class="px-4 py-3.5">
            <div class="flex items-center justify-center gap-1.5">
              <button type="button" :class="[accionBtn, 'text-lyer-cyan hover:border-lyer-cyan/50 hover:bg-lyer-cyan/10']" title="Ver detalle" @click="$emit('verDetalle', o.id)">
                <Eye class="h-4 w-4" />
              </button>
              <button
                v-if="puedeVerImprimir"
                type="button"
                :class="[accionBtn, 'text-slate-300 hover:text-white']"
                :disabled="imprimiendoId === o.id"
                title="Imprimir"
                @click="$emit('imprimir', o)"
              >
                <span v-if="imprimiendoId === o.id" class="loading loading-spinner loading-xs" />
                <Printer v-else class="h-4 w-4" />
              </button>
              <button
                v-if="mostrarAceptar(o)"
                type="button"
                :class="[accionBtn, 'text-sky-300 hover:border-sky-400/50 hover:bg-sky-500/10']"
                title="Aceptar borrador"
                @click="$emit('aceptar', o)"
              >
                <CheckCircle2 class="h-4 w-4" />
              </button>
              <button
                v-if="mostrarEditar(o)"
                type="button"
                :class="[accionBtn, 'text-sky-300 hover:border-sky-400/50 hover:bg-sky-500/10']"
                :title="o.pasoRecepcion != null ? 'Continuar' : (o.estado === 'EN_ESPERA' ? 'Editar' : 'Completar')"
                @click="$emit('editar', o)"
              >
                <Edit3 class="h-4 w-4" />
              </button>
              <button
                v-if="mostrarFactura(o)"
                type="button"
                :class="[accionBtn, 'text-amber-300 hover:border-amber-400/50 hover:bg-amber-500/10']"
                title="Factura"
                @click="$emit('factura', o)"
              >
                <Receipt class="h-4 w-4" />
              </button>
              <button
                v-if="mostrarCancelar(o)"
                type="button"
                :class="[accionBtn, 'text-amber-300 hover:border-amber-400/50 hover:bg-amber-500/10']"
                title="Pasar a Cancelado para registrar la factura"
                @click="$emit('cancelar', o)"
              >
                <ReceiptText class="h-4 w-4" />
              </button>
              <button
                v-if="mostrarEliminar(o)"
                type="button"
                :class="[accionBtn, 'text-rose-300 hover:border-rose-400/50 hover:bg-rose-500/10']"
                title="Eliminar"
                @click="$emit('eliminar', o)"
              >
                <Trash2 class="h-4 w-4" />
              </button>
            </div>
          </td>
        </tr>
        <tr v-for="n in filasVacias" :key="'ghost-' + n" class="pointer-events-none h-[68px] opacity-0">
          <td :colspan="verPrecios ? 7 : 6" />
        </tr>
      </tbody>
    </table>
  </div>
</template>

