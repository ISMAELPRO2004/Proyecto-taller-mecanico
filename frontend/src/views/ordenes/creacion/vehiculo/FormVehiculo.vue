<script setup>
import { ref } from 'vue';
import { Car, Plus, Edit3 } from 'lucide-vue-next';

const props = defineProps({
  vehiculo: { type: Object, required: true },
  marcas: { type: Array, default: () => [] },
  errores: { type: Object, default: () => ({}) },
  bloqueado: { type: Boolean, default: false },
  puedeEditar: { type: Boolean, default: false },
});

const emit = defineEmits(['update:vehiculo', 'crear-marca', 'editar']);
const nuevaMarca = ref('');
const mostrandoNueva = ref(false);

const patch = (campo, valor) => {
  if (props.bloqueado) return;
  emit('update:vehiculo', { ...props.vehiculo, [campo]: valor });
};

const crearMarca = () => {
  if (!nuevaMarca.value.trim() || props.bloqueado) return;
  emit('crear-marca', nuevaMarca.value.trim());
  nuevaMarca.value = '';
  mostrandoNueva.value = false;
};

const campo = 'h-12 w-full rounded-xl border border-[#4a2870]/50 bg-[#140a22] px-4 text-sm text-white placeholder:text-slate-600 focus:border-lyer-cyan focus:outline-none disabled:cursor-not-allowed disabled:opacity-80';
</script>

<template>
  <section class="space-y-6">
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-2.5">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg border border-lyer-cyan/30 bg-lyer-cyan/10 text-lyer-cyan">
          <Car class="h-4 w-4" />
        </div>
        <h2 class="font-display text-base font-bold uppercase tracking-wider text-white md:text-lg">Datos del vehículo</h2>
      </div>
      <button
        v-if="bloqueado && puedeEditar"
        type="button"
        class="inline-flex items-center gap-1 text-sm font-semibold text-lyer-cyan hover:text-white"
        @click="$emit('editar')"
      >
        <Edit3 class="h-4 w-4" />
        Editar
      </button>
      <span
        v-else-if="bloqueado"
        class="rounded-md border border-lyer-cyan/30 bg-lyer-cyan/10 px-2.5 py-1 font-mono text-[11px] font-semibold tracking-wider text-lyer-cyan"
      >
        Guardado
      </span>
    </div>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div>
        <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">
          Marca
          <span class="text-lyer-accent">*</span>
        </label>
        <div class="flex items-center gap-2">
          <select
            :value="vehiculo.marcaId"
            :disabled="bloqueado"
            :class="[campo, errores.marcaId ? 'border-rose-400' : '']"
            @change="patch('marcaId', $event.target.value)"
          >
            <option value="">Seleccione marca</option>
            <option v-for="m in marcas" :key="m.id" :value="m.id">{{ m.nombre }}</option>
          </select>
          <button
            v-if="!bloqueado"
            type="button"
            title="Añadir nueva marca"
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#4a2870]/50 bg-[#2a1840] text-lyer-cyan hover:border-lyer-cyan/50"
            @click="mostrandoNueva = !mostrandoNueva"
          >
            <Plus class="h-5 w-5" />
          </button>
        </div>
        <p v-if="errores.marcaId" class="mt-1 text-xs text-rose-300">{{ errores.marcaId }}</p>
        <div v-if="mostrandoNueva && !bloqueado" class="mt-2 flex gap-2">
          <input
            v-model="nuevaMarca"
            placeholder="Nueva marca"
            :class="campo"
            @keyup.enter="crearMarca"
          />
          <button type="button" class="h-12 shrink-0 rounded-xl bg-lyer-accent px-4 text-sm font-bold text-[#1a0633]" @click="crearMarca">
            OK
          </button>
        </div>
      </div>

      <div>
        <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">
          Modelo
          <span class="text-lyer-accent">*</span>
        </label>
        <input
          :value="vehiculo.modelo"
          :disabled="bloqueado"
          placeholder="ej: Hilux 4x4"
          :class="[campo, errores.modelo ? 'border-rose-400' : '']"
          @input="patch('modelo', $event.target.value)"
        />
        <p v-if="errores.modelo" class="mt-1 text-xs text-rose-300">{{ errores.modelo }}</p>
      </div>

      <div>
        <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">Kilometraje</label>
        <div class="relative">
          <input
            :value="vehiculo.kilometraje ?? ''"
            type="number"
            :disabled="bloqueado"
            placeholder="Opcional"
            :class="[campo, 'pr-12 font-mono']"
            @input="patch('kilometraje', $event.target.value === '' ? null : $event.target.value)"
          />
          <span class="absolute right-3.5 top-3.5 font-mono text-xs font-bold text-slate-500">KM</span>
        </div>
      </div>

      <div>
        <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">Horómetro</label>
        <div class="relative">
          <input
            :value="vehiculo.horometro ?? ''"
            type="number"
            :disabled="bloqueado"
            placeholder="Opcional"
            :class="[campo, 'pr-14 font-mono']"
            @input="patch('horometro', $event.target.value === '' ? null : $event.target.value)"
          />
          <span class="absolute right-3.5 top-3.5 font-mono text-xs font-bold text-slate-500">HRS</span>
        </div>
      </div>
    </div>
  </section>
</template>
