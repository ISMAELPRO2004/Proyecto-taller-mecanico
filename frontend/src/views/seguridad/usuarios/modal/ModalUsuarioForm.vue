<script setup>
import { ChevronDown, X } from 'lucide-vue-next';
import { campo, etiqueta } from './campoUsuario.js';

defineProps({
  isOpen: { type: Boolean, default: false },
  editando: { type: Boolean, default: false },
  form: { type: Object, required: true },
});

defineEmits(['close', 'guardar', 'update:form']);
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
    <div class="w-full max-w-lg overflow-hidden rounded-2xl border border-[#4a2870]/60 bg-[#160a24] text-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
      <div class="h-1 w-full bg-gradient-to-r from-lyer-green via-lyer-accent to-lyer-cyan" />

      <header class="flex items-center justify-between gap-3 border-b border-[#4a2870]/50 bg-[#10041f] px-5 py-4 sm:px-6">
        <h3 class="font-display text-lg font-bold uppercase tracking-tight text-white">
          {{ editando ? 'Editar perfil' : 'Nuevo acceso' }}
        </h3>
        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center rounded-xl border border-[#4a2870]/50 bg-[#140a22] text-slate-400 hover:text-white"
          @click="$emit('close')"
        >
          <X class="h-4 w-4" />
        </button>
      </header>

      <div class="space-y-4 px-5 py-5 sm:px-6">
        <label class="block space-y-1.5">
          <span :class="etiqueta">Nombre y apellido</span>
          <input
            :value="form.nombreCompleto"
            type="text"
            :class="campo"
            @input="$emit('update:form', { ...form, nombreCompleto: $event.target.value })"
          />
        </label>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label class="block space-y-1.5">
            <span :class="etiqueta">Usuario</span>
            <input
              :value="form.username"
              type="text"
              :class="[campo, 'font-mono']"
              @input="$emit('update:form', { ...form, username: $event.target.value })"
            />
          </label>
          <label class="block space-y-1.5">
            <span :class="etiqueta">Rol</span>
            <span class="relative block">
              <select
                :value="form.rol"
                :class="[campo, 'appearance-none pr-10']"
                @change="$emit('update:form', { ...form, rol: $event.target.value })"
              >
                <option value="ADMIN">Administrador</option>
                <option value="SUPERVISOR">Supervisor</option>
                <option value="TECNICO">Técnico</option>
                <option value="RECEPCIONISTA">Recepcionista</option>
              </select>
              <ChevronDown class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </span>
          </label>
        </div>

        <label class="block space-y-1.5">
          <span :class="etiqueta">Contraseña</span>
          <input
            :value="form.password"
            type="password"
            :placeholder="editando ? 'Solo si quieres cambiarla' : 'Mínimo 6 caracteres'"
            autocomplete="off"
            :class="campo"
            @input="$emit('update:form', { ...form, password: $event.target.value })"
          />
          <span v-if="editando" class="block text-xs text-amber-200">Déjala en blanco para mantener la contraseña actual.</span>
        </label>
      </div>

      <footer class="flex items-center justify-end gap-2 border-t border-[#4a2870]/50 bg-[#10041f] px-5 py-4 sm:px-6">
        <button
          type="button"
          class="rounded-xl border border-[#4a2870]/60 bg-[#140a22] px-5 py-2.5 text-sm text-slate-300 hover:text-white"
          @click="$emit('close')"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="rounded-xl border border-lyer-accent/40 bg-[#2a0a4a] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#3a1260]"
          @click="$emit('guardar')"
        >
          {{ editando ? 'Guardar cambios' : 'Crear usuario' }}
        </button>
      </footer>
    </div>
  </div>
</template>
