<script setup>
import { Edit3, ToggleLeft, ToggleRight, Trash2 } from 'lucide-vue-next';

defineProps({
  usuarios: { type: Array, default: () => [] },
});

defineEmits(['editar', 'toggle', 'eliminar']);
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
    <div
      v-for="u in usuarios"
      :key="u.id"
      class="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group"
      :class="{ 'opacity-50': !u.activo }"
    >
      <div class="flex items-center gap-4 relative z-10">
        <div class="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-lyer-green font-black border border-emerald-100 uppercase">
          {{ u.username.charAt(0) }}
        </div>
        <div class="min-w-0">
          <h4 class="font-black text-slate-800 uppercase text-xs md:text-sm truncate">{{ u.nombreCompleto }}</h4>
          <div class="flex flex-wrap gap-1 mt-1">
            <span class="badge badge-xs font-black bg-lyer-green text-white border-none">{{ u.rol }}</span>
            <span :class="['badge badge-xs font-black border-none', u.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-500']">
              {{ u.activo ? 'ACTIVO' : 'INACTIVO' }}
            </span>
          </div>
        </div>
      </div>
      <div class="mt-6 flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
        <span class="text-[10px] font-black text-slate-700 uppercase tracking-tighter">{{ u.username }}</span>
        <div class="flex gap-1">
          <button @click="$emit('editar', u)" class="btn btn-square btn-ghost btn-xs text-lyer-green">
            <Edit3 class="w-4 h-4"/>
          </button>
          <button @click="$emit('toggle', u)" class="btn btn-square btn-ghost btn-xs text-slate-400">
            <ToggleLeft v-if="u.activo" class="w-4 h-4 text-red-400"/>
            <ToggleRight v-else class="w-4 h-4 text-emerald-500"/>
          </button>
          <button @click="$emit('eliminar', u)" class="btn btn-square btn-ghost btn-xs text-slate-400">
            <Trash2 class="w-4 h-4 text-red-400"/>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
