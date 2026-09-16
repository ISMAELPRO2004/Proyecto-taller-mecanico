<script setup>
import { Car } from 'lucide-vue-next';

defineProps({
  form: { type: Object, required: true },
  errores: { type: Object, default: () => ({}) },
  esEdicion: { type: Boolean, default: false },
});

defineEmits(['update:form', 'blurPlaca']);
</script>

<template>
  <section class="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100/50 space-y-4">
    <div class="flex items-center gap-2 text-emerald-700"><Car class="w-4 h-4" /><span class="text-[10px] font-black uppercase tracking-widest">Ficha Técnica</span></div>

    <div class="grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
      <div class="col-span-2 md:col-span-1">
        <label class="text-[9px] font-bold text-emerald-600 block mb-1 ml-2 uppercase">Placa</label>
        <input :value="form.placa" @input="$emit('update:form', { ...form, placa: $event.target.value })"
          @blur="$emit('blurPlaca')"
          :class="['input input-bordered w-full rounded-xl font-black text-center uppercase border-none shadow-sm', errores.placa ? 'border-red-300 bg-red-50' : '']" />
      </div>
      <div class="col-span-1">
        <label class="text-[9px] font-bold text-emerald-600 block mb-1 ml-2 uppercase truncate">Marca</label>
        <input :value="form.marca" @input="$emit('update:form', { ...form, marca: $event.target.value })"
          class="input input-bordered w-full rounded-xl text-xs font-bold border-none shadow-sm" />
      </div>
      <div class="col-span-1">
        <label class="text-[9px] font-bold text-emerald-600 block mb-1 ml-2 uppercase truncate">Modelo</label>
        <input :value="form.modelo" @input="$emit('update:form', { ...form, modelo: $event.target.value })"
          class="input input-bordered w-full rounded-xl text-xs font-bold border-none shadow-sm" />
      </div>
      <div class="col-span-1">
        <label class="text-[9px] font-bold text-emerald-600 block mb-1 ml-2 uppercase truncate text-center md:text-left">KM</label>
        <input :value="form.kilometraje" @input="$emit('update:form', { ...form, kilometraje: $event.target.value })"
          type="number" class="input input-bordered w-full rounded-xl text-xs font-bold border-none shadow-sm text-center" />
      </div>
      <div class="col-span-1">
        <label class="text-[9px] font-bold text-emerald-600 block mb-1 ml-2 uppercase truncate text-center md:text-left">Horómetro</label>
        <input :value="form.horometro" @input="$emit('update:form', { ...form, horometro: $event.target.value })"
          type="number" class="input input-bordered w-full rounded-xl text-xs font-bold border-none shadow-sm text-center" />
      </div>
    </div>
  </section>
</template>
