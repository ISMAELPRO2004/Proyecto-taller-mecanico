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
  <tr
    :class="['h-[68px] transition-colors hover:bg-white/5', item.precioBase == null ? 'bg-amber-500/5' : '']"
  >
    <td class="px-6 py-3">
      <div class="flex items-center gap-3">
        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#4a2870]/50 bg-[#140a22] text-slate-400">
          <component :is="Icono" class="h-4 w-4" />
        </div>
        <div class="min-w-0">
          <p class="font-semibold capitalize text-white">{{ item.descripcion }}</p>
          <p v-if="tabActiva === 'terceros' && item.responsable" class="text-xs text-slate-400">{{ item.responsable }}</p>
        </div>
      </div>
    </td>
    <td class="px-4 py-3 text-right font-mono text-sm font-bold">
      <template v-if="precio">
        <span class="mr-1 text-[10px] font-medium text-slate-400">S/</span>
        <span class="text-lyer-cyan">{{ precio }}</span>
      </template>
      <span v-else class="text-xs font-bold uppercase tracking-wider text-amber-300">Sin precio</span>
    </td>
    <td class="px-6 py-3">
      <AccionesCatalogo
        compacta
        :item="item"
        @editar="$emit('editar', $event)"
        @eliminar="$emit('eliminar', $event)"
      />
    </td>
  </tr>
</template>
