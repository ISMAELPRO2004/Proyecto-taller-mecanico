<script setup>
import { Package, Wrench, ExternalLink, Trash2 } from 'lucide-vue-next';

const props = defineProps({
  titulo: { type: String, required: true },
  detalle: { type: String, default: '' },
  items: { type: Array, required: true },
  verPrecios: { type: Boolean, default: true },
  textoBoton: { type: String, default: '+ Añadir' },
  solido: { type: Boolean, default: false },
  azul: { type: Boolean, default: false },
  conCantidad: { type: Boolean, default: false },
  campoMonto: { type: String, default: 'monto' },
  icono: { type: String, default: 'package' },
});

defineEmits(['add', 'remove']);

const iconos = { package: Package, wrench: Wrench, external: ExternalLink };
const iconoCmp = iconos[props.icono] || Package;

const subtotal = (item) => (Number(item.cantidad) * Number(item[props.campoMonto] || 0)).toFixed(2);

const tono = props.azul ? 'text-amber-300' : props.solido ? 'text-lyer-soft' : 'text-lyer-cyan';
</script>

<template>
  <section class="overflow-hidden rounded-2xl border border-lyer-linea/45 bg-lyer-card/90 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-lyer-linea/40 px-5 py-3.5">
      <div class="flex items-center gap-3">
        <div :class="['flex h-8 w-8 items-center justify-center rounded-lg border border-lyer-linea/50 bg-lyer-fondo', tono]">
          <component :is="iconoCmp" class="h-4 w-4" />
        </div>
        <div>
          <h3 class="font-display text-xs font-bold uppercase tracking-wider text-lyer-fg">{{ titulo }}</h3>
          <p class="text-[11px] text-lyer-muted">
            {{ detalle || (items.length ? `${items.length} en la orden` : 'Nada cargado todavía') }}
          </p>
        </div>
      </div>
      <button
        type="button"
        :class="[
          'inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold uppercase tracking-wider',
          solido
            ? 'border border-lyer-accent/40 bg-lyer-boton text-lyer-fg hover:bg-lyer-boton'
            : 'border border-lyer-linea/50 bg-lyer-hover text-lyer-fg hover:text-lyer-fg',
        ]"
        @click="$emit('add')"
      >
        {{ textoBoton }}
      </button>
    </div>

    <p v-if="!items.length" class="px-5 py-6 text-sm text-slate-500">Todavía no hay ítems en esta lista.</p>

    <div v-else class="overflow-x-auto">
      <table class="w-full min-w-[36rem] text-left">
        <thead class="border-b border-lyer-linea/40 text-[10px] font-semibold uppercase tracking-wider text-lyer-muted">
          <tr>
            <th class="px-4 py-2.5">Descripción</th>
            <th v-if="conCantidad" class="px-4 py-2.5 text-center">Cant.</th>
            <th v-if="verPrecios" class="px-4 py-2.5 text-right">{{ conCantidad ? 'P. unitario' : 'Monto' }}</th>
            <th v-if="verPrecios && conCantidad" class="px-4 py-2.5 text-right">Subtotal</th>
            <th class="w-16 px-4 py-2.5 text-center">Quitar</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-lyer-linea/30 text-sm text-lyer-fg">
          <tr v-for="(item, i) in items" :key="i" class="hover:bg-lyer-hover/50">
            <td class="px-4 py-3">
              <p class="font-medium text-lyer-fg">{{ item.descripcion }}</p>
              <p v-if="item.responsable" class="mt-0.5 text-[11px] text-lyer-muted">{{ item.responsable }}</p>
            </td>
            <td v-if="conCantidad" class="px-4 py-3 text-center">
              <input
                v-model="item.cantidad"
                type="number"
                min="0"
                step="0.01"
                class="h-9 w-20 rounded-lg border border-lyer-linea/50 bg-lyer-fondo text-center font-mono text-xs text-lyer-fg focus:border-lyer-cyan focus:outline-none"
              />
            </td>
            <td v-if="verPrecios" class="px-4 py-3 text-right">
              <input
                v-model="item[campoMonto]"
                type="number"
                min="0"
                step="0.01"
                class="h-9 w-28 rounded-lg border border-lyer-linea/50 bg-lyer-fondo px-2 text-right font-mono text-xs text-lyer-fg focus:border-lyer-cyan focus:outline-none"
              />
            </td>
            <td v-if="verPrecios && conCantidad" class="px-4 py-3 text-right font-mono text-sm font-semibold text-lyer-soft">
              S/ {{ subtotal(item) }}
            </td>
            <td class="px-4 py-3 text-center">
              <button
                type="button"
                class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-lyer-muted hover:bg-rose-500/15 hover:text-rose-300"
                title="Quitar"
                @click="$emit('remove', i)"
              >
                <Trash2 class="h-4 w-4" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="verPrecios && items.length" class="flex items-center justify-end gap-3 border-t border-lyer-linea/40 bg-lyer-fondo/80 px-5 py-2.5 font-mono text-xs">
      <span class="uppercase tracking-wider text-lyer-muted">Total</span>
      <span :class="['text-sm font-bold', tono]">
        S/ {{ items.reduce((acc, item) => acc + (conCantidad ? Number(item.cantidad || 0) * Number(item[campoMonto] || 0) : Number(item[campoMonto] || 0)), 0).toFixed(2) }}
      </span>
    </div>
  </section>
</template>
