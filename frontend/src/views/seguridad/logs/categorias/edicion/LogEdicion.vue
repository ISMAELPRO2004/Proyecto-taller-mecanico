<script setup>
import { computed } from 'vue';
import { PlusCircle, Trash2, RefreshCcw, ArrowRight, Package, Wrench, ExternalLink } from 'lucide-vue-next';
import { MOVIMIENTO } from '../../../../../utils/movimientoLog.js';

const props = defineProps({
  cabecera: { type: Array, default: () => [] },
  listas: { type: Array, default: () => [] },
  campoLabel: Function,
  formatVal: Function,
});

const claveItem = (accion) => {
  if (accion === 'AÑADIDO') return 'creado';
  if (accion === 'ELIMINADO') return 'eliminado';
  return 'modificado';
};

const bloques = computed(() => {
  const mapa = { creado: [], modificado: [], eliminado: [] };
  for (const lista of props.listas) {
    for (const item of lista.items || []) {
      mapa[claveItem(item.accion)].push({ ...item, lista: lista.nombre, icono: lista.icono });
    }
  }
  return ['creado', 'modificado', 'eliminado']
    .filter((clave) => mapa[clave].length)
    .map((clave) => ({ clave, ...MOVIMIENTO[clave], items: mapa[clave] }));
});

const iconoDe = (icono) => (icono === 'wrench' ? Wrench : icono === 'external' ? ExternalLink : Package);
</script>

<template>
  <div class="space-y-6">
    <div v-if="cabecera.length" class="space-y-3">
      <div class="flex items-center gap-2 text-amber-200">
        <RefreshCcw class="h-4 w-4" />
        <span class="font-mono text-[11px] font-bold uppercase tracking-widest">Modificado</span>
      </div>
      <div v-for="[key, val] in cabecera" :key="key" class="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
        <p class="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-200">{{ campoLabel(key) }}</p>
        <div class="mt-2 flex flex-wrap items-center gap-2 text-sm font-semibold">
          <span class="text-lyer-muted line-through">{{ formatVal(key, val.de) }}</span>
          <ArrowRight class="h-3.5 w-3.5 shrink-0 text-amber-200" />
          <span class="text-lyer-fg">{{ formatVal(key, val.a) }}</span>
        </div>
      </div>
    </div>

    <div v-for="bloque in bloques" :key="bloque.clave" class="space-y-3">
      <div v-if="bloque.clave !== 'modificado' || !cabecera.length" class="flex items-center gap-2" :class="bloque.tono">
        <PlusCircle v-if="bloque.clave === 'creado'" class="h-4 w-4" />
        <Trash2 v-else-if="bloque.clave === 'eliminado'" class="h-4 w-4" />
        <RefreshCcw v-else class="h-4 w-4" />
        <span class="font-mono text-[11px] font-bold uppercase tracking-widest">{{ bloque.label }}</span>
      </div>
      <article
        v-for="(item, i) in bloque.items"
        :key="bloque.clave + i"
        :class="['rounded-xl border p-4', bloque.tono]"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="font-mono text-[10px] uppercase tracking-wider text-lyer-muted">{{ item.lista }}</p>
            <p class="mt-1 flex items-center gap-2 text-sm font-semibold text-lyer-fg">
              <component :is="iconoDe(item.icono)" class="h-4 w-4 shrink-0 text-lyer-muted" />
              {{ item.descripcion }}
            </p>
          </div>
          <span :class="['shrink-0 rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider', bloque.tono]">
            {{ bloque.label }}
          </span>
        </div>
        <div v-if="item.accion === 'MODIFICADO'" class="mt-3 space-y-1.5">
          <div v-for="campo in ['cantidad', 'precio', 'monto']" :key="campo">
            <div v-if="item[campo]" class="flex flex-wrap items-center gap-2 text-xs font-semibold text-lyer-muted">
              <span class="w-16 capitalize text-lyer-muted">{{ campo }}</span>
              <span class="line-through">{{ item[campo].de }}</span>
              <ArrowRight class="h-3 w-3 text-amber-200" />
              <span class="text-lyer-fg">{{ item[campo].a }}</span>
            </div>
          </div>
        </div>
        <div v-if="item.accion === 'AÑADIDO' && item.datos" class="mt-2 flex flex-wrap gap-3 font-mono text-xs text-lyer-muted">
          <span v-if="item.datos.cantidad">Cantidad: {{ item.datos.cantidad }}</span>
          <span v-if="item.datos.precio">Precio: S/ {{ item.datos.precio }}</span>
          <span v-if="item.datos.monto">Monto: S/ {{ item.datos.monto }}</span>
        </div>
      </article>
    </div>

    <p v-if="!cabecera.length && !bloques.length" class="py-8 text-center text-sm text-lyer-muted">
      Sin cambios registrados
    </p>
  </div>
</template>
