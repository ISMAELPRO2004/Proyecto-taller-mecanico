<script setup>
import { Package, Wrench, Truck, Edit3, Trash2 } from 'lucide-vue-next';

defineProps({
  items: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  tabActiva: { type: String, required: true },
  filasVacias: { type: Number, default: 0 },
});

defineEmits(['editar', 'eliminar']);
</script>

<template>
  <!-- ── VISTA MÓVIL: tarjetas ── -->
  <div class="md:hidden rounded-2xl border border-slate-100 overflow-hidden divide-y divide-slate-100">
    <div v-if="loading" class="py-16 text-center">
      <span class="loading loading-ring loading-md text-lyer-green" />
    </div>
    <div v-for="item in items" :key="'m-' + item.id"
      class="p-4 space-y-3 hover:bg-emerald-50/20 transition-colors">
      <div class="flex items-start gap-3">
        <div class="p-2.5 bg-slate-100 rounded-xl shrink-0">
          <Package v-if="tabActiva === 'materiales'" class="w-4 h-4 text-slate-400" />
          <Wrench v-else-if="tabActiva === 'servicios'" class="w-4 h-4 text-slate-400" />
          <Truck v-else class="w-4 h-4 text-slate-400" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="font-bold text-slate-700 capitalize text-sm leading-snug">{{ item.descripcion }}</p>
          <p v-if="tabActiva === 'terceros' && item.responsable" class="text-[11px] text-slate-400 font-bold">{{ item.responsable }}</p>
          <p class="font-black text-lyer-green text-base mt-1">
            <span class="text-[10px] font-medium text-slate-400 mr-0.5">S/</span>{{ parseFloat(item.precioBase).toFixed(2) }}
          </p>
        </div>
      </div>
      <div class="flex gap-2">
        <button @click="$emit('editar', item)"
          class="btn btn-sm flex-1 h-11 min-h-11 bg-emerald-50 text-lyer-green border border-emerald-100 hover:bg-lyer-green hover:text-white rounded-xl font-bold gap-2">
          <Edit3 class="w-4 h-4" /> Editar
        </button>
        <button @click="$emit('eliminar', item.id)"
          class="btn btn-sm flex-1 h-11 min-h-11 bg-red-50 text-red-500 border border-red-100 hover:bg-red-500 hover:text-white rounded-xl font-bold gap-2">
          <Trash2 class="w-4 h-4" /> Eliminar
        </button>
      </div>
    </div>
    <div v-if="!loading && items.length === 0"
      class="py-16 text-center text-slate-300 text-sm font-bold">
      No hay ítems en este catálogo.
    </div>
  </div>

  <!-- ── VISTA DESKTOP: tabla ── -->
  <div class="hidden md:block rounded-2xl border border-slate-100 overflow-hidden">
    <table class="table w-full border-separate border-spacing-0">
      <thead class="bg-slate-50/50 text-slate-400 uppercase text-[9px] font-black tracking-[0.2em] border-b">
        <tr>
          <th class="py-5 pl-8">Descripción del Ítem</th>
          <th class="w-48 text-right">Precio Base</th>
          <th class="text-center w-40 pr-8">Acciones</th>
        </tr>
      </thead>
      <tbody class="text-slate-600">
        <tr v-for="item in items" :key="item.id" class="hover:bg-emerald-50/30 transition-colors h-[70px]">
          <td class="pl-8">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-slate-100 rounded-lg group-hover:bg-white transition-colors">
                <Package v-if="tabActiva === 'materiales'" class="w-4 h-4 text-slate-400" />
                <Wrench v-else-if="tabActiva === 'servicios'" class="w-4 h-4 text-slate-400" />
                <Truck v-else class="w-4 h-4 text-slate-400" />
              </div>
              <div class="min-w-0">
                <span class="font-bold text-slate-700 capitalize">{{ item.descripcion }}</span>
                <p v-if="tabActiva === 'terceros' && item.responsable" class="text-[11px] text-slate-400 font-bold">{{ item.responsable }}</p>
              </div>
            </div>
          </td>
          <td class="text-right font-black text-lyer-green text-lg">
            <span class="text-[10px] font-medium text-slate-400 mr-1">S/</span>{{
              parseFloat(item.precioBase).toFixed(2) }}
          </td>
          <td class="text-center pr-8">
            <div class="flex justify-center gap-2">
              <button @click="$emit('editar', item)"
                class="btn btn-square btn-ghost btn-sm text-lyer-green hover:bg-lyer-green hover:text-white rounded-lg transition-all">
                <Edit3 class="w-4 h-4" />
              </button>
              <button @click="$emit('eliminar', item.id)"
                class="btn btn-square btn-ghost btn-sm text-slate-300 hover:text-red-500 rounded-lg">
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </td>
        </tr>

        <tr v-for="n in filasVacias" :key="'ghost-' + n" class="h-[70px] opacity-0 pointer-events-none">
          <td colspan="3"></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
