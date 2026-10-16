<script setup>
import { Package, Wrench, Truck, Edit3, Trash2 } from 'lucide-vue-next';

defineProps({
  items: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  tabActiva: { type: String, required: true },
  filasVacias: { type: Number, default: 0 },
});

defineEmits(['editar', 'eliminar']);

const accionBtn = 'inline-flex items-center justify-center rounded-lg border border-[#4a2870]/50 bg-[#2a1840] transition-colors';
</script>

<template>
  <div v-if="loading" class="py-16 text-center">
    <span class="loading loading-ring loading-md text-lyer-accent" />
  </div>

  <div v-else-if="items.length === 0" class="py-16 text-center text-sm text-slate-400">
    No hay ítems en este catálogo.
  </div>

  <template v-else>
    <div class="divide-y divide-[#4a2870]/35 md:hidden">
      <article
        v-for="item in items"
        :key="'m-' + item.id"
        :class="['space-y-3 p-4', item.precioBase == null ? 'bg-amber-500/5' : '']"
      >
        <div class="flex items-start gap-3">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#4a2870]/50 bg-[#140a22] text-slate-400">
            <Package v-if="tabActiva === 'materiales'" class="h-4 w-4" />
            <Wrench v-else-if="tabActiva === 'servicios'" class="h-4 w-4" />
            <Truck v-else class="h-4 w-4" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold capitalize leading-snug text-white">{{ item.descripcion }}</p>
            <p v-if="tabActiva === 'terceros' && item.responsable" class="mt-0.5 text-xs text-slate-400">{{ item.responsable }}</p>
            <p class="mt-1 font-mono text-sm font-bold text-lyer-cyan">
              <template v-if="item.precioBase != null">S/ {{ parseFloat(item.precioBase).toFixed(2) }}</template>
              <span v-else class="text-xs font-bold uppercase tracking-wider text-amber-300">Sin precio</span>
            </p>
          </div>
        </div>
        <div class="flex gap-2">
          <button
            type="button"
            :class="[accionBtn, 'h-10 flex-1 gap-2 text-sm font-semibold text-lyer-cyan hover:border-lyer-cyan/50 hover:bg-lyer-cyan/10']"
            @click="$emit('editar', item)"
          >
            <Edit3 class="h-4 w-4" /> Editar
          </button>
          <button
            type="button"
            :class="[accionBtn, 'h-10 flex-1 gap-2 text-sm font-semibold text-rose-300 hover:border-rose-400/50 hover:bg-rose-500/10']"
            @click="$emit('eliminar', item.id)"
          >
            <Trash2 class="h-4 w-4" /> Eliminar
          </button>
        </div>
      </article>
    </div>

    <div class="hidden overflow-x-auto md:block">
      <table class="w-full border-collapse text-left text-sm text-slate-200">
        <thead class="border-b border-[#4a2870]/40 bg-[#160a24] text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <tr>
            <th class="px-6 py-3.5">Descripción del ítem</th>
            <th class="w-44 px-4 py-3.5 text-right">Precio base</th>
            <th class="w-36 px-6 py-3.5 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#4a2870]/35">
          <tr
            v-for="item in items"
            :key="item.id"
            :class="['h-[68px] transition-colors hover:bg-white/5', item.precioBase == null ? 'bg-amber-500/5' : '']"
          >
            <td class="px-6 py-3">
              <div class="flex items-center gap-3">
                <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#4a2870]/50 bg-[#140a22] text-slate-400">
                  <Package v-if="tabActiva === 'materiales'" class="h-4 w-4" />
                  <Wrench v-else-if="tabActiva === 'servicios'" class="h-4 w-4" />
                  <Truck v-else class="h-4 w-4" />
                </div>
                <div class="min-w-0">
                  <p class="font-semibold capitalize text-white">{{ item.descripcion }}</p>
                  <p v-if="tabActiva === 'terceros' && item.responsable" class="text-xs text-slate-400">{{ item.responsable }}</p>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 text-right font-mono text-sm font-bold">
              <template v-if="item.precioBase != null">
                <span class="mr-1 text-[10px] font-medium text-slate-400">S/</span>
                <span class="text-lyer-cyan">{{ parseFloat(item.precioBase).toFixed(2) }}</span>
              </template>
              <span v-else class="text-xs font-bold uppercase tracking-wider text-amber-300">Sin precio</span>
            </td>
            <td class="px-6 py-3">
              <div class="flex items-center justify-center gap-1.5">
                <button
                  type="button"
                  :class="[accionBtn, 'h-8 w-8 text-lyer-cyan hover:border-lyer-cyan/50 hover:bg-lyer-cyan/10']"
                  title="Editar"
                  @click="$emit('editar', item)"
                >
                  <Edit3 class="h-4 w-4" />
                </button>
                <button
                  type="button"
                  :class="[accionBtn, 'h-8 w-8 text-rose-300 hover:border-rose-400/50 hover:bg-rose-500/10']"
                  title="Eliminar"
                  @click="$emit('eliminar', item.id)"
                >
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-for="n in filasVacias" :key="'ghost-' + n" class="pointer-events-none h-[68px] opacity-0">
            <td colspan="3" />
          </tr>
        </tbody>
      </table>
    </div>
  </template>
</template>
