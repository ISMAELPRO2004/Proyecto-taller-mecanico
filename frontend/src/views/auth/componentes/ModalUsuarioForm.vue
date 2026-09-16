<script setup>
import { X, Key } from 'lucide-vue-next';

defineProps({
  isOpen: { type: Boolean, default: false },
  editando: { type: Boolean, default: false },
  form: { type: Object, required: true },
});

defineEmits(['close', 'guardar', 'update:form']);
</script>

<template>
  <div :class="['modal modal-bottom sm:modal-middle', { 'modal-open': isOpen }]">
    <div class="modal-box p-0 overflow-hidden border-t-8 border-lyer-green rounded-[3rem] shadow-2xl">
      <div class="p-8 bg-slate-50 border-b flex justify-between items-center">
        <h3 class="font-black text-xl text-slate-800 uppercase italic tracking-tighter">
          {{ editando ? 'Editar Perfil' : 'Nuevo Acceso al Sistema' }}
        </h3>
        <button @click="$emit('close')" class="btn btn-circle btn-ghost btn-sm text-slate-300 hover:text-red-500">
          <X class="w-6 h-6" />
        </button>
      </div>
      <div class="p-10 space-y-6">
        <div class="form-control">
          <label class="label">
            <span class="label-text font-black text-slate-400 uppercase text-[9px] tracking-widest">Nombre y Apellido</span>
          </label>
          <input
            :value="form.nombreCompleto"
            @input="$emit('update:form', { ...form, nombreCompleto: $event.target.value })"
            type="text"
            class="input input-bordered w-full bg-slate-50 rounded-2xl font-bold border-slate-100 focus:border-lyer-accent"
          />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-black text-slate-400 uppercase text-[9px] tracking-widest">Username</span>
            </label>
            <input
              :value="form.username"
              @input="$emit('update:form', { ...form, username: $event.target.value })"
              type="text"
              class="input input-bordered w-full bg-slate-50 rounded-2xl font-bold border-slate-100 focus:border-lyer-accent"
            />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text font-black text-slate-400 uppercase text-[9px] tracking-widest">Privilegios</span>
            </label>
            <select
              :value="form.rol"
              @change="$emit('update:form', { ...form, rol: $event.target.value })"
              class="select select-bordered w-full bg-slate-50 rounded-2xl font-bold border-slate-100 focus:border-lyer-accent"
            >
              <option value="ADMIN">ADMINISTRADOR</option>
              <option value="SUPERVISOR">SUPERVISOR</option>
              <option value="TECNICO">TÉCNICO</option>
              <option value="RECEPCIONISTA">RECEPCIONISTA</option>
            </select>
          </div>
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text font-black text-slate-400 uppercase text-[9px] tracking-widest">Contraseña</span>
          </label>
          <div class="relative">
            <Key class="absolute left-4 top-3.5 w-4 h-4 text-slate-300" />
            <input
              :value="form.password"
              @input="$emit('update:form', { ...form, password: $event.target.value })"
              type="password"
              placeholder="••••••••"
              class="input input-bordered w-full pl-12 bg-slate-50 rounded-2xl font-bold border-slate-100 focus:border-lyer-accent"
            />
          </div>
          <p
            v-if="editando"
            class="text-[10px] text-slate-400 italic mt-3 bg-amber-50 p-2 rounded-lg text-center font-medium"
          >
            Dejar en blanco para mantener la contraseña actual.
          </p>
        </div>
      </div>
      <div class="p-8 bg-slate-50 border-t flex justify-end gap-3">
        <button @click="$emit('close')" class="btn btn-ghost font-black text-slate-400 uppercase text-xs">
          Cancelar
        </button>
        <button
          @click="$emit('guardar')"
          class="btn bg-lyer-green text-white border-none px-10 rounded-[1.5rem] shadow-xl hover:bg-emerald-900 transition-all hover:scale-105 font-black uppercase text-xs"
        >
          {{ editando ? 'Guardar Cambios' : 'Crear Usuario' }}
        </button>
      </div>
    </div>
  </div>
</template>
