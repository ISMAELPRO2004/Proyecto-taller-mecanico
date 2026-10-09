<script setup>
import { Package, Wrench, ExternalLink, Trash2 } from 'lucide-vue-next';

const props = defineProps({
  titulo: { type: String, required: true },
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
</script>

<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center gap-3 border-b border-slate-50 pb-2">
      <div class="flex items-center gap-2 min-w-0" :class="azul ? 'text-blue-400' : 'text-slate-400'">
        <component :is="iconoCmp" class="w-4 h-4 shrink-0" />
        <span class="text-[10px] font-black uppercase tracking-widest truncate">{{ titulo }}</span>
      </div>
      <button
        type="button"
        @click="$emit('add')"
        :class="[
          'btn btn-xs px-4 rounded-lg shrink-0',
          solido ? 'bg-lyer-green text-white border-none' : '',
          !solido && azul ? 'btn-outline border-blue-100 text-blue-400' : '',
          !solido && !azul ? 'btn-outline border-slate-200 text-slate-400' : '',
        ]"
      >
        {{ textoBoton }}
      </button>
    </div>

    <div class="space-y-3">
      <div
        v-for="(item, i) in items"
        :key="i"
        :class="[
          'flex flex-col md:flex-row md:items-center gap-3 p-4 rounded-2xl border relative',
          azul ? 'bg-blue-50/20 border-blue-50' : 'bg-slate-50/50 border-transparent md:border-slate-50',
        ]"
      >
        <div class="flex-1 min-w-0 pr-8 md:pr-0">
          <span :class="['text-[11px] font-black uppercase leading-tight', azul ? 'text-blue-900 italic font-bold' : 'text-slate-700']">
            {{ item.descripcion }}
          </span>
          <p v-if="azul && item.responsable" class="text-[10px] text-blue-400 font-bold">
            Responsable: {{ item.responsable }}
          </p>
          <button type="button" @click="$emit('remove', i)" class="absolute top-4 right-4 md:hidden text-red-300">
            <Trash2 class="w-4 h-4" />
          </button>
        </div>

        <div class="flex flex-wrap items-center gap-3 md:justify-end">
          <div v-if="conCantidad" class="w-16">
            <label class="text-[8px] font-black text-slate-400 block mb-1 uppercase">Cant.</label>
            <input v-model="item.cantidad" type="number" class="input input-xs w-full text-center font-black bg-white rounded-lg border-slate-200" />
          </div>
          <div v-if="verPrecios" class="w-full min-w-0 sm:w-32">
            <label class="text-[8px] font-black text-slate-400 block mb-1 uppercase">
              {{ conCantidad ? 'P.U. S/' : 'Monto' }}
            </label>
            <div :class="['flex items-center gap-1 bg-white px-3 py-1 rounded-lg border shadow-sm', azul ? 'border-blue-100' : 'border-slate-100']">
              <span v-if="!conCantidad" :class="['text-[9px] font-bold', azul ? 'text-blue-200' : 'text-slate-300']">S/</span>
              <input
                v-model="item[campoMonto]"
                type="number"
                step="0.01"
                :class="['w-full bg-transparent font-black text-xs outline-none', conCantidad ? 'text-lyer-green' : azul ? 'text-blue-700 text-right' : 'text-slate-800 text-right']"
              />
            </div>
          </div>
          <div v-if="verPrecios && conCantidad" class="w-24 text-right hidden md:block">
            <label class="text-[8px] font-black text-slate-400 block mb-1 uppercase">Subtotal</label>
            <span class="text-xs font-black text-slate-800">S/{{ subtotal(item) }}</span>
          </div>
          <button type="button" @click="$emit('remove', i)" class="hidden md:block text-red-200 hover:text-red-500">
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
