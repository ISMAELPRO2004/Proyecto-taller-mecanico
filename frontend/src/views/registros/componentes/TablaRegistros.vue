<script setup>
import { Edit3, Trash2 } from 'lucide-vue-next';

defineProps({
  tipo: { type: String, required: true },
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

defineEmits(['editar', 'eliminar']);

const accionBtn = 'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#4a2870]/50 bg-[#2a1840] transition-colors';
</script>

<template>
  <div v-if="loading" class="py-16 text-center">
    <span class="loading loading-ring loading-md text-lyer-accent" />
  </div>

  <div v-else-if="!items.length" class="py-16 text-center text-sm text-slate-400">
    Sin registros
  </div>

  <div v-else class="overflow-x-auto">
    <table class="w-full min-w-[760px] border-collapse text-left text-sm text-slate-200">
      <thead class="border-b border-[#4a2870]/40 bg-[#160a24] text-[11px] font-bold uppercase tracking-wider text-slate-400">
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
      <tbody class="divide-y divide-[#4a2870]/35">
        <template v-if="tipo === 'clientes'">
          <tr v-for="c in items" :key="c.id" class="transition-colors hover:bg-white/5">
            <td class="px-6 py-3.5 font-semibold uppercase text-white">{{ c.nombreRazonSocial }}</td>
            <td class="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-300">{{ c.tipoCliente }}</td>
            <td class="px-4 py-3.5 font-mono text-xs text-slate-200">{{ c.tipoDocumento }} {{ c.numeroDocumento }}</td>
            <td class="px-4 py-3.5 font-mono text-xs text-slate-300">{{ c.celular || '—' }}</td>
            <td class="px-4 py-3.5 font-mono text-xs font-bold text-lyer-cyan">{{ c._count?.ordenes ?? 0 }}</td>
            <td class="px-6 py-3.5">
              <div class="flex items-center justify-center gap-1.5">
                <button type="button" :class="[accionBtn, 'text-lyer-cyan hover:border-lyer-cyan/50 hover:bg-lyer-cyan/10']" title="Editar" @click="$emit('editar', c)">
                  <Edit3 class="h-4 w-4" />
                </button>
                <button type="button" :class="[accionBtn, 'text-rose-300 hover:border-rose-400/50 hover:bg-rose-500/10']" title="Eliminar" @click="$emit('eliminar', c)">
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        </template>
        <template v-else-if="tipo === 'vehiculos'">
          <tr v-for="v in items" :key="v.placa" class="transition-colors hover:bg-white/5">
            <td class="px-6 py-3.5">
              <span class="rounded-md border border-[#4a2870]/60 bg-[#140a22] px-2 py-0.5 font-mono text-xs font-bold uppercase tracking-wider text-lyer-cyan">{{ v.placa }}</span>
            </td>
            <td class="px-4 py-3.5 font-semibold text-slate-100">{{ v.marca?.nombre }}</td>
            <td class="px-4 py-3.5 text-slate-300">{{ v.modelo }}</td>
            <td class="px-4 py-3.5 font-mono text-xs text-slate-300">{{ v.kilometraje ?? '—' }} km / {{ v.horometro ?? '—' }} h</td>
            <td class="px-4 py-3.5 font-mono text-xs font-bold text-lyer-cyan">{{ v._count?.ordenes ?? 0 }}</td>
            <td class="px-6 py-3.5">
              <div class="flex items-center justify-center gap-1.5">
                <button type="button" :class="[accionBtn, 'text-lyer-cyan hover:border-lyer-cyan/50 hover:bg-lyer-cyan/10']" title="Editar" @click="$emit('editar', v)">
                  <Edit3 class="h-4 w-4" />
                </button>
                <button type="button" :class="[accionBtn, 'text-rose-300 hover:border-rose-400/50 hover:bg-rose-500/10']" title="Eliminar" @click="$emit('eliminar', v)">
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        </template>
        <template v-else>
          <tr v-for="m in items" :key="m.id" class="transition-colors hover:bg-white/5">
            <td class="px-6 py-3.5 font-semibold text-white">{{ m.nombre }}</td>
            <td class="px-4 py-3.5 font-mono text-xs font-bold text-lyer-cyan">{{ m._count?.vehiculos ?? 0 }}</td>
            <td class="px-6 py-3.5">
              <div class="flex items-center justify-center gap-1.5">
                <button type="button" :class="[accionBtn, 'text-lyer-cyan hover:border-lyer-cyan/50 hover:bg-lyer-cyan/10']" title="Editar" @click="$emit('editar', m)">
                  <Edit3 class="h-4 w-4" />
                </button>
                <button type="button" :class="[accionBtn, 'text-rose-300 hover:border-rose-400/50 hover:bg-rose-500/10']" title="Eliminar" @click="$emit('eliminar', m)">
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>
