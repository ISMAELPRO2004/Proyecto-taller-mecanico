<script setup>
import { ChevronDown } from 'lucide-vue-next';
import { campo, etiqueta } from '../modal/campoRegistro.js';

const props = defineProps({
  form: { type: Object, required: true },
  marcas: { type: Array, default: () => [] },
  errores: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['update:form']);

const patch = (campoForm, valor) => {
  emit('update:form', { ...props.form, [campoForm]: valor });
};
</script>

<template>
  <div class="space-y-4">
    <label class="block space-y-1.5">
      <span :class="etiqueta">Placa</span>
      <input :value="form.placa" type="text" disabled :class="[campo, 'cursor-not-allowed text-center font-mono font-bold uppercase tracking-widest text-lyer-cyan opacity-80']" />
      <span class="block text-xs text-slate-500">La placa no se edita porque está vinculada a las órdenes.</span>
    </label>

    <label class="block space-y-1.5">
      <span :class="etiqueta">Marca</span>
      <span class="relative block">
        <select
          :value="form.marcaId"
          :class="[campo, 'appearance-none pr-10', errores.marcaId ? 'border-rose-400' : '']"
          @change="patch('marcaId', $event.target.value)"
        >
          <option value="">Selecciona una marca</option>
          <option v-for="m in marcas" :key="m.id" :value="m.id">{{ m.nombre }}</option>
        </select>
        <ChevronDown class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lyer-muted" />
      </span>
      <p v-if="errores.marcaId" class="text-xs text-rose-300">{{ errores.marcaId }}</p>
    </label>

    <label class="block space-y-1.5">
      <span :class="etiqueta">Modelo</span>
      <input
        :value="form.modelo"
        type="text"
        :class="[campo, errores.modelo ? 'border-rose-400' : '']"
        @input="patch('modelo', $event.target.value)"
      />
      <p v-if="errores.modelo" class="text-xs text-rose-300">{{ errores.modelo }}</p>
    </label>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <label class="block space-y-1.5">
        <span :class="etiqueta">Kilometraje (km)</span>
        <input
          :value="form.kilometraje ?? ''"
          type="number"
          min="0"
          :class="[campo, 'font-mono', errores.kilometraje ? 'border-rose-400' : '']"
          @input="patch('kilometraje', $event.target.value)"
        />
        <p v-if="errores.kilometraje" class="text-xs text-rose-300">{{ errores.kilometraje }}</p>
      </label>
      <label class="block space-y-1.5">
        <span :class="etiqueta">Horómetro (h)</span>
        <input
          :value="form.horometro ?? ''"
          type="number"
          min="0"
          :class="[campo, 'font-mono', errores.horometro ? 'border-rose-400' : '']"
          @input="patch('horometro', $event.target.value)"
        />
        <p v-if="errores.horometro" class="text-xs text-rose-300">{{ errores.horometro }}</p>
      </label>
    </div>
  </div>
</template>
