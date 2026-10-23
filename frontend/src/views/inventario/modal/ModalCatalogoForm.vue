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
  <div v-if="isOpen" class="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
    <div class="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[#4a2870]/60 bg-[#160a24] text-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
      <div class="h-1 w-full bg-gradient-to-r from-lyer-green via-lyer-accent to-lyer-cyan" />

      <header class="flex items-center justify-between gap-3 border-b border-[#4a2870]/50 bg-[#10041f] px-5 py-4 sm:px-6">
        <h3 class="font-display text-lg font-bold uppercase tracking-tight text-white">
          {{ editando ? 'Editar' : 'Nuevo' }} {{ nombreTabActiva.toLowerCase() }}
        </h3>
        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center rounded-xl border border-[#4a2870]/50 bg-[#140a22] text-slate-400 hover:text-white"
          @click="emit('close')"
        >
          <X class="h-4 w-4" />
        </button>
      </header>

      <div class="space-y-4 px-5 py-5 sm:px-6">
        <label class="block space-y-1.5">
          <span class="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">Descripción del ítem</span>
          <input
            :value="form.descripcion"
            type="text"
            placeholder="Ej: Aceite de Motor 15W40"
            class="w-full rounded-xl border border-[#4a2870]/70 bg-[#10041f] px-4 py-3 text-sm font-semibold text-white placeholder:text-slate-500 focus:border-lyer-cyan/70 focus:outline-none"
            @input="actualizar('descripcion', $event.target.value)"
          />
        </label>

        <label v-if="mostrarResponsable" class="block space-y-1.5">
          <span class="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">Responsable del tercero</span>
          <input
            :value="form.responsable"
            type="text"
            placeholder="Empresa o persona que realiza el servicio"
            class="w-full rounded-xl border border-[#4a2870]/70 bg-[#10041f] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-lyer-cyan/70 focus:outline-none"
            @input="actualizar('responsable', $event.target.value)"
          />
        </label>

        <label class="block space-y-1.5">
          <span class="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">Precio sugerido (S/)</span>
          <span class="relative block">
            <span class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm font-bold text-slate-400">S/</span>
            <input
              :value="form.precioBase"
              type="number"
              step="0.01"
              class="w-full rounded-xl border border-[#4a2870]/70 bg-[#10041f] py-3 pl-11 pr-4 font-mono text-base font-bold text-white focus:border-lyer-cyan/70 focus:outline-none"
              @input="actualizar('precioBase', $event.target.value)"
            />
          </span>
          <span class="block text-xs text-slate-500">Este precio aparecerá por defecto en las nuevas órdenes.</span>
        </label>
      </div>

      <footer class="flex items-center justify-end gap-2 border-t border-[#4a2870]/50 bg-[#10041f] px-5 py-4 sm:px-6">
        <button
          type="button"
          class="rounded-xl border border-[#4a2870]/60 bg-[#140a22] px-5 py-2.5 text-sm text-slate-300 hover:text-white"
          @click="emit('close')"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="rounded-xl border border-lyer-accent/40 bg-[#2a0a4a] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#3a1260]"
          @click="emit('guardar')"
        >
          {{ editando ? 'Guardar cambios' : 'Registrar ítem' }}
        </button>
      </footer>
    </div>
  </div>
</template>
