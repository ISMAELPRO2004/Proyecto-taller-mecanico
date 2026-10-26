<script setup>
import { computed, ref, watch } from 'vue';
import { AlertTriangle, Check, Receipt, X } from 'lucide-vue-next';
import { ESTADO } from '../../../../constants/estadosOrden.js';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  orden: { type: Object, default: null },
  guardando: { type: Boolean, default: false },
  intencion: { type: String, default: '' },
});

const cancelando = computed(() => props.intencion === 'cancelar' || props.orden?.estado === ESTADO.TERMINADO);

const emit = defineEmits(['close', 'guardar']);

const form = ref({ decision: '', numero: '', monto: '' });

watch(() => props.isOpen, (abierto) => {
  if (!abierto || !props.orden) return;
  form.value = {
    decision: props.orden.requiereFactura ? 'si' : (props.orden.estado === ESTADO.CANCELADO ? 'no' : ''),
    numero: props.orden.numeroFactura || '',
    monto: props.orden.montoFactura ?? '',
  };
});

const confirmar = () => {
  if (!form.value.decision) return;
  const pideFactura = form.value.decision === 'si';
  emit('guardar', {
    requiereFactura: pideFactura,
    numeroFactura: pideFactura ? String(form.value.numero || '').trim() : null,
    montoFactura: pideFactura && form.value.monto !== '' ? form.value.monto : null,
  });
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
    <div class="relative w-full max-w-[540px] overflow-hidden rounded-2xl border border-lyer-linea/60 bg-lyer-panel text-lyer-fg shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
      <div class="h-1 w-full bg-gradient-to-r from-lyer-green via-lyer-accent to-lyer-cyan" />

      <header class="flex items-start justify-between gap-3 border-b border-lyer-linea/50 bg-lyer-barra px-5 py-4 sm:px-6">
        <div class="flex min-w-0 items-start gap-3">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-lyer-cyan/30 bg-lyer-cyan/10 text-lyer-cyan">
            <Receipt class="h-5 w-5" />
          </div>
          <div class="min-w-0">
            <h3 class="font-display text-lg font-bold uppercase tracking-tight text-lyer-fg sm:text-xl">
              {{ cancelando ? 'Cancelar orden' : 'Factura' }}
            </h3>
            <p class="mt-0.5 text-xs leading-relaxed text-lyer-muted">
              <span v-if="orden?.numeroOrden" class="font-mono font-semibold text-lyer-cyan">{{ orden.numeroOrden }}</span>
              <span v-if="orden?.numeroOrden"> · </span>
              {{ cancelando
                ? 'Al cancelar se pide la factura. Después solo se podrá editar esa información.'
                : 'Solo el administrador puede cambiar la factura.' }}
            </p>
          </div>
        </div>
        <button
          type="button"
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-lyer-linea/50 bg-lyer-fondo text-lyer-muted hover:text-lyer-fg"
          :disabled="guardando"
          @click="emit('close')"
        >
          <X class="h-4 w-4" />
        </button>
      </header>

      <div class="space-y-4 px-5 py-5 sm:px-6">
        <p class="text-sm font-medium text-lyer-fg">
          {{ cancelando ? '¿Esta cancelación lleva factura?' : '¿Esta orden cancelada lleva factura?' }}
        </p>

        <div class="grid grid-cols-2 gap-3">
          <button
            type="button"
            :class="[
              'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-colors',
              form.decision === 'si'
                ? 'border border-lyer-accent/50 bg-lyer-boton text-lyer-fg shadow-[0_0_20px_-6px_rgba(255,96,128,0.55)]'
                : 'border border-lyer-linea/60 bg-lyer-fondo text-lyer-muted hover:bg-lyer-hover hover:text-lyer-fg',
            ]"
            @click="form.decision = 'si'"
          >
            <Check v-if="form.decision === 'si'" class="h-4 w-4 text-lyer-cyan" />
            Sí
          </button>
          <button
            type="button"
            :class="[
              'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors',
              form.decision === 'no'
                ? 'border border-lyer-cyan/50 bg-lyer-hover text-lyer-fg'
                : 'border border-lyer-linea/60 bg-lyer-fondo text-lyer-muted hover:bg-lyer-hover hover:text-lyer-fg',
            ]"
            @click="form.decision = 'no'"
          >
            <Check v-if="form.decision === 'no'" class="h-4 w-4 text-lyer-cyan" />
            No, omitir
          </button>
        </div>

        <div v-if="form.decision === 'si'" class="space-y-4">
          <label class="block space-y-1.5">
            <span class="font-mono text-[10px] font-bold uppercase tracking-wider text-lyer-muted">Número de factura</span>
            <span class="relative block">
              <input
                v-model="form.numero"
                type="text"
                placeholder="Puede completarse después"
                class="w-full rounded-xl border border-lyer-linea/70 bg-lyer-barra py-3 pl-4 pr-11 font-mono text-sm text-lyer-fg placeholder:text-lyer-muted focus:border-lyer-cyan/70 focus:outline-none"
              />
              <Receipt class="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-lyer-cyan" />
            </span>
          </label>

          <label class="block space-y-1.5">
            <span class="font-mono text-[10px] font-bold uppercase tracking-wider text-lyer-muted">Monto (S/)</span>
            <span class="relative block">
              <span class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm font-bold text-lyer-muted">S/</span>
              <input
                v-model="form.monto"
                type="number"
                step="0.01"
                min="0"
                class="w-full rounded-xl border border-lyer-linea/70 bg-lyer-barra py-3 pl-11 pr-4 font-mono text-base font-bold text-lyer-fg focus:border-lyer-cyan/70 focus:outline-none"
              />
            </span>
          </label>

          <div
            v-if="!String(form.numero || '').trim()"
            class="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-200"
          >
            <AlertTriangle class="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            <p class="text-xs leading-snug">Sin número, la factura sigue pendiente y parpadea en el listado.</p>
          </div>
        </div>
      </div>

      <footer class="flex items-center justify-end gap-2 border-t border-lyer-linea/50 bg-lyer-barra px-5 py-4 sm:px-6">
        <button
          type="button"
          class="rounded-xl border border-lyer-linea/60 bg-lyer-fondo px-5 py-2.5 text-sm text-lyer-muted hover:text-lyer-fg disabled:opacity-50"
          :disabled="guardando"
          @click="emit('close')"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl border border-lyer-accent/40 bg-lyer-boton px-6 py-2.5 text-sm font-bold text-lyer-fg hover:bg-lyer-boton disabled:opacity-40"
          :disabled="guardando || !form.decision"
          @click="confirmar"
        >
          <span v-if="guardando" class="loading loading-spinner loading-xs" />
          {{ cancelando ? 'Cancelar orden' : 'Guardar' }}
        </button>
      </footer>
    </div>
  </div>
</template>
