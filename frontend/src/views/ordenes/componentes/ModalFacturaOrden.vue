<script setup>
import { ref, watch } from 'vue';
import { X } from 'lucide-vue-next';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  orden: { type: Object, default: null },
  guardando: { type: Boolean, default: false },
});

const emit = defineEmits(['close', 'guardar']);

const form = ref({ decision: '', numero: '', monto: '' });

watch(() => props.isOpen, (abierto) => {
  if (!abierto || !props.orden) return;
  form.value = {
    decision: props.orden.requiereFactura ? 'si' : (props.orden.estado === 'CANCELADO' ? 'no' : ''),
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
  <div v-if="isOpen" class="fixed inset-0 z-[60] bg-black/40 flex items-end sm:items-center justify-center p-4">
    <div class="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden">
      <div class="p-5 border-b flex items-start justify-between gap-3">
        <div>
          <h3 class="font-black text-slate-800 uppercase italic">
            {{ orden?.estado === 'TERMINADO' ? 'Cancelar orden' : 'Factura' }}
          </h3>
          <p class="text-xs text-slate-500">
            {{ orden?.estado === 'TERMINADO'
              ? 'Al cancelar se pide la factura. Después solo se podrá editar esa información.'
              : `${orden?.numeroOrden} · solo el administrador puede cambiar la factura` }}
          </p>
        </div>
        <button type="button" class="btn btn-sm btn-circle btn-ghost" @click="emit('close')">
          <X class="w-4 h-4" />
        </button>
      </div>

      <div class="p-5 space-y-4">
        <p class="text-sm text-slate-600">
          {{ orden?.estado === 'TERMINADO' ? '¿Esta cancelación lleva factura?' : '¿Esta orden cancelada lleva factura?' }}
        </p>
        <div class="flex gap-2">
          <button
            type="button"
            class="btn flex-1 rounded-xl"
            :class="form.decision === 'si' ? 'bg-lyer-green text-white border-none' : 'btn-outline'"
            @click="form.decision = 'si'"
          >Sí</button>
          <button
            type="button"
            class="btn flex-1 rounded-xl"
            :class="form.decision === 'no' ? 'bg-slate-800 text-white border-none' : 'btn-outline'"
            @click="form.decision = 'no'"
          >No, omitir</button>
        </div>

        <div v-if="form.decision === 'si'" class="space-y-3">
          <label class="form-control">
            <span class="label-text text-[10px] font-black text-slate-400 uppercase">Número de factura</span>
            <input v-model="form.numero" type="text" class="input input-bordered rounded-xl" placeholder="Puede completarse después" />
          </label>
          <label class="form-control">
            <span class="label-text text-[10px] font-black text-slate-400 uppercase">Monto</span>
            <input v-model="form.monto" type="number" step="0.01" min="0" class="input input-bordered rounded-xl" />
          </label>
          <p v-if="!String(form.numero || '').trim()" class="text-[11px] text-amber-600 font-bold">
            Sin número, la factura sigue pendiente y parpadea en el listado.
          </p>
        </div>
      </div>

      <div class="p-4 bg-slate-50 border-t flex gap-2">
        <button type="button" class="btn btn-ghost flex-1 rounded-xl" :disabled="guardando" @click="emit('close')">Cancelar</button>
        <button
          type="button"
          class="btn flex-1 bg-lyer-green text-white border-none rounded-xl"
          :disabled="guardando || !form.decision"
          @click="confirmar"
        >
          <span v-if="guardando" class="loading loading-spinner loading-xs" />
          {{ orden?.estado === 'TERMINADO' ? 'Cancelar orden' : 'Guardar' }}
        </button>
      </div>
    </div>
  </div>
</template>
