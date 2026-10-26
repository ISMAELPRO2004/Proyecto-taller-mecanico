<script setup>
import AccionesUsuario from './AccionesUsuario.vue';

defineProps({
  usuario: { type: Object, required: true },
});

defineEmits(['editar', 'toggle', 'eliminar']);
</script>

<template>
  <article :class="['rounded-2xl border border-lyer-linea/45 bg-lyer-card/90 p-5', usuario.activo ? '' : 'opacity-60']">
    <div class="flex items-center gap-4">
      <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-lyer-cyan/30 bg-lyer-cyan/10 font-display text-lg font-bold uppercase text-lyer-cyan">
        {{ (usuario.nombreUsuario || '?').charAt(0) }}
      </div>
      <div class="min-w-0">
        <h4 class="truncate text-sm font-bold uppercase text-lyer-fg">{{ usuario.nombreCompleto }}</h4>
        <div class="mt-1.5 flex flex-wrap gap-1.5">
          <span class="rounded-md border border-lyer-accent/40 bg-lyer-boton px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-lyer-soft">
            {{ usuario.rol }}
          </span>
          <span
            :class="[
              'rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider',
              usuario.activo ? 'border-green-500/40 bg-green-500/15 text-green-300' : 'border-rose-500/40 bg-rose-500/15 text-rose-300',
            ]"
          >
            {{ usuario.activo ? 'Activo' : 'Inactivo' }}
          </span>
        </div>
      </div>
    </div>
    <div class="mt-4 flex items-center justify-between gap-2 rounded-xl border border-lyer-linea/40 bg-lyer-fondo px-3 py-2.5">
      <div class="min-w-0">
        <p class="font-mono text-[10px] uppercase tracking-wider text-slate-500">Usuario</p>
        <p class="truncate font-mono text-xs font-semibold text-lyer-fg">{{ usuario.nombreUsuario }}</p>
      </div>
      <AccionesUsuario
        :usuario="usuario"
        @editar="$emit('editar', $event)"
        @toggle="$emit('toggle', $event)"
        @eliminar="$emit('eliminar', $event)"
      />
    </div>
  </article>
</template>
