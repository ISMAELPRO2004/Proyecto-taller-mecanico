<script setup>
import { User } from 'lucide-vue-next';

defineProps({
  form: { type: Object, required: true },
  errores: { type: Object, default: () => ({}) },
});

defineEmits(['update:form']);
</script>

<template>
  <section class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
    <div class="flex items-center gap-2 text-lyer-green"><User class="w-4 h-4" /><span class="text-[10px] font-black uppercase tracking-widest">Propietario</span></div>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="md:col-span-1">
        <input :value="form.clienteNombre" @input="$emit('update:form', { ...form, clienteNombre: $event.target.value })"
          placeholder="Nombre completo"
          :class="['input input-bordered w-full rounded-xl font-bold bg-slate-50 border-none', errores.clienteNombre ? 'border-red-300 bg-red-50' : '']" />
      </div>
      <div class="md:col-span-1">
        <input :value="form.clienteCelular" @input="$emit('update:form', { ...form, clienteCelular: $event.target.value })"
          placeholder="Celular" maxlength="9"
          class="input input-bordered w-full rounded-xl font-bold bg-slate-50 border-none" />
      </div>
      <div class="md:col-span-2">
        <textarea :value="form.trabajoSolicitado" @input="$emit('update:form', { ...form, trabajoSolicitado: $event.target.value })"
          placeholder="Falla reportada..."
          class="textarea textarea-bordered w-full rounded-xl text-sm font-medium bg-slate-50 border-none min-h-[48px] h-[48px] focus:h-24 transition-all"></textarea>
      </div>
    </div>
  </section>
</template>
