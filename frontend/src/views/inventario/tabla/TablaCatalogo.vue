<script setup>
import FilaCatalogo from './FilaCatalogo.vue';
import TarjetaCatalogo from './TarjetaCatalogo.vue';

defineProps({
  items: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  tabActiva: { type: String, required: true },
  filasVacias: { type: Number, default: 0 },
});

defineEmits(['editar', 'eliminar']);
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
      <TarjetaCatalogo
        v-for="item in items"
        :key="'m-' + item.id"
        :item="item"
        :tab-activa="tabActiva"
        @editar="$emit('editar', $event)"
        @eliminar="$emit('eliminar', $event)"
      />
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
          <FilaCatalogo
            v-for="item in items"
            :key="item.id"
            :item="item"
            :tab-activa="tabActiva"
            @editar="$emit('editar', $event)"
            @eliminar="$emit('eliminar', $event)"
          />
          <tr v-for="n in filasVacias" :key="'ghost-' + n" class="pointer-events-none h-[68px] opacity-0">
            <td colspan="3" />
          </tr>
        </tbody>
      </table>
    </div>
  </template>
</template>
