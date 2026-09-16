<script setup>
import { ClipboardList, AlertTriangle } from 'lucide-vue-next';

defineProps({
  descripcionInformal: { type: String, default: '' },
  trabajoSolicitado: { type: String, default: '' },
  estadoIngreso: { type: String, default: 'ACEPTADO' },
  observacionIngreso: { type: String, default: '' },
  errores: { type: Object, default: () => ({}) },
});

defineEmits([
  'update:descripcionInformal',
  'update:trabajoSolicitado',
  'update:estadoIngreso',
  'update:observacionIngreso',
]);
</script>

<template>
  <section class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-5">
    <div class="flex items-center gap-2 text-lyer-green">
      <ClipboardList class="w-4 h-4" />
      <span class="text-[10px] font-black uppercase tracking-widest">Ingreso y trabajo</span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="text-[9px] font-bold text-slate-400 block mb-1 uppercase">Descripción informal</label>
        <textarea
          :value="descripcionInformal"
          @input="$emit('update:descripcionInformal', $event.target.value)"
          rows="3"
          placeholder="Lo que comenta el cliente o recepción de forma libre..."
          class="textarea textarea-bordered w-full rounded-xl text-sm font-medium bg-slate-50 border-none"
        />
      </div>
      <div>
        <label class="text-[9px] font-bold text-slate-400 block mb-1 uppercase">Trabajo a realizar</label>
        <textarea
          :value="trabajoSolicitado"
          @input="$emit('update:trabajoSolicitado', $event.target.value)"
          rows="3"
          placeholder="Descripción más profesional del trabajo..."
          class="textarea textarea-bordered w-full rounded-xl text-sm font-medium bg-slate-50 border-none"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
      <div>
        <label class="text-[9px] font-bold text-slate-400 block mb-1 uppercase">Estado de ingreso</label>
        <select
          :value="estadoIngreso"
          @change="$emit('update:estadoIngreso', $event.target.value)"
          class="select select-bordered w-full rounded-xl font-bold bg-slate-50 border-none"
        >
          <option value="ACEPTADO">Aceptado (todo OK)</option>
          <option value="OBSERVADO">Observado (hay detalle/daño)</option>
        </select>
      </div>
      <div class="md:col-span-2" v-if="estadoIngreso === 'OBSERVADO'">
        <label class="text-[9px] font-bold text-amber-600 block mb-1 uppercase flex items-center gap-1">
          <AlertTriangle class="w-3 h-3" /> Observación de ingreso
        </label>
        <textarea
          :value="observacionIngreso"
          @input="$emit('update:observacionIngreso', $event.target.value)"
          rows="2"
          placeholder="Describe el daño o detalle al momento del ingreso..."
          :class="['textarea textarea-bordered w-full rounded-xl text-sm font-medium border-none', errores.observacionIngreso ? 'bg-red-50' : 'bg-amber-50']"
        />
        <p v-if="errores.observacionIngreso" class="text-xs text-red-500 mt-1">{{ errores.observacionIngreso }}</p>
      </div>
    </div>
  </section>
</template>
