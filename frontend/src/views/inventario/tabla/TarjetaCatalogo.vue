<script setup>
import { computed } from 'vue';
import AccionesCatalogo from './AccionesCatalogo.vue';
import { iconoCategoria, precioTexto } from './catalogoTabla.js';

const props = defineProps({
  item: { type: Object, required: true },
  tabActiva: { type: String, required: true },
});

defineEmits(['editar', 'eliminar']);

const Icono = computed(() => iconoCategoria(props.tabActiva));
const precio = computed(() => precioTexto(props.item));
</script>

<template>
  <article :class="['space-y-3 p-4', item.precioBase == null ? 'bg-amber-500/5' : '']">
    <div class="flex items-start gap-3">
      <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-lyer-linea/50 bg-lyer-fondo text-lyer-muted">
        <component :is="Icono" class="h-4 w-4" />
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-sm font-semibold capitalize leading-snug text-lyer-fg">{{ item.descripcion }}</p>
        <p v-if="tabActiva === 'terceros' && item.responsable" class="mt-0.5 text-xs text-lyer-muted">{{ item.responsable }}</p>
        <p class="mt-1 font-mono text-sm font-bold text-lyer-cyan">
          <template v-if="precio">S/ {{ precio }}</template>
          <span v-else class="text-xs font-bold uppercase tracking-wider text-amber-300">Sin precio</span>
        </p>
      </div>
    </div>
    <AccionesCatalogo
      :item="item"
      @editar="$emit('editar', $event)"
      @eliminar="$emit('eliminar', $event)"
    />
  </article>
</template>
