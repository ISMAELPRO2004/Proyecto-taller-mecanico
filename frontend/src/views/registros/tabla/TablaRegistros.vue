<script setup>
import FilaCliente from '../clientes/FilaCliente.vue';
import FilaVehiculo from '../vehiculos/FilaVehiculo.vue';
import FilaMarca from '../marcas/FilaMarca.vue';

defineProps({
  tipo: { type: String, required: true },
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

defineEmits(['editar', 'eliminar']);
</script>

<template>
  <div v-if="loading" class="py-16 text-center">
    <span class="loading loading-ring loading-md text-lyer-accent" />
  </div>

  <div v-else-if="!items.length" class="py-16 text-center text-sm text-lyer-muted">
    Sin registros
  </div>

  <div v-else class="overflow-x-auto">
    <table class="w-full min-w-[760px] border-collapse text-left text-sm text-lyer-fg">
      <thead class="border-b border-lyer-linea/40 bg-lyer-panel text-[11px] font-bold uppercase tracking-wider text-lyer-muted">
        <tr v-if="tipo === 'clientes'">
          <th class="px-6 py-3.5">Nombre / razón social</th>
          <th class="px-4 py-3.5">Tipo</th>
          <th class="px-4 py-3.5">Documento</th>
          <th class="px-4 py-3.5">Celular</th>
          <th class="px-4 py-3.5">Órdenes</th>
          <th class="px-6 py-3.5 text-center">Acciones</th>
        </tr>
        <tr v-else-if="tipo === 'vehiculos'">
          <th class="px-6 py-3.5">Placa</th>
          <th class="px-4 py-3.5">Marca</th>
          <th class="px-4 py-3.5">Modelo</th>
          <th class="px-4 py-3.5">Km / horómetro</th>
          <th class="px-4 py-3.5">Órdenes</th>
          <th class="px-6 py-3.5 text-center">Acciones</th>
        </tr>
        <tr v-else>
          <th class="px-6 py-3.5">Marca</th>
          <th class="px-4 py-3.5">Vehículos</th>
          <th class="px-6 py-3.5 text-center">Acciones</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-lyer-linea/35">
        <template v-if="tipo === 'clientes'">
          <FilaCliente
            v-for="c in items"
            :key="c.id"
            :cliente="c"
            @editar="$emit('editar', $event)"
            @eliminar="$emit('eliminar', $event)"
          />
        </template>
        <template v-else-if="tipo === 'vehiculos'">
          <FilaVehiculo
            v-for="v in items"
            :key="v.placa"
            :vehiculo="v"
            @editar="$emit('editar', $event)"
            @eliminar="$emit('eliminar', $event)"
          />
        </template>
        <template v-else>
          <FilaMarca
            v-for="m in items"
            :key="m.id"
            :marca="m"
            @editar="$emit('editar', $event)"
            @eliminar="$emit('eliminar', $event)"
          />
        </template>
      </tbody>
    </table>
  </div>
</template>
