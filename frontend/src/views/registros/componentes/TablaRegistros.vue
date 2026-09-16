<script setup>
import { Edit3, Trash2 } from 'lucide-vue-next';

defineProps({
  tipo: { type: String, required: true },
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

defineEmits(['editar', 'eliminar']);
</script>

<template>
  <div class="overflow-x-auto min-h-[280px]">
    <div v-if="loading" class="py-16 text-center">
      <span class="loading loading-ring loading-lg text-lyer-green" />
    </div>

    <table v-else class="table w-full">
      <thead class="bg-slate-50 text-slate-400 uppercase text-[9px] font-black tracking-[0.15em]">
        <tr v-if="tipo === 'clientes'">
          <th class="pl-6">Nombre / razón social</th>
          <th>Tipo</th>
          <th>Documento</th>
          <th>Celular</th>
          <th>Órdenes</th>
          <th class="text-center pr-6">Acciones</th>
        </tr>
        <tr v-else-if="tipo === 'vehiculos'">
          <th class="pl-6">Placa</th>
          <th>Marca</th>
          <th>Modelo</th>
          <th>Km / Hor.</th>
          <th>Órdenes</th>
          <th class="text-center pr-6">Acciones</th>
        </tr>
        <tr v-else>
          <th class="pl-6">Marca</th>
          <th>Vehículos</th>
          <th class="text-center pr-6">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="tipo === 'clientes'">
          <tr v-for="c in items" :key="c.id" class="hover:bg-emerald-50/30">
            <td class="pl-6 font-black text-slate-800 uppercase text-sm">{{ c.nombreRazonSocial }}</td>
            <td class="text-xs font-bold text-slate-500">{{ c.tipoCliente }}</td>
            <td class="text-xs font-bold">{{ c.tipoDocumento }} {{ c.numeroDocumento }}</td>
            <td class="text-xs">{{ c.celular || '—' }}</td>
            <td class="text-xs font-black">{{ c._count?.ordenes ?? 0 }}</td>
            <td class="text-center pr-6">
              <button @click="$emit('editar', c)" class="btn btn-ghost btn-xs text-lyer-green"><Edit3 class="w-4 h-4" /></button>
              <button @click="$emit('eliminar', c)" class="btn btn-ghost btn-xs text-red-400"><Trash2 class="w-4 h-4" /></button>
            </td>
          </tr>
        </template>
        <template v-else-if="tipo === 'vehiculos'">
          <tr v-for="v in items" :key="v.placa" class="hover:bg-emerald-50/30">
            <td class="pl-6 font-black text-lyer-green uppercase">{{ v.placa }}</td>
            <td class="text-sm font-bold">{{ v.marca?.nombre }}</td>
            <td class="text-sm">{{ v.modelo }}</td>
            <td class="text-xs">{{ v.kilometraje ?? '—' }} / {{ v.horometro ?? '—' }}</td>
            <td class="text-xs font-black">{{ v._count?.ordenes ?? 0 }}</td>
            <td class="text-center pr-6">
              <button @click="$emit('editar', v)" class="btn btn-ghost btn-xs text-lyer-green"><Edit3 class="w-4 h-4" /></button>
              <button @click="$emit('eliminar', v)" class="btn btn-ghost btn-xs text-red-400"><Trash2 class="w-4 h-4" /></button>
            </td>
          </tr>
        </template>
        <template v-else>
          <tr v-for="m in items" :key="m.id" class="hover:bg-emerald-50/30">
            <td class="pl-6 font-black text-slate-800">{{ m.nombre }}</td>
            <td class="text-xs font-black">{{ m._count?.vehiculos ?? 0 }}</td>
            <td class="text-center pr-6">
              <button @click="$emit('editar', m)" class="btn btn-ghost btn-xs text-lyer-green"><Edit3 class="w-4 h-4" /></button>
              <button @click="$emit('eliminar', m)" class="btn btn-ghost btn-xs text-red-400"><Trash2 class="w-4 h-4" /></button>
            </td>
          </tr>
        </template>
        <tr v-if="!items.length">
          <td colspan="6" class="text-center py-12 text-slate-300 font-bold text-sm">Sin registros</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
