<script setup>
import { Edit3, ToggleLeft, ToggleRight, Trash2 } from 'lucide-vue-next';

defineProps({
  usuarios: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

defineEmits(['editar', 'toggle', 'eliminar']);

const accionBtn = 'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#4a2870]/50 bg-[#2a1840] transition-colors';
</script>

<template>
  <div v-if="loading" class="py-16 text-center">
    <span class="loading loading-ring loading-md text-lyer-accent" />
  </div>
  <div v-else-if="!usuarios.length" class="py-16 text-center text-sm text-slate-400">
    No hay usuarios.
  </div>
  <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
    <article
      v-for="u in usuarios"
      :key="u.id"
      :class="['rounded-2xl border border-[#4a2870]/45 bg-[#221433]/90 p-5', u.activo ? '' : 'opacity-60']"
    >
      <div class="flex items-center gap-4">
        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-lyer-cyan/30 bg-lyer-cyan/10 font-display text-lg font-bold uppercase text-lyer-cyan">
          {{ u.username.charAt(0) }}
        </div>
        <div class="min-w-0">
          <h4 class="truncate text-sm font-bold uppercase text-white">{{ u.nombreCompleto }}</h4>
          <div class="mt-1.5 flex flex-wrap gap-1.5">
            <span class="rounded-md border border-lyer-accent/40 bg-[#2a0a4a] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-lyer-soft">
              {{ u.rol }}
            </span>
            <span
              :class="[
                'rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider',
                u.activo ? 'border-green-500/40 bg-green-500/15 text-green-300' : 'border-rose-500/40 bg-rose-500/15 text-rose-300',
              ]"
            >
              {{ u.activo ? 'Activo' : 'Inactivo' }}
            </span>
          </div>
        </div>
      </div>
      <div class="mt-4 flex items-center justify-between gap-2 rounded-xl border border-[#4a2870]/40 bg-[#140a22] px-3 py-2.5">
        <div class="min-w-0">
          <p class="font-mono text-[10px] uppercase tracking-wider text-slate-500">Usuario</p>
          <p class="truncate font-mono text-xs font-semibold text-slate-200">{{ u.username }}</p>
        </div>
        <div class="flex shrink-0 gap-1.5">
          <button type="button" :class="[accionBtn, 'text-lyer-cyan hover:border-lyer-cyan/50 hover:bg-lyer-cyan/10']" title="Editar" @click="$emit('editar', u)">
            <Edit3 class="h-4 w-4" />
          </button>
          <button
            type="button"
            :class="[accionBtn, u.activo ? 'text-amber-200 hover:border-amber-400/50 hover:bg-amber-500/10' : 'text-green-300 hover:border-green-400/50 hover:bg-green-500/10']"
            :title="u.activo ? 'Desactivar' : 'Activar'"
            @click="$emit('toggle', u)"
          >
            <ToggleLeft v-if="u.activo" class="h-4 w-4" />
            <ToggleRight v-else class="h-4 w-4" />
          </button>
          <button type="button" :class="[accionBtn, 'text-rose-300 hover:border-rose-400/50 hover:bg-rose-500/10']" title="Eliminar" @click="$emit('eliminar', u)">
            <Trash2 class="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  </div>
</template>
