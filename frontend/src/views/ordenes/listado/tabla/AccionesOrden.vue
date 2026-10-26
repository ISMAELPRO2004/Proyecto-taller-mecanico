<script setup>
import {
  Eye, Trash2, Edit3, Printer, CheckCircle2, Receipt, ReceiptText
} from 'lucide-vue-next';
import { useTablaOrdenes } from './useTablaOrdenes.js';
import { accionBtn } from './ordenTabla.js';
import { ESTADO } from '../../../../constants/estadosOrden.js';

defineProps({
  orden: { type: Object, required: true },
  imprimiendoId: { type: [Number, String, null], default: null },
});

defineEmits(['verDetalle', 'imprimir', 'editar', 'eliminar', 'aceptar', 'factura', 'cancelar']);

const {
  puedeVerImprimir,
  mostrarEditar,
  mostrarAceptar,
  mostrarEliminar,
  mostrarCancelar,
  mostrarFactura,
} = useTablaOrdenes();
</script>

<template>
  <div class="flex items-center justify-center gap-1.5">
    <button type="button" :class="[accionBtn, 'text-lyer-cyan hover:border-lyer-cyan/50 hover:bg-lyer-cyan/10']" title="Ver detalle" @click="$emit('verDetalle', orden)">
      <Eye class="h-4 w-4" />
    </button>
    <button
      v-if="puedeVerImprimir"
      type="button"
      :class="[accionBtn, 'text-slate-300 hover:text-white']"
      :disabled="imprimiendoId === orden.id"
      title="Imprimir"
      @click="$emit('imprimir', orden)"
    >
      <span v-if="imprimiendoId === orden.id" class="loading loading-spinner loading-xs" />
      <Printer v-else class="h-4 w-4" />
    </button>
    <button
      v-if="mostrarAceptar(orden)"
      type="button"
      :class="[accionBtn, 'text-sky-300 hover:border-sky-400/50 hover:bg-sky-500/10']"
      title="Aceptar borrador"
      @click="$emit('aceptar', orden)"
    >
      <CheckCircle2 class="h-4 w-4" />
    </button>
    <button
      v-if="mostrarEditar(orden)"
      type="button"
      :class="[accionBtn, 'text-sky-300 hover:border-sky-400/50 hover:bg-sky-500/10']"
      :title="orden.pasoRecepcion != null ? 'Continuar' : (orden.estado === ESTADO.EN_ESPERA ? 'Editar' : 'Completar')"
      @click="$emit('editar', orden)"
    >
      <Edit3 class="h-4 w-4" />
    </button>
    <button
      v-if="mostrarFactura(orden)"
      type="button"
      :class="[accionBtn, 'text-amber-300 hover:border-amber-400/50 hover:bg-amber-500/10']"
      title="Factura"
      @click="$emit('factura', orden)"
    >
      <Receipt class="h-4 w-4" />
    </button>
    <button
      v-if="mostrarCancelar(orden)"
      type="button"
      :class="[accionBtn, 'text-amber-300 hover:border-amber-400/50 hover:bg-amber-500/10']"
      title="Pasar a Cancelado para registrar la factura"
      @click="$emit('cancelar', orden)"
    >
      <ReceiptText class="h-4 w-4" />
    </button>
    <button
      v-if="mostrarEliminar(orden)"
      type="button"
      :class="[accionBtn, 'text-rose-300 hover:border-rose-400/50 hover:bg-rose-500/10']"
      title="Eliminar"
      @click="$emit('eliminar', orden)"
    >
      <Trash2 class="h-4 w-4" />
    </button>
  </div>
</template>
