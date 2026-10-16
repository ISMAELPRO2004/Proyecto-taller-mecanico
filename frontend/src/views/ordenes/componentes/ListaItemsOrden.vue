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
  <section class="overflow-hidden rounded-2xl border border-[#4a2870]/45 bg-[#221433]/90 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-[#4a2870]/40 px-5 py-3.5">
      <div class="flex items-center gap-3">
        <div :class="['flex h-8 w-8 items-center justify-center rounded-lg border border-[#4a2870]/50 bg-[#140a22]', tono]">
          <component :is="iconoCmp" class="h-4 w-4" />
        </div>
        <div>
          <h3 class="font-display text-xs font-bold uppercase tracking-wider text-white">{{ titulo }}</h3>
          <p class="text-[11px] text-slate-400">
            {{ detalle || (items.length ? `${items.length} en la orden` : 'Nada cargado todavía') }}
          </p>
        </div>
      </div>
      <button
        type="button"
        :class="[
          'inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold uppercase tracking-wider',
          solido
            ? 'border border-lyer-accent/40 bg-[#2a0a4a] text-white hover:bg-[#3a1260]'
            : 'border border-[#4a2870]/50 bg-[#2a1840] text-slate-200 hover:text-white',
        ]"
        @click="$emit('add')"
      >
        {{ textoBoton }}
      </button>
    </div>

    <p v-if="!items.length" class="px-5 py-6 text-sm text-slate-500">Todavía no hay ítems en esta lista.</p>

    <div v-else class="overflow-x-auto">
      <table class="w-full min-w-[36rem] text-left">
        <thead class="border-b border-[#4a2870]/40 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          <tr>
            <th class="px-4 py-2.5">Descripción</th>
            <th v-if="conCantidad" class="px-4 py-2.5 text-center">Cant.</th>
            <th v-if="verPrecios" class="px-4 py-2.5 text-right">{{ conCantidad ? 'P. unitario' : 'Monto' }}</th>
            <th v-if="verPrecios && conCantidad" class="px-4 py-2.5 text-right">Subtotal</th>
            <th class="w-16 px-4 py-2.5 text-center">Quitar</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#4a2870]/30 text-sm text-slate-200">
          <tr v-for="(item, i) in items" :key="i" class="hover:bg-[#2a1840]/50">
            <td class="px-4 py-3">
              <p class="font-medium text-white">{{ item.descripcion }}</p>
              <p v-if="item.responsable" class="mt-0.5 text-[11px] text-slate-400">{{ item.responsable }}</p>
            </td>
            <td v-if="conCantidad" class="px-4 py-3 text-center">
              <input
                v-model="item.cantidad"
                type="number"
                min="0"
                step="0.01"
                class="h-9 w-20 rounded-lg border border-[#4a2870]/50 bg-[#140a22] text-center font-mono text-xs text-white focus:border-lyer-cyan focus:outline-none"
              />
            </td>
            <td v-if="verPrecios" class="px-4 py-3 text-right">
              <input
                v-model="item[campoMonto]"
                type="number"
                min="0"
                step="0.01"
                class="h-9 w-28 rounded-lg border border-[#4a2870]/50 bg-[#140a22] px-2 text-right font-mono text-xs text-white focus:border-lyer-cyan focus:outline-none"
              />
            </td>
            <td v-if="verPrecios && conCantidad" class="px-4 py-3 text-right font-mono text-sm font-semibold text-lyer-soft">
              S/ {{ subtotal(item) }}
            </td>
            <td class="px-4 py-3 text-center">
              <button
                type="button"
                class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-500/15 hover:text-rose-300"
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

    <div v-if="verPrecios && items.length" class="flex items-center justify-end gap-3 border-t border-[#4a2870]/40 bg-[#140a22]/80 px-5 py-2.5 font-mono text-xs">
      <span class="uppercase tracking-wider text-slate-400">Total</span>
      <span :class="['text-sm font-bold', tono]">
        S/ {{ items.reduce((acc, item) => acc + (conCantidad ? Number(item.cantidad || 0) * Number(item[campoMonto] || 0) : Number(item[campoMonto] || 0)), 0).toFixed(2) }}
      </span>
    </div>
  </section>
</template>
