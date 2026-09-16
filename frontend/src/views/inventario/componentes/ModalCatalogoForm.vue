<script setup>
import { X } from 'lucide-vue-next';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  editando: { type: Boolean, default: false },
  form: { type: Object, required: true },
  nombreTabActiva: { type: String, default: '' },
  mostrarResponsable: { type: Boolean, default: false },
});

const emit = defineEmits(['close', 'guardar', 'update:form']);

const actualizar = (campo, valor) => {
  emit('update:form', { ...props.form, [campo]: valor });
};
</script>

<template>
  <div :class="['modal modal-bottom sm:modal-middle', { 'modal-open': isOpen }]">
    <div class="modal-box p-0 overflow-hidden border-t-8 border-lyer-green rounded-3xl shadow-2xl">
      <div class="p-6 bg-slate-50 border-b flex justify-between items-center">
        <h3 class="font-black text-lg text-slate-800 uppercase italic">
          {{ editando ? 'Editar' : 'Nuevo' }} {{ nombreTabActiva.toLowerCase() }}
        </h3>
        <button @click="emit('close')" class="btn btn-circle btn-ghost btn-sm text-slate-400">
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="p-8 space-y-6">
        <div class="form-control">
          <label class="label"><span class="label-text font-black text-slate-400 uppercase text-[10px]">Descripción
              del Ítem</span></label>
          <input :value="form.descripcion" @input="actualizar('descripcion', $event.target.value)" type="text"
            placeholder="Ej: Aceite de Motor 15W40"
            class="input input-bordered w-full bg-slate-50 border-slate-200 focus:border-lyer-accent rounded-xl font-bold" />
        </div>
        <div v-if="mostrarResponsable" class="form-control">
          <label class="label"><span class="label-text font-black text-slate-400 uppercase text-[10px]">Responsable
              del tercero</span></label>
          <input :value="form.responsable" @input="actualizar('responsable', $event.target.value)" type="text"
            placeholder="Empresa o persona que realiza el servicio"
            class="input input-bordered w-full bg-slate-50 border-slate-200 focus:border-lyer-accent rounded-xl font-bold" />
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text font-black text-slate-400 uppercase text-[10px]">Precio
              Sugerido (S/)</span></label>
          <div class="relative">
            <input :value="form.precioBase" @input="actualizar('precioBase', $event.target.value)" type="number"
              step="0.01"
              class="input input-bordered w-full bg-slate-50 border-slate-200 focus:border-lyer-accent rounded-xl font-black" />
          </div>
          <label class="label"><span class="label-text-alt opacity-50 italic">Este precio aparecerá por defecto en las
              nuevas órdenes.</span></label>
        </div>
      </div>

      <div class="p-6 bg-slate-50 border-t flex justify-end gap-3">
        <button @click="emit('close')" class="btn btn-ghost font-bold text-slate-400">Cancelar</button>
        <button @click="emit('guardar')"
          class="btn bg-lyer-green text-white border-none px-8 rounded-xl shadow-lg hover:bg-emerald-900 transition-all">
          {{ editando ? 'Guardar Cambios' : 'Registrar Ítem' }}
        </button>
      </div>
    </div>
  </div>
</template>
